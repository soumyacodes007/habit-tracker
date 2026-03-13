import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getEntriesWithInsights } from "@/lib/repositories/insights"
import InsightsClient from "@/components/insights/insights-client"

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default async function InsightsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 45) // Fetch last 45 days for the calendar

  const entries = await getEntriesWithInsights(
    userId,
    toDateStr(startDate),
    toDateStr(today)
  )

  return <InsightsClient entries={entries} today={toDateStr(today)} />
}
