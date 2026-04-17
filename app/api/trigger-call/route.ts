import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    const agentId = process.env.ELEVENLABS_AGENT_ID
    const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID

    if (!apiKey || !agentId || !phoneNumberId) {
      return NextResponse.json(
        {
          error:
            "ElevenLabs credentials not configured. Please set ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, and ELEVENLABS_PHONE_NUMBER_ID in .env.local",
        },
        { status: 500 }
      )
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          agent_phone_number_id: phoneNumberId,
          to_number: phoneNumber,
          conversation_config_override: {
            agent: {
              prompt: {
                prompt: `You are Callsy, an AI-powered customer success agent for a B2B SaaS platform called "Callsy Demo".

You are calling because the customer just clicked the "Cancel Subscription" button on the platform. Your job is to understand why they want to cancel and genuinely help them — not to be pushy or scripted.

IMPORTANT: Start the conversation in Turkish. If the customer prefers English, immediately switch.

Opening line in Turkish:
"Merhaba! Ben Callsy, müşteri başarı asistanınızım. Aboneliğinizi iptal etmek istediğinizi gördüm ve sizi aramak istedim. Birkaç dakikanız var mı?"

If they say yes, continue in Turkish:
"Harika! Öncelikle şunu sormak istiyorum — sizi en çok ne rahatsız etti? Fiyat mı, kullanım zorluğu mu, yoksa farklı bir şey mi?"

Behavior guidelines:
- If pricing concern: Acknowledge the concern, highlight the value they've received, offer to connect them with a human CSM to discuss options
- If technical/usability issue: Apologize sincerely, offer immediate escalation to support, mention this is exactly what Callsy is designed to catch early
- If low usage: Offer a free 30-minute guided session to help them get real value from the platform
- If they're firmly decided: Respect the decision, wish them well professionally, note the door is always open

Keep it natural, empathetic, and brief. This is a live demonstration of Callsy's autonomous customer success capabilities. After the call, all outcomes are automatically logged to the CRM.`,
              },
              first_message:
                "Merhaba! Ben Callsy, müşteri başarı asistanınızım. Aboneliğinizi iptal etmek istediğinizi gördüm ve sizi aramak istedim. Birkaç dakikanız var mı?",
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ElevenLabs API error:", response.status, errorText)
      return NextResponse.json(
        { error: `ElevenLabs API error (${response.status}): ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, callSid: data.callSid ?? data.call_sid })
  } catch (error) {
    console.error("trigger-call error:", error)
    return NextResponse.json(
      { error: "Internal server error while triggering call" },
      { status: 500 }
    )
  }
}
