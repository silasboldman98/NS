import twilio from "twilio"
import { DatabaseService } from "./database"

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

export { client as twilioClient }

export class TwilioService {
  static async provisionPhoneNumber(userId: string): Promise<string> {
    try {
      // Search for available phone numbers
      const availableNumbers = await client.availablePhoneNumbers("US").local.list({
        limit: 1,
        voiceEnabled: true,
      })

      if (availableNumbers.length === 0) {
        throw new Error("No available phone numbers")
      }

      // Purchase the phone number
      const phoneNumber = await client.incomingPhoneNumbers.create({
        phoneNumber: availableNumbers[0].phoneNumber,
        voiceUrl: `${process.env.APP_URL}/api/webhooks/twilio/voice`,
        voiceMethod: "POST",
        statusCallback: `${process.env.APP_URL}/api/webhooks/twilio/status`,
        statusCallbackMethod: "POST",
      })

      // Update user record with Twilio phone number
      await DatabaseService.updateUserTwilioPhone(userId, phoneNumber.phoneNumber)

      console.log("Phone number provisioned:", phoneNumber.phoneNumber, "for user:", userId)
      return phoneNumber.phoneNumber
    } catch (error) {
      console.error("Error provisioning phone number:", error)
      throw error
    }
  }

  static async deprovisionPhoneNumber(userId: string): Promise<void> {
    try {
      // Get user's Twilio phone number
      const user = await DatabaseService.query("SELECT twilio_phone_number FROM users WHERE id = $1", [userId])

      if (user.rows.length === 0 || !user.rows[0].twilio_phone_number) {
        return
      }

      const phoneNumber = user.rows[0].twilio_phone_number

      // Find and release the phone number
      const incomingNumbers = await client.incomingPhoneNumbers.list({
        phoneNumber: phoneNumber,
      })

      if (incomingNumbers.length > 0) {
        await client.incomingPhoneNumbers(incomingNumbers[0].sid).remove()
      }

      // Clear phone number from user record
      await DatabaseService.updateUserTwilioPhone(userId, "")

      console.log("Phone number deprovisioned:", phoneNumber, "for user:", userId)
    } catch (error) {
      console.error("Error deprovisioning phone number:", error)
      throw error
    }
  }

  static async handleVoiceWebhook(callSid: string, from: string, to: string) {
    try {
      // Find user by Twilio phone number
      const user = await DatabaseService.query("SELECT * FROM users WHERE twilio_phone_number = $1", [to])

      if (user.rows.length === 0) {
        console.error("User not found for phone number:", to)
        return this.generateRejectTwiML()
      }

      const userData = user.rows[0]

      // Create call record
      await DatabaseService.createCall({
        userId: userData.id,
        twilioCallSid: callSid,
        fromNumber: from,
        toNumber: to,
        callStartedAt: new Date(),
      })

      // Generate TwiML to forward call and record
      return this.generateForwardTwiML(userData.personal_phone)
    } catch (error) {
      console.error("Error handling voice webhook:", error)
      return this.generateRejectTwiML()
    }
  }

  static async handleRecordingWebhook(callSid: string, recordingUrl: string, recordingDuration: string) {
    try {
      // Update call record with recording info
      await DatabaseService.updateCallRecording(callSid, recordingUrl, Number.parseInt(recordingDuration))

      // Trigger AI processing
      await AIProcessingService.processCallRecording(callSid, recordingUrl)

      console.log("Recording webhook processed for call:", callSid)
    } catch (error) {
      console.error("Error handling recording webhook:", error)
    }
  }

  private static generateForwardTwiML(personalPhone: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial record="record-from-answer" recordingStatusCallback="${process.env.APP_URL}/api/webhooks/twilio/recording">
        <Number>${personalPhone}</Number>
    </Dial>
</Response>`
  }

  private static generateRejectTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>I'm sorry, this number is not currently available. Please try again later.</Say>
    <Hangup/>
</Response>`
  }

  static async sendSMS(to: string, message: string): Promise<void> {
    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: to,
      })
    } catch (error) {
      console.error("Error sending SMS:", error)
      throw error
    }
  }
}

// Import AIProcessingService (we'll create this next)
import { AIProcessingService } from "./ai-processing"
