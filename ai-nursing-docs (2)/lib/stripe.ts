import Stripe from "stripe"
import { DatabaseService } from "./database"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export { stripe }

export class StripeService {
  // Price IDs for different plans
  static readonly PRICE_IDS = {
    basic: process.env.STRIPE_BASIC_PRICE_ID!,
    professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
  }

  // Product IDs from your Stripe account
  static readonly PRODUCT_IDS = {
    basic: "prod_SViqbAFcalsGSH",
    professional: "prod_SVirmXHvBcwdHI",
    enterprise: process.env.STRIPE_ENTERPRISE_PRODUCT_ID!, // Will be created by setup script
  }

  static async createCustomer(userData: {
    email: string
    name: string
    phone?: string
    metadata?: Record<string, string>
  }) {
    try {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        metadata: {
          source: "nursedoc_ai",
          ...userData.metadata,
        },
      })

      return customer
    } catch (error) {
      console.error("Error creating Stripe customer:", error)
      throw error
    }
  }

  static async createSubscription(customerId: string, priceId: string, trialDays = 14) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      })

      return subscription
    } catch (error) {
      console.error("Error creating subscription:", error)
      throw error
    }
  }

  static async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          trial_period_days: 14,
        },
      })

      return session
    } catch (error) {
      console.error("Error creating checkout session:", error)
      throw error
    }
  }

  static async createPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      return session
    } catch (error) {
      console.error("Error creating portal session:", error)
      throw error
    }
  }

  static async handleWebhook(body: string, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

      console.log("Stripe webhook event:", event.type)

      switch (event.type) {
        case "customer.subscription.created":
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case "invoice.payment_succeeded":
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case "invoice.payment_failed":
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { received: true }
    } catch (error) {
      console.error("Stripe webhook error:", error)
      throw error
    }
  }

  private static async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      // Find user by Stripe customer ID
      const user = await DatabaseService.query("SELECT * FROM users WHERE stripe_customer_id = $1", [
        subscription.customer as string,
      ])

      if (user.rows.length === 0) {
        console.error("User not found for customer:", subscription.customer)
        return
      }

      const userData = user.rows[0]
      const planType = this.getPlanTypeFromPriceId(subscription.items.data[0].price.id)

      // Create subscription record
      await DatabaseService.createSubscription({
        userId: userData.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        planType,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      })

      // Provision Twilio phone number
      await TwilioService.provisionPhoneNumber(userData.id)

      console.log("Subscription created for user:", userData.email)
    } catch (error) {
      console.error("Error handling subscription created:", error)
    }
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      await DatabaseService.updateSubscriptionStatus(subscription.id, subscription.status)
      console.log("Subscription updated:", subscription.id)
    } catch (error) {
      console.error("Error handling subscription updated:", error)
    }
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      await DatabaseService.updateSubscriptionStatus(subscription.id, "canceled")

      // Deprovision Twilio phone number
      const user = await DatabaseService.query(
        "SELECT u.* FROM users u JOIN subscriptions s ON u.id = s.user_id WHERE s.stripe_subscription_id = $1",
        [subscription.id],
      )

      if (user.rows.length > 0) {
        await TwilioService.deprovisionPhoneNumber(user.rows[0].id)
      }

      console.log("Subscription canceled:", subscription.id)
    } catch (error) {
      console.error("Error handling subscription deleted:", error)
    }
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log("Payment succeeded for invoice:", invoice.id)
    // Handle successful payment (send receipt, update records, etc.)
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log("Payment failed for invoice:", invoice.id)
    // Handle failed payment (send notification, update status, etc.)
  }

  private static getPlanTypeFromPriceId(priceId: string): string {
    if (priceId === this.PRICE_IDS.basic) return "basic"
    if (priceId === this.PRICE_IDS.professional) return "professional"
    if (priceId === this.PRICE_IDS.enterprise) return "enterprise"
    return "unknown"
  }
}

// Import TwilioService (we'll create this next)
import { TwilioService } from "./twilio"
