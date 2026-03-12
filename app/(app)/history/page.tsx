import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getHabitsByUser } from "@/lib/repositories/habits"
import { getCompletionsForRange } from "@/lib/repositories/completions"
import { getJournalEntries } from "@/lib/repositories/journal"
import HistoryClient from "@/components/history/history-client"

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default async function HistoryPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const today = new Date()
  const yearAgo = new Date(today)
  yearAgo.setFullYear(today.getFullYear() - 1)

  const [habits, completions, journalEntries] = await Promise.all([
    getHabitsByUser(userId),
    getCompletionsForRange(userId, toDateStr(yearAgo), toDateStr(today)),
    getJournalEntries(userId, { startDate: toDateStr(yearAgo), endDate: toDateStr(today), limit: 400 }),
  ])

  return (
    <HistoryClient
      habits={habits}
      completions={completions}
      journalEntries={journalEntries}
      today={toDateStr(today)}
    />
  )
}
