import OpenAI from "openai"
import { DatabaseService } from "./database"
import { EmailService } from "./email"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export class AIProcessingService {
  static async processCallRecording(callSid: string, recordingUrl: string): Promise<void> {
    try {
      console.log("Starting AI processing for call:", callSid)

      // Step 1: Download and transcribe audio
      const transcription = await this.transcribeAudio(recordingUrl)
      await DatabaseService.updateCallTranscription(callSid, transcription)

      // Step 2: Generate SOAP note
      const soapNote = await this.generateSOAPNote(transcription)
      await DatabaseService.updateCallSOAPNote(callSid, soapNote)

      // Step 3: Send email to nurse
      await this.sendSOAPEmail(callSid, soapNote)

      console.log("AI processing completed for call:", callSid)
    } catch (error) {
      console.error("Error in AI processing:", error)

      // Update call status to failed
      await DatabaseService.query("UPDATE calls SET processing_status = $1 WHERE twilio_call_sid = $2", [
        "failed",
        callSid,
      ])
    }
  }

  private static async transcribeAudio(recordingUrl: string): Promise<string> {
    try {
      // Download audio file
      const response = await fetch(recordingUrl)
      const audioBuffer = await response.arrayBuffer()

      // Create a File object for OpenAI
      const audioFile = new File([audioBuffer], "recording.mp3", { type: "audio/mpeg" })

      // Transcribe with Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "en",
        response_format: "text",
      })

      return transcription
    } catch (error) {
      console.error("Error transcribing audio:", error)
      throw error
    }
  }

  private static async generateSOAPNote(transcription: string): Promise<string> {
    try {
      const prompt = `
You are an expert nursing documentation assistant. Based on the following patient call transcription, generate a professional SOAP note following standard nursing documentation practices.

TRANSCRIPTION:
${transcription}

Please generate a comprehensive SOAP note with the following sections:
- SUBJECTIVE: Patient's reported symptoms, concerns, and history
- OBJECTIVE: Observable data, vital signs mentioned, and clinical findings
- ASSESSMENT: Clinical judgment and nursing diagnoses
- PLAN: Interventions, recommendations, and follow-up care

Format the note professionally and include appropriate nursing terminology. Ensure all clinical recommendations are within nursing scope of practice.

SOAP NOTE:
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a professional nursing documentation assistant with expertise in creating accurate, comprehensive SOAP notes that meet healthcare documentation standards.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      })

      const soapNote = completion.choices[0].message.content || ""
      return soapNote
    } catch (error) {
      console.error("Error generating SOAP note:", error)
      throw error
    }
  }

  private static async sendSOAPEmail(callSid: string, soapNote: string): Promise<void> {
    try {
      // Get call and user information
      const callData = await DatabaseService.query(
        `
        SELECT c.*, u.email, u.first_name, u.last_name, u.twilio_phone_number
        FROM calls c
        JOIN users u ON c.user_id = u.id
        WHERE c.twilio_call_sid = $1
      `,
        [callSid],
      )

      if (callData.rows.length === 0) {
        throw new Error("Call data not found")
      }

      const call = callData.rows[0]

      // Send email with SOAP note
      await EmailService.sendSOAPNote({
        to: call.email,
        nurseName: `${call.first_name} ${call.last_name}`,
        callSid: callSid,
        callDate: call.created_at,
        soapNote: soapNote,
        nursePhone: call.twilio_phone_number,
      })

      // Mark email as sent
      await DatabaseService.markEmailSent(callSid)

      console.log("SOAP note email sent for call:", callSid)
    } catch (error) {
      console.error("Error sending SOAP email:", error)
      throw error
    }
  }
}
