import { type NextRequest, NextResponse } from "next/server"
import { TwilioService } from "@/lib/twilio"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get("CallSid") as string
    const from = formData.get("From") as string
    const to = formData.get("To") as string

    console.log("Twilio voice webhook:", { callSid, from, to })

    const twimlResponse = await TwilioService.handleVoiceWebhook(callSid, from, to)

    return new NextResponse(twimlResponse, {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("Twilio voice webhook error:", error)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Service temporarily unavailable</Say><Hangup/></Response>',
      {
        headers: {
          "Content-Type": "text/xml",
        },
      },
    )
  }
}
