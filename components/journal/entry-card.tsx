"use client"

import Link from "next/link"

type Mood = "happy" | "neutral" | "sad"

interface Entry {
  id: string
  content: string
  mood?: Mood | null
  date: string
  updatedAt: Date | string
  createdAt: Date | string
}

const MOOD_STYLE: Record<Mood, { label: string; bg: string; text: string; dot: string }> = {
  happy: { label: "Good", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  neutral: { label: "Okay", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  sad: { label: "Rough", bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400" },
}

function formatEntryDate(dateStr: string): { day: string; month: string; year: string; weekday: string } {
  const [y, m, d] = dateStr.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  return {
    day: String(d).padStart(2, "0"),
    month: dt.toLocaleDateString("en-US", { month: "short" }),
    year: String(y),
    weekday: dt.toLocaleDateString("en-US", { weekday: "short" }),
  }
}

function stripHtml(html: string): string {
  // A simple regex to remove HTML tags and replace common entities
  return html.replace(/<[^>]*>?/gm, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
}

export default function EntryCard({ entry }: { entry: Entry }) {
  const plainText = stripHtml(entry.content)
  const excerpt = plainText.slice(0, 150).trim()
  const hasMore = plainText.length > 150
  const { day, month, year, weekday } = formatEntryDate(entry.date)
  const mood = entry.mood as Mood | null | undefined
  const moodStyle = mood ? MOOD_STYLE[mood] : null

  return (
    <Link
      href={`/journal/${entry.date}`}
      className={[
        "group flex flex-col gap-3 p-5 rounded-xl border bg-white",
        "border-[rgba(55,50,47,0.10)] shadow-[0px_1px_3px_rgba(55,50,47,0.06)]",
        "hover:shadow-[0px_4px_12px_rgba(55,50,47,0.10)] hover:-translate-y-[1px]",
        "transition-all duration-150 ease-out cursor-pointer",
      ].join(" ")}
    >
      {/* Date + mood row */}
      <div className="flex items-start justify-between gap-3">
        {/* Date block */}
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[34px] font-normal leading-none text-[#37322F]"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {day}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold text-[rgba(55,50,47,0.55)] uppercase tracking-wider">
              {month} {year}
            </span>
            <span className="text-[11px] text-[rgba(55,50,47,0.38)] uppercase tracking-wider">
              {weekday}
            </span>
          </div>
        </div>

        {/* Mood badge */}
        {moodStyle && (
          <div
            className={[
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium",
              moodStyle.bg,
              moodStyle.text,
            ].join(" ")}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${moodStyle.dot}`} />
            {moodStyle.label}
          </div>
        )}
      </div>

      {/* Excerpt */}
      <p className="text-[13.5px] text-[rgba(55,50,47,0.70)] leading-relaxed line-clamp-3">
        {excerpt}
        {hasMore && "..."}
      </p>

      {/* Read more */}
      <div className="flex items-center gap-1 text-[12px] font-medium text-[rgba(55,50,47,0.40)] group-hover:text-[#37322F] transition-colors mt-auto">
        Read entry
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:translate-x-0.5">
          <path d="M2.5 6H9.5M9.5 6L7 3.5M9.5 6L7 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  )
}
