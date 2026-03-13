"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { deleteJournalEntryAction } from "@/app/actions/journal"
import { useRouter } from "next/navigation"

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
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      await deleteJournalEntryAction(entry.id)
      router.refresh()
    })
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  return (
    <div className="relative">
      <Link
        href={`/journal/${entry.date}`}
        className={[
          "group flex flex-col gap-3 p-5 rounded-xl border bg-white",
          "border-[rgba(55,50,47,0.10)] shadow-[0px_1px_3px_rgba(55,50,47,0.06)]",
          "hover:shadow-[0px_4px_12px_rgba(55,50,47,0.10)] hover:-translate-y-[1px]",
          "transition-all duration-150 ease-out cursor-pointer",
          showDeleteConfirm && "pointer-events-none opacity-50",
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

        <div className="flex items-center gap-2">
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
          
          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className={[
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
              "p-1.5 rounded-lg hover:bg-rose-50 text-[rgba(55,50,47,0.35)] hover:text-rose-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
            title="Delete entry"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3.5H12M5.5 6V10M8.5 6V10M10.5 3.5V11.5C10.5 12.052 10.052 12.5 9.5 12.5H4.5C3.948 12.5 3.5 12.052 3.5 11.5V3.5M5.5 3.5V2C5.5 1.448 5.948 1 6.5 1H7.5C8.052 1 8.5 1.448 8.5 2V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
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

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl border border-rose-200 z-10">
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3.5H12M5.5 6V10M8.5 6V10M10.5 3.5V11.5C10.5 12.052 10.052 12.5 9.5 12.5H4.5C3.948 12.5 3.5 12.052 3.5 11.5V3.5M5.5 3.5V2C5.5 1.448 5.948 1 6.5 1H7.5C8.052 1 8.5 1.448 8.5 2V3.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-[#37322F] mb-1">Delete this entry?</p>
              <p className="text-[11px] text-[rgba(55,50,47,0.50)]">This action cannot be undone</p>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={cancelDelete}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white border border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.70)] hover:border-[rgba(55,50,47,0.25)] hover:text-[#37322F] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
