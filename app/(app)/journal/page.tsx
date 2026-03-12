import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getJournalEntryByDate } from "@/lib/repositories/journal"
import JournalEditor from "@/components/journal/journal-editor"

function todayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default async function JournalPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const date = todayString()
  const existing = await getJournalEntryByDate(userId, date)

  return (
    <div className="h-full flex flex-col">
      <JournalEditor date={date} existing={existing ?? null} />
    </div>
  )
}
