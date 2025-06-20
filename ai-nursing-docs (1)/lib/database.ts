import { Pool } from "pg"

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export { pool }

// Database utility functions
export class DatabaseService {
  static async query(text: string, params?: any[]) {
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  static async transaction(callback: (client: any) => Promise<any>) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  // User operations
  static async createUser(userData: {
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    nursingLicense: string
    specialty?: string
    personalPhone: string
  }) {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, nursing_license, specialty, personal_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name, last_name, created_at
    `
    const values = [
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.nursingLicense,
      userData.specialty,
      userData.personalPhone,
    ]

    const result = await this.query(query, values)
    return result.rows[0]
  }

  static async getUserByEmail(email: string) {
    const query = "SELECT * FROM users WHERE email = $1 AND is_active = true"
    const result = await this.query(query, [email])
    return result.rows[0]
  }

  static async updateUserTwilioPhone(userId: string, phoneNumber: string) {
    const query = "UPDATE users SET twilio_phone_number = $1, updated_at = NOW() WHERE id = $2"
    await this.query(query, [phoneNumber, userId])
  }

  static async updateUserStripeCustomer(userId: string, stripeCustomerId: string) {
    const query = "UPDATE users SET stripe_customer_id = $1, updated_at = NOW() WHERE id = $2"
    await this.query(query, [stripeCustomerId, userId])
  }

  // Subscription operations
  static async createSubscription(subscriptionData: {
    userId: string
    stripeSubscriptionId: string
    stripePriceId: string
    planType: string
    status: string
    currentPeriodStart: Date
    currentPeriodEnd: Date
  }) {
    const query = `
      INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_price_id, plan_type, status, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const values = [
      subscriptionData.userId,
      subscriptionData.stripeSubscriptionId,
      subscriptionData.stripePriceId,
      subscriptionData.planType,
      subscriptionData.status,
      subscriptionData.currentPeriodStart,
      subscriptionData.currentPeriodEnd,
    ]

    const result = await this.query(query, values)
    return result.rows[0]
  }

  static async updateSubscriptionStatus(stripeSubscriptionId: string, status: string) {
    const query = "UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE stripe_subscription_id = $2"
    await this.query(query, [status, stripeSubscriptionId])
  }

  // Call operations
  static async createCall(callData: {
    userId: string
    twilioCallSid: string
    fromNumber: string
    toNumber: string
    callStartedAt: Date
  }) {
    const query = `
      INSERT INTO calls (user_id, twilio_call_sid, from_number, to_number, call_started_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const values = [
      callData.userId,
      callData.twilioCallSid,
      callData.fromNumber,
      callData.toNumber,
      callData.callStartedAt,
    ]

    const result = await this.query(query, values)
    return result.rows[0]
  }

  static async updateCallRecording(callSid: string, recordingUrl: string, duration: number) {
    const query = `
      UPDATE calls 
      SET recording_url = $1, recording_duration = $2, processing_status = 'processing', updated_at = NOW()
      WHERE twilio_call_sid = $3
    `
    await this.query(query, [recordingUrl, duration, callSid])
  }

  static async updateCallTranscription(callSid: string, transcription: string) {
    const query = `
      UPDATE calls 
      SET transcription = $1, updated_at = NOW()
      WHERE twilio_call_sid = $2
    `
    await this.query(query, [transcription, callSid])
  }

  static async updateCallSOAPNote(callSid: string, soapNote: string) {
    const query = `
      UPDATE calls 
      SET soap_note = $1, processing_status = 'completed', updated_at = NOW()
      WHERE twilio_call_sid = $2
    `
    await this.query(query, [soapNote, callSid])
  }

  static async markEmailSent(callSid: string) {
    const query = `
      UPDATE calls 
      SET email_sent = true, email_sent_at = NOW(), updated_at = NOW()
      WHERE twilio_call_sid = $1
    `
    await this.query(query, [callSid])
  }

  static async getUserCalls(userId: string, limit = 50) {
    const query = `
      SELECT * FROM calls 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `
    const result = await this.query(query, [userId, limit])
    return result.rows
  }

  // Audit logging
  static async logAction(logData: {
    userId?: string
    action: string
    resourceType?: string
    resourceId?: string
    ipAddress?: string
    userAgent?: string
    metadata?: any
  }) {
    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
    const values = [
      logData.userId || null,
      logData.action,
      logData.resourceType || null,
      logData.resourceId || null,
      logData.ipAddress || null,
      logData.userAgent || null,
      logData.metadata ? JSON.stringify(logData.metadata) : null,
    ]

    await this.query(query, values)
  }
}
