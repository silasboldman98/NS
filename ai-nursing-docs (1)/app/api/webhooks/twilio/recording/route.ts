import { type NextRequest, NextResponse } from "next/server"
import { TwilioService } from "@/lib/twilio"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get("CallSid") as string
    const recordingUrl = formData.get("RecordingUrl") as string
    const recordingDuration = formData.get("RecordingDuration") as string

    console.log("Twilio recording webhook:", { callSid, recordingUrl, recordingDuration })

    await TwilioService.handleRecordingWebhook(callSid, recordingUrl, recordingDuration)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Twilio recording webhook error:", error)
    return NextResponse.json({ error: "Recording webhook processing failed" }, { status: 500 })
  }
}
