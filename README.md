# Callsy Demo

An interactive live demo of **Callsy** — an autonomous Voice AI platform for B2B customer success. The demo visualizes the full CRM-to-call pipeline and lets you trigger a real outbound AI voice call from the browser.

**Live URL:** [https://v0-shadcn-dashboard-rho-six.vercel.app](https://v0-shadcn-dashboard-rho-six.vercel.app)

---

## What it does

Callsy prevents churn by proactively calling customers when specific CRM signals trigger — low engagement, renewal windows, payment failures, inactivity, and more. This demo showcases that core workflow end-to-end:

- **Overview** — Live KPI cards: active accounts, AI calls today, churn prevented, ARR protected
- **Callsy Platform** — Simulated CRM live feed, trigger engine (5 active monitors), and AI call activity log — all auto-updating in real time
- **Churn Prevention Demo** — 3-step interactive flow: sign up as a mock customer → view your account → hit "Cancel Subscription" → receive a real AI voice call on your phone

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Voice AI:** ElevenLabs Conversational AI (Turkish-first agent)
- **Telephony:** Twilio (outbound call via ElevenLabs API)
- **Deployment:** Vercel

---

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Create a `.env.local` file (or set these in Vercel → Settings → Environment Variables):

```env
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...
ELEVENLABS_PHONE_NUMBER_ID=phnum_...
```

| Variable | Where to get it |
|---|---|
| `ELEVENLABS_API_KEY` | [elevenlabs.io → Settings → API Keys](https://elevenlabs.io/app/settings/api-keys) |
| `ELEVENLABS_AGENT_ID` | [elevenlabs.io → Conversational AI → your agent → Settings](https://elevenlabs.io/app/conversational-ai) |
| `ELEVENLABS_PHONE_NUMBER_ID` | ElevenLabs agent → Phone Numbers → connect a Twilio number → copy the ID shown |

The demo runs fully without these — only the real call button requires them.

### Twilio setup

1. Sign up at [twilio.com](https://twilio.com) and buy a voice-enabled number (a US +1 number works globally and is cheapest)
2. In ElevenLabs agent settings → **Phone Numbers** → connect your Twilio number (you'll need your Twilio Account SID + Auth Token)
3. Copy the Phone Number ID shown in ElevenLabs and paste it as `ELEVENLABS_PHONE_NUMBER_ID`

---

## Deploying to Vercel

```bash
npx vercel --prod
```

To update an environment variable cleanly (no newline issues):

```bash
npx vercel env add ELEVENLABS_AGENT_ID production --value "agent_..." --yes --force
```

---

## Project structure

```
app/
  dashboard/page.tsx      # Main dashboard page
  api/trigger-call/       # POST endpoint — triggers outbound ElevenLabs call
components/
  callsy-demo.tsx         # Full demo UI (KPI cards, CRM feed, trigger engine, call log, live demo)
  app-sidebar.tsx         # Left navigation sidebar
  site-header.tsx         # Top header with dark mode toggle
```

---

## Agent prompt

The ElevenLabs agent is configured to:
- Greet the customer in Turkish first, switch to English if preferred
- Ask why they want to cancel and offer tailored solutions
- Escalate to a human CSM if the issue can't be resolved
- Log the outcome back to CRM automatically

Opening line: *"Merhaba! Ben Callsy, müşteri başarı asistanınızım. Aboneliğinizi iptal etmek istediğinizi gördüm ve sizi aramak istedim. Birkaç dakikanız var mı?"*
