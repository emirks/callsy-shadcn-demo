"use client"

import * as React from "react"
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBolt,
  IconCalendar,
  IconCheck,
  IconCircleCheckFilled,
  IconClock,
  IconCreditCard,
  IconLoader,
  IconPhone,
  IconPhoneCall,
  IconPhoneOff,
  IconPlus,
  IconStar,
  IconTrendingDown,
  IconTrendingUp,
  IconUserPlus,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

type CrmEventType = "signup" | "usage_drop" | "renewal" | "inactivity" | "payment" | "nps" | "upgrade"
type CallStatus = "scheduled" | "calling" | "completed" | "no_answer" | "escalated"
type CallType = "onboarding" | "health_check" | "renewal" | "recovery" | "retention"

interface CrmEvent {
  id: string
  timestamp: Date
  company: string
  event: string
  type: CrmEventType
  city: string
  triggerFired?: string
  isNew?: boolean
}

interface Trigger {
  id: string
  name: string
  condition: string
  eventTypes: CrmEventType[]
  callType: CallType
  callsToday: number
  lastFired?: Date
  status: "active" | "firing"
}

interface Call {
  id: string
  company: string
  contact: string
  type: CallType
  status: CallStatus
  startTime: Date
  duration?: number
  outcome?: string
  isNew?: boolean
}

