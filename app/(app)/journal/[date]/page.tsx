import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getJournalEntryByDate } from "@/lib/repositories/journal"
import JournalEditor from "@/components/journal/journal-editor"
import Link from "next/link"

interface JournalDatePageProps {
  params: Promise<{ date: string }>
}

export default async function JournalDatePage({ params }: JournalDatePageProps) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { date } = await params

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect("/journal")

  const existing = await getJournalEntryByDate(userId, date)

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="px-8 md:px-12 pt-5 pb-0 flex items-center gap-2">
        <Link
          href="/journal/browse"
          className="flex items-center gap-1.5 text-[12px] text-[rgba(55,50,47,0.45)] hover:text-[#37322F] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All Entries
        </Link>
      </div>
      <JournalEditor date={date} existing={existing ?? null} />
    </div>
  )
}
