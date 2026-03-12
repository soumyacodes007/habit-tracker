import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getJournalEntries } from "@/lib/repositories/journal"
import BrowseJournal from "@/components/journal/browse-journal"

interface BrowsePageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string; mood?: string }>
}

export default async function BrowseJournalPage({ searchParams }: BrowsePageProps) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const params = await searchParams

  const entries = await getJournalEntries(userId, {
    limit: 100,
    offset: 0,
    startDate: params.startDate,
    endDate: params.endDate,
  })

  // Filter by mood server-side if provided
  const filtered = params.mood
    ? entries.filter((e) => e.mood === params.mood)
    : entries

  return <BrowseJournal initialEntries={filtered} />
}