interface DemoStats {
  activeAccounts: number
  callsToday: number
  churnPrevented: number
  arrProtected: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const CRM_EVENTS_POOL: Array<Omit<CrmEvent, "id" | "timestamp" | "isNew">> = [
  { company: "Meridian Analytics", event: "New account created — Growth plan activated", type: "signup", city: "Austin" },
  { company: "Stackline Inc.", event: "Weekly feature usage dropped 67% vs. last period", type: "usage_drop", city: "Seattle" },
  { company: "DataFlow Ltd.", event: "Contract renewal in 58 days — ARR $12,400", type: "renewal", city: "Chicago" },
  { company: "CloudNova", event: "No platform login detected in 18 days", type: "inactivity", city: "Denver" },
  { company: "Launchpad HQ", event: "Payment failed — attempt 2 of 3, card declined", type: "payment", city: "New York" },
  { company: "Orion Digital", event: "Onboarding stuck at 12% — day 5 since signup", type: "usage_drop", city: "Boston" },
  { company: "Finbridge Corp.", event: "NPS survey response received: 5/10 (detractor)", type: "nps", city: "San Francisco" },
  { company: "EduScale", event: "Plan upgraded: Starter → Growth, 12 seats added", type: "upgrade", city: "Atlanta" },
  { company: "Logix Pro", event: "Support ticket volume increased 280% this week", type: "usage_drop", city: "Dallas" },
  { company: "Vertex SaaS", event: "New account created — Starter plan", type: "signup", city: "Miami" },
  { company: "PulseHealth Tech", event: "API call volume dropped 91% in last 48 hours", type: "usage_drop", city: "Boston" },
  { company: "Bridgepoint Co.", event: "Contract renewal in 45 days — ARR $8,200", type: "renewal", city: "London" },
  { company: "RetailCloud", event: "Last login was 21 days ago, no activity since", type: "inactivity", city: "Portland" },
  { company: "Fieldstone Labs", event: "New account created — Enterprise trial started", type: "signup", city: "Toronto" },
  { company: "CipherGuard", event: "Monthly active users dropped 55% vs. last month", type: "usage_drop", city: "Chicago" },
]

const INITIAL_TRIGGERS: Trigger[] = [
  {
    id: "t1",
    name: "New Signup Onboarding",
    condition: "account_status = 'new_signup'",
    eventTypes: ["signup", "upgrade"],
    callType: "onboarding",
    callsToday: 4,
    lastFired: new Date(Date.now() - 1000 * 60 * 23),
    status: "active",
  },
  {
    id: "t2",
    name: "Low Engagement Alert",
    condition: "weekly_usage_drop > 30%",
    eventTypes: ["usage_drop", "nps"],
    callType: "health_check",
    callsToday: 7,
    lastFired: new Date(Date.now() - 1000 * 60 * 8),
    status: "active",
  },
  {
    id: "t3",
    name: "Renewal Window",
    condition: "days_to_renewal ≤ 60",
    eventTypes: ["renewal"],
    callType: "renewal",
    callsToday: 3,
    lastFired: new Date(Date.now() - 1000 * 60 * 41),
    status: "active",
  },
  {
    id: "t4",
    name: "Inactivity Recovery",
    condition: "no_login_days ≥ 14",
    eventTypes: ["inactivity"],
    callType: "health_check",
    callsToday: 5,
    lastFired: new Date(Date.now() - 1000 * 60 * 15),
    status: "active",
  },
  {
    id: "t5",
    name: "Payment Recovery",
    condition: "payment_failed AND retry_count < 3",
    eventTypes: ["payment"],
    callType: "recovery",
    callsToday: 2,
    lastFired: new Date(Date.now() - 1000 * 60 * 67),
    status: "active",
  },
]

const CONTACTS: Record<string, string> = {
  "Meridian Analytics": "James Carter",
  "Stackline Inc.": "Rachel Kim",
  "DataFlow Ltd.": "Marcus Weber",
  "CloudNova": "Daniel Brooks",
  "Launchpad HQ": "Emma Schulz",
  "Orion Digital": "Tyler Hughes",
  "Finbridge Corp.": "Priya Nair",
  "EduScale": "Connor Walsh",
  "Logix Pro": "Sarah Mitchell",
  "Vertex SaaS": "Noah Rivera",
  "PulseHealth Tech": "Olivia Grant",
  "Bridgepoint Co.": "Sofia Mueller",
  "RetailCloud": "Ethan Park",
  "Fieldstone Labs": "Maya Patel",
  "CipherGuard": "Alex Turner",
}

const OUTCOMES: Record<CallType, Record<CallStatus, string>> = {
  onboarding: {
    scheduled: "",
    calling: "",
    completed: "Setup complete — 4 core features activated",
    no_answer: "No answer — rescheduled for tomorrow at 10am",
    escalated: "Technical issue detected — escalated to CSM",
  },
  health_check: {
    scheduled: "",
    calling: "",
    completed: "Friction point identified — support ticket created",
    no_answer: "Voicemail left — follow-up email queued",
    escalated: "High churn risk — escalated to CSM immediately",
  },
  renewal: {
    scheduled: "",
    calling: "",
    completed: "NPS collected: 8/10 — renewal intent confirmed",
    no_answer: "No answer — renewal email sequence triggered",
    escalated: "Churn risk detected — renewal team notified",
  },
  recovery: {
    scheduled: "",
    calling: "",
    completed: "Payment updated — account fully reactivated",
    no_answer: "No answer — automated retry in 24 hours",
    escalated: "Critical billing issue — billing team alerted",
  },
  retention: {
    scheduled: "",
    calling: "",
    completed: "Customer retained — concern logged to CRM",
    no_answer: "No answer — retention follow-up scheduled",
    escalated: "Cancellation risk — CSM emergency notified",
  },
}

const INITIAL_CRM_EVENTS: CrmEvent[] = [
  {
    id: "ie1",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    company: "Nexlayer Inc.",
    event: "NPS response: 4/10 — contract expires in 30 days",
    type: "renewal",
    city: "San Francisco",
    triggerFired: "Renewal Window",
  },
  {
    id: "ie2",
    timestamp: new Date(Date.now() - 1000 * 60 * 7),
    company: "DevHub",
    event: "New account created — Starter plan activated",
    type: "signup",
    city: "Austin",
    triggerFired: "New Signup Onboarding",
  },
  {
    id: "ie3",
    timestamp: new Date(Date.now() - 1000 * 60 * 11),
    company: "Commerce Hub",
    event: "Monthly active users dropped 45% vs. last month",
    type: "usage_drop",
    city: "New York",
    triggerFired: "Low Engagement Alert",
  },
  {
    id: "ie4",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    company: "Granite Systems",
    event: "Payment failed — retry attempt 1 of 3",
    type: "payment",
    city: "Chicago",
    triggerFired: "Payment Recovery",
  },
]

const INITIAL_CALLS: Call[] = [
  {
    id: "c0",
    company: "Commerce Hub",
    contact: "Ryan Foster",
    type: "health_check",
    status: "completed",
    startTime: new Date(Date.now() - 1000 * 60 * 9),
    duration: 187,
    outcome: "Friction point identified — support ticket created",
  },
  {
    id: "c1",
    company: "Nexlayer Inc.",
    contact: "Lauren Hayes",
    type: "renewal",
    status: "escalated",
    startTime: new Date(Date.now() - 1000 * 60 * 14),
    duration: 312,
    outcome: "Churn risk detected — renewal team notified",
  },
  {
    id: "c2",
    company: "DevHub",
    contact: "Chris Donovan",
    type: "onboarding",
    status: "completed",
    startTime: new Date(Date.now() - 1000 * 60 * 22),
    duration: 243,
    outcome: "Setup complete — 4 core features activated",
  },
  {
    id: "c3",
    company: "Granite Systems",
    contact: "Megan Clarke",
    type: "recovery",
    status: "no_answer",
    startTime: new Date(Date.now() - 1000 * 60 * 31),
    outcome: "No answer — automated retry in 24 hours",
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function getCallTypeLabel(type: CallType): string {
  return {
    onboarding: "Onboarding",
    health_check: "Health Check",
    renewal: "Renewal Prep",
    recovery: "Payment Recovery",
    retention: "Retention",
  }[type]
}

function getCallTypeBadgeClass(type: CallType): string {
  return {
    onboarding: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    health_check: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    renewal: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    recovery: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    retention: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
  }[type]
}

function getCrmEventColor(type: CrmEventType): string {
  return {
    signup: "text-emerald-600 dark:text-emerald-400",
    usage_drop: "text-red-500 dark:text-red-400",
    renewal: "text-blue-600 dark:text-blue-400",
    inactivity: "text-orange-500 dark:text-orange-400",
    payment: "text-red-600 dark:text-red-400",
    nps: "text-amber-500 dark:text-amber-400",
    upgrade: "text-emerald-600 dark:text-emerald-400",
  }[type]
}

function CrmEventIcon({ type }: { type: CrmEventType }) {
  const cls = "size-4 shrink-0 " + getCrmEventColor(type)
  switch (type) {
    case "signup": return <IconUserPlus className={cls} />
    case "usage_drop": return <IconTrendingDown className={cls} />
    case "renewal": return <IconCalendar className={cls} />
    case "inactivity": return <IconClock className={cls} />
    case "payment": return <IconCreditCard className={cls} />
    case "nps": return <IconStar className={cls} />
    case "upgrade": return <IconTrendingUp className={cls} />
  }
}

function CallStatusBadge({ status }: { status: CallStatus }) {
  switch (status) {
    case "scheduled":
      return (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <IconClock className="size-3" />
          Scheduled
        </Badge>
      )
    case "calling":
      return (
        <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex size-full rounded-full bg-amber-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
          </span>
          Calling
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <IconCircleCheckFilled className="size-3 fill-emerald-500" />
          Completed
        </Badge>
      )
    case "no_answer":
      return (
        <Badge variant="outline" className="gap-1 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
          <IconPhoneOff className="size-3" />
          No Answer
        </Badge>
      )
    case "escalated":
      return (
        <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <IconAlertTriangle className="size-3" />
          Escalated
        </Badge>
      )
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatsCards({ stats }: { stats: DemoStats }) {
  const cards = [
    {
      label: "Active Accounts",
      value: stats.activeAccounts.toLocaleString(),
      sub: "All plans combined",
      badge: "+5 this week",
      icon: <IconTrendingUp className="size-3.5 text-blue-500" />,
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "AI Calls Today",
      value: String(stats.callsToday),
      sub: "Zero headcount",
      badge: "+34% avg",
      icon: <IconPhoneCall className="size-3.5 text-indigo-500" />,
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Churn Prevented",
      value: `${stats.churnPrevented} accts`,
      sub: "This month",
      badge: "Silent churn caught",
      icon: <IconCheck className="size-3.5 text-emerald-500" />,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "ARR Protected",
      value: `$${(stats.arrProtected / 1000).toFixed(0)}K`,
      sub: "From churn prevention",
      badge: "This month",
      icon: <IconArrowUpRight className="size-3.5 text-violet-500" />,
      accent: "text-violet-600 dark:text-violet-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <span className="flex size-6 items-center justify-center rounded-md bg-muted">
                {card.icon}
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{card.value}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">{card.sub}</p>
              <span className={cn("text-[10px] font-semibold", card.accent)}>{card.badge}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CrmActivityFeed({ events }: { events: CrmEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          CRM Live Feed
        </CardTitle>
        <CardDescription>Real-time account signal stream from your CRM</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[520px]">
          <div className="flex flex-col">
            {events.map((event, idx) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-3 px-6 py-3 transition-all",
                  idx === 0 && "animate-in fade-in slide-in-from-top-2 duration-500",
                  idx !== events.length - 1 && "border-b"
                )}
              >
                <div className="mt-0.5">
                  <CrmEventIcon type={event.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{event.company}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{event.event}</p>
                  {event.triggerFired && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <IconBolt className="size-3 text-amber-500" />
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Trigger fired: {event.triggerFired}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function TriggerEngine({ triggers }: { triggers: Trigger[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBolt className="size-4 text-amber-500" />
          Trigger Engine
        </CardTitle>
        <CardDescription>Active monitors watching your CRM signals</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        {triggers.map((trigger) => (
          <div
            key={trigger.id}
            className={cn(
              "rounded-lg border p-3 transition-all duration-300",
              trigger.status === "firing"
                ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50 shadow-sm"
                : "bg-muted/30"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex size-2 shrink-0 mt-0.5">
                  {trigger.status === "firing" ? (
                    <>
                      <span className="animate-ping absolute inline-flex size-full rounded-full bg-amber-500 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                    </>
                  ) : (
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  )}
                </span>
                <p className="text-sm font-medium truncate">{trigger.name}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs tabular-nums">
                {trigger.callsToday} today
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 ml-4 font-mono">
              {trigger.condition}
            </p>
            {trigger.lastFired && (
              <p className="text-xs text-muted-foreground mt-1 ml-4">
                Last fired: {formatTimeAgo(trigger.lastFired)}
              </p>
            )}
            {trigger.status === "firing" && (
              <div className="mt-2 ml-4 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
                <IconLoader className="size-3 animate-spin" />
                Scheduling call…
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function CallLogTable({ calls }: { calls: Call[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconPhoneCall className="size-4" />
          AI Call Activity
        </CardTitle>
        <CardDescription>Live outbound call log — updates in real time</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[320px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b bg-muted/80">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Company</th>
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Call Type</th>
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Started</th>
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Duration</th>
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, idx) => (
                <tr
                  key={call.id}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/30 transition-colors",
                    idx === 0 && call.isNew && "animate-in fade-in slide-in-from-top-2 duration-500"
                  )}
                >
                  <td className="py-3 px-4 font-medium">{call.company}</td>
                  <td className="py-3 px-4 text-muted-foreground">{call.contact}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getCallTypeBadgeClass(call.type))}
                    >
                      {getCallTypeLabel(call.type)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <CallStatusBadge status={call.status} />
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {formatTimeAgo(call.startTime)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs tabular-nums">
                    {call.duration ? formatDuration(call.duration) : call.status === "calling" ? (
                      <span className="text-amber-600">In progress</span>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs max-w-[240px] truncate">
                    {call.outcome || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function LiveDemoCard() {
  const [demoStep, setDemoStep] = React.useState<"signup" | "account" | "calling" | "done">("signup")
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("+90")
  const [isLoading, setIsLoading] = React.useState(false)

  const stepIndex = { signup: 0, account: 1, calling: 2, done: 3 }[demoStep]

  const STEPS = [
    { id: "signup", label: "Sign Up" },
    { id: "account", label: "Your Account" },
    { id: "calling", label: "Callsy Responds" },
  ]

  const handleSignup = () => {
    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number (e.g. +905xxxxxxxxx)")
      return
    }
    setDemoStep("account")
    toast.success(`Welcome, ${name.split(" ")[0]}! Your trial account is ready.`)
  }

  const handleCancel = async () => {
    setDemoStep("calling")
    setIsLoading(true)
    try {
      const res = await fetch("/api/trigger-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(`Call failed: ${data.error || "Unknown error"}`, { duration: 6000 })
        setDemoStep("account")
        return
      }
      setTimeout(() => setDemoStep("done"), 3000)
    } catch {
      toast.error("Network error — check if the server is running")
      setDemoStep("account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-emerald-200/80 dark:border-emerald-800/50 bg-gradient-to-b from-emerald-50/60 to-card dark:from-emerald-950/20 dark:to-card">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <IconPhone className="size-4" />
          </span>
          <div className="flex-1">
            <CardTitle className="text-lg">Churn Prevention — Try It Live</CardTitle>
            <CardDescription className="mt-1 text-sm leading-relaxed max-w-2xl">
              Sign up as a mock customer, then hit <strong className="text-foreground font-semibold">Cancel Subscription</strong>.
              Callsy&apos;s AI agent will call your phone within seconds, greet you in Turkish, understand
              your reason for leaving, and try to win you back — exactly how it works for real customers.
            </CardDescription>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mt-5 flex items-center">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2 shrink-0">
                <div className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                  idx < stepIndex
                    ? "bg-emerald-600 text-white"
                    : idx === stepIndex
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                )}>
                  {idx < stepIndex ? <IconCheck className="size-3" /> : idx + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  idx === stepIndex ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "mx-3 h-px w-full min-w-[2rem] transition-colors duration-500",
                  idx < stepIndex ? "bg-emerald-500" : "bg-border"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        {/* Step 1: Sign Up */}
        {demoStep === "signup" && (
          <div className="mx-auto max-w-sm">
            <div className="flex flex-col gap-4">
              <div className="text-center mb-1">
                <p className="font-semibold">Create your free trial account</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  We&apos;ll use your phone number during the live call demo
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="demo-name">Full name</Label>
                  <Input
                    id="demo-name"
                    placeholder="e.g. Ahmet Yılmaz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                </div>
                <div>
                  <Label htmlFor="demo-phone">Phone number</Label>
                  <Input
                    id="demo-phone"
                    placeholder="+905xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5"
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    International format · Callsy will call this number when you cancel
                  </p>
                </div>
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white mt-1"
                  onClick={handleSignup}
                >
                  <IconUserPlus className="size-4" />
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Account View */}
        {demoStep === "account" && (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b bg-muted/20">
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">Growth Plan · $799/mo · 23 days to renewal</p>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800 shrink-0">
                  At Risk
                </Badge>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="rounded-lg bg-muted/40 border p-3">
                    <p className="text-xs text-muted-foreground">Feature Adoption</p>
                    <p className="text-xl font-bold mt-0.5">34%</p>
                    <Progress value={34} className="h-1 mt-2" />
                  </div>
                  <div className="rounded-lg bg-muted/40 border p-3">
                    <p className="text-xs text-muted-foreground">Last Login</p>
                    <p className="text-xl font-bold mt-0.5">9d</p>
                    <p className="text-xs text-muted-foreground mt-0.5">ago</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border p-3">
                    <p className="text-xs text-muted-foreground">NPS Score</p>
                    <p className="text-xl font-bold mt-0.5">6/10</p>
                    <p className="text-xs text-orange-600 mt-0.5">Passive</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border p-3">
                    <p className="text-xs text-muted-foreground">Open Tickets</p>
                    <p className="text-xl font-bold mt-0.5">3</p>
                    <p className="text-xs text-red-500 mt-0.5">Unresolved</p>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 mb-5">
                  <div className="flex items-start gap-2.5">
                    <IconBolt className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Callsy trigger is active on your account</p>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                        Low engagement detected — if you cancel, the AI agent will call you automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Thinking about leaving?</p>
                    <p className="text-xs text-muted-foreground">Click cancel — watch Callsy react in real time.</p>
                  </div>
                  <Button variant="destructive" className="gap-2 shrink-0" onClick={handleCancel} disabled={isLoading}>
                    <IconPhoneOff className="size-4" />
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Calling / Done */}
        {(demoStep === "calling" || demoStep === "done") && (
          <div className="mx-auto max-w-md">
            {demoStep === "calling" ? (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="relative flex size-24 items-center justify-center">
                  <span className="animate-ping absolute inline-flex size-24 rounded-full bg-emerald-500 opacity-10" />
                  <span className="animate-ping absolute inline-flex size-16 rounded-full bg-emerald-500 opacity-20" style={{ animationDelay: "300ms" }} />
                  <span className="relative flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl">
                    <IconPhoneCall className="size-7" />
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xl">Calling {name.split(" ")[0]}…</p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Outbound call dispatched to <span className="font-mono text-foreground">{phone}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg bg-muted/40 px-4 py-2.5">
                  <IconLoader className="size-4 animate-spin" />
                  Connecting via ElevenLabs + Twilio…
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <IconCircleCheckFilled className="size-10 fill-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-xl">Callsy called {name.split(" ")[0]}!</p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    The AI agent spoke in Turkish, asked about the cancellation reason,
                    offered solutions, and logged the outcome to CRM automatically.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 mt-1"
                  onClick={() => {
                    setDemoStep("signup")
                    setName("")
                    setPhone("+90")
                  }}
                >
                  <IconPlus className="size-4" />
                  Reset Demo
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CallsyDemo() {
  const [crmEvents, setCrmEvents] = React.useState<CrmEvent[]>(INITIAL_CRM_EVENTS)
  const [triggers, setTriggers] = React.useState<Trigger[]>(INITIAL_TRIGGERS)
  const [calls, setCalls] = React.useState<Call[]>(INITIAL_CALLS)
  const [stats, setStats] = React.useState<DemoStats>({
    activeAccounts: 127,
    callsToday: 23,
    churnPrevented: 8,
    arrProtected: 84000,
  })

  const eventIndexRef = React.useRef(0)
  const simulationTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    const runNextEvent = () => {
      const idx = eventIndexRef.current
      eventIndexRef.current += 1

      const template = CRM_EVENTS_POOL[idx % CRM_EVENTS_POOL.length]
      const newEventId = `evt-${Date.now()}-${idx}`

      const newEvent: CrmEvent = {
        id: newEventId,
        timestamp: new Date(),
        ...template,
        isNew: true,
      }

      setCrmEvents((prev) => [newEvent, ...prev.slice(0, 24)])

      // Find matching trigger
      const matchingTrigger = INITIAL_TRIGGERS.find((t) =>
        t.eventTypes.includes(template.type)
      )

      if (matchingTrigger && Math.random() > 0.15) {
        const triggerId = matchingTrigger.id

        setTimeout(() => {
          // Fire the trigger
          setTriggers((prev) =>
            prev.map((t) =>
              t.id === triggerId
                ? { ...t, status: "firing" as const, lastFired: new Date(), callsToday: t.callsToday + 1 }
                : t
            )
          )

          // Mark the event as triggered
          setCrmEvents((prev) =>
            prev.map((e) =>
              e.id === newEventId ? { ...e, triggerFired: matchingTrigger.name } : e
            )
          )

          // Schedule a new call
          const newCallId = `call-${Date.now()}-${idx}`
          const contact = CONTACTS[template.company] || "Unknown Contact"

          setCalls((prev) => [
            {
              id: newCallId,
              company: template.company,
              contact,
              type: matchingTrigger.callType,
              status: "scheduled",
              startTime: new Date(),
              isNew: true,
            },
            ...prev.slice(0, 14),
          ])

          // Reset trigger to active after 2s
          setTimeout(() => {
            setTriggers((prev) =>
              prev.map((t) => (t.id === triggerId ? { ...t, status: "active" as const } : t))
            )
          }, 2000)

          // Transition to "calling" after 2.5s
          setTimeout(() => {
            setCalls((prev) =>
              prev.map((c) => (c.id === newCallId ? { ...c, status: "calling" } : c))
            )
            setStats((prev) => ({ ...prev, callsToday: prev.callsToday + 1 }))

            // Resolve the call after 3-7s
            const resolveDelay = 3000 + Math.random() * 4000
            setTimeout(() => {
              const rand = Math.random()
              let finalStatus: CallStatus

              if (rand < 0.62) {
                finalStatus = "completed"
              } else if (rand < 0.87) {
                finalStatus = "no_answer"
              } else {
                finalStatus = "escalated"
              }

              const duration =
                finalStatus === "completed"
                  ? Math.floor(90 + Math.random() * 250)
                  : finalStatus === "escalated"
                    ? Math.floor(180 + Math.random() * 180)
                    : undefined

              const outcome = OUTCOMES[matchingTrigger.callType][finalStatus]

              setCalls((prev) =>
                prev.map((c) =>
                  c.id === newCallId ? { ...c, status: finalStatus, duration, outcome } : c
                )
              )

              // Update stats on successful churn prevention
              if (
                finalStatus === "completed" &&
                ["health_check", "renewal", "retention"].includes(matchingTrigger.callType)
              ) {
                const arrSaved = Math.floor(2400 + Math.random() * 18000)
                setStats((prev) => ({
                  ...prev,
                  churnPrevented: prev.churnPrevented + 1,
                  arrProtected: prev.arrProtected + arrSaved,
                }))
              }
            }, resolveDelay)
          }, 2500)
        }, 1500)
      }

      // Schedule next event in 4–7s
      const nextDelay = 4000 + Math.random() * 3000
      simulationTimerRef.current = setTimeout(runNextEvent, nextDelay)
    }

    // Kick off first event after 3s
    simulationTimerRef.current = setTimeout(runNextEvent, 3000)

    return () => {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current)
    }
  }, [])

  return (
    <div className="@container/main flex flex-col gap-6 p-4 md:p-6">

      {/* ── Section 1: KPI Overview ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <IconTrendingUp className="size-3.5 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70">
            Overview
          </span>
        </div>
        <StatsCards stats={stats} />
      </div>

      {/* ── Section 2: Platform Dashboard ──────────────────────────────────── */}
      <div className="rounded-2xl border bg-muted/25 p-4 md:p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <IconBolt className="size-3.5 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Callsy Platform
          </span>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground">Live simulation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CrmActivityFeed events={crmEvents} />
          </div>
          <div className="lg:col-span-2">
            <TriggerEngine triggers={triggers} />
          </div>
        </div>

        <CallLogTable calls={calls} />
      </div>

      {/* ── Section 3: Churn Prevention Demo ───────────────────────────────── */}
      <LiveDemoCard />

    </div>
  )
}
