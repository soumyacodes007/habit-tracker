"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import EntryCard from "./entry-card"

type Mood = "happy" | "neutral" | "sad"

interface Entry {
  id: string
  content: string
  mood?: Mood | null
  date: string
  updatedAt: Date | string
  createdAt: Date | string
}

interface BrowseJournalProps {
  initialEntries: Entry[]
}

const MOOD_FILTERS: { value: Mood | "all"; label: string }[] = [
  { value: "all", label: "All moods" },
  { value: "happy", label: "Good" },
  { value: "neutral", label: "Okay" },
  { value: "sad", label: "Rough" },
]

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function BrowseJournal({ initialEntries }: BrowseJournalProps) {
  const [query, setQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all")
  const [sortDesc, setSortDesc] = useState(true)

  const filtered = useMemo(() => {
    let list = [...initialEntries]

    if (moodFilter !== "all") {
      list = list.filter((e) => e.mood === moodFilter)
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((e) => e.content.toLowerCase().includes(q))
    }

    list.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      return sortDesc ? -cmp : cmp
    })

    return list
  }, [initialEntries, query, moodFilter, sortDesc])

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="px-8 md:px-12 pt-10 pb-5 border-b border-[rgba(55,50,47,0.08)]">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-[28px] md:text-[32px] font-normal text-[#37322F] leading-tight"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
            >
              All Entries
            </h1>
            <p className="text-[13px] text-[rgba(55,50,47,0.45)] mt-1">
              {initialEntries.length} {initialEntries.length === 1 ? "entry" : "entries"} total
            </p>
          </div>
          <Link
            href="/journal"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#37322F] text-white text-[13px] font-medium hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            New entry
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(55,50,47,0.35)]">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries..."
              className={[
                "w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[rgba(55,50,47,0.12)]",
                "text-[13px] text-[#37322F] placeholder:text-[rgba(55,50,47,0.30)]",
                "outline-none focus:border-[rgba(55,50,47,0.30)] focus:ring-1 focus:ring-[rgba(55,50,47,0.10)]",
                "transition-colors",
              ].join(" ")}
            />
          </div>

          {/* Mood filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {MOOD_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setMoodFilter(f.value)}
                className={[
                  "px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-100",
                  moodFilter === f.value
                    ? "bg-[#37322F] text-white"
                    : "bg-white border border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.60)] hover:border-[rgba(55,50,47,0.25)] hover:text-[#37322F]",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className={[
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium",
              "bg-white border border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.60)]",
              "hover:border-[rgba(55,50,47,0.25)] hover:text-[#37322F] transition-colors whitespace-nowrap",
            ].join(" ")}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3H10M2 6H7M2 9H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {sortDesc ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </div>

      {/* Entries grid */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgba(55,50,47,0.06)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3.5C3 3.5 4 3 6.5 3C9 3 10.5 4.5 10.5 4.5V15C10.5 15 9 14.25 6.5 14.25C4 14.25 3 15 3 15V3.5Z" stroke="#37322F" strokeWidth="1.2" strokeOpacity="0.4" strokeLinejoin="round"/>
                <path d="M10.5 4.5C10.5 4.5 12 3 14.5 3C15.5 3 15.5 3.5 15.5 3.5V15C15.5 15 14.5 14.25 12 14.25C11 14.25 10.5 15 10.5 15V4.5Z" stroke="#37322F" strokeWidth="1.2" strokeOpacity="0.4" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[rgba(55,50,47,0.50)]">
              {query || moodFilter !== "all" ? "No entries match your filters" : "No entries yet"}
            </p>
            <p className="text-[12.5px] text-[rgba(55,50,47,0.35)]">
              {query || moodFilter !== "all" ? "Try adjusting your search" : "Start writing to see your entries here"}
            </p>
            {!query && moodFilter === "all" && (
              <Link
                href="/journal"
                className="mt-2 px-4 py-2 rounded-full bg-[#37322F] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Write today's entry
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-min">
              {filtered.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
            <p className="text-center text-[11.5px] text-[rgba(55,50,47,0.30)] mt-8 pb-4">
              Showing {filtered.length} of {initialEntries.length} entries
            </p>
          </>
        )}
      </div>
    </div>
  )
}
