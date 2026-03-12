"use client"

import Link from "next/link"

interface Habit {
  id: string
  name: string
  color: string
  icon: string
}

interface Completion {
  habitId: string
  completedDate: string
}

interface JournalEntry {
  id: string
  date: string
  content: string
  mood?: string | null
}

interface DayDetailProps {
  date: string
  habits: Habit[]
  completions: Completion[]
  journalEntries: JournalEntry[]
  onClose: () => void
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/gm, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MOOD_LABEL: Record<string, string> = { happy: "Good day", neutral: "Okay day", sad: "Rough day" }
const MOOD_COLOR: Record<string, string> = { happy: "#10b981", neutral: "#f59e0b", sad: "#ef4444" }

export default function DayDetail({ date, habits, completions, journalEntries, onClose }: DayDetailProps) {
  const [y, m, d] = date.split("-").map(Number)
  const displayDate = `${MONTH_NAMES[m - 1]} ${d}, ${y}`

  const todayCompletions = completions.filter((c) => c.completedDate === date)
  const completedIds = new Set(todayCompletions.map((c) => c.habitId))
  const completedHabits = habits.filter((h) => completedIds.has(h.id))
  const missedHabits = habits.filter((h) => !completedIds.has(h.id))

  const journalEntry = journalEntries.find((j) => j.date === date)
  const excerpt = journalEntry ? stripHtml(journalEntry.content).slice(0, 220) : null

  return (
    <div
      className="flex flex-col h-full border-l border-[rgba(55,50,47,0.08)]"
      style={{ animation: "detail-slide 0.18s ease-out" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[rgba(55,50,47,0.08)] flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(`${date}T00:00:00`).getDay()]}
          </p>
          <h3
            className="text-[20px] font-normal text-[#37322F] leading-tight"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {displayDate}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded flex items-center justify-center text-[rgba(55,50,47,0.35)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.06)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        {/* Journal entry */}
        {journalEntry ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">Journal</span>
              {journalEntry.mood && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${MOOD_COLOR[journalEntry.mood]}15`, color: MOOD_COLOR[journalEntry.mood] }}>
                  {MOOD_LABEL[journalEntry.mood]}
                </span>
              )}
            </div>
            <Link
              href={`/journal/${date}`}
              className="block p-3 rounded-xl bg-[rgba(55,50,47,0.03)] border border-[rgba(55,50,47,0.08)] hover:border-[rgba(55,50,47,0.18)] transition-colors group"
            >
              <p className="text-[12.5px] text-[rgba(55,50,47,0.65)] leading-relaxed line-clamp-4">
                {excerpt || "Open entry"}
              </p>
              <p className="text-[11px] text-[rgba(55,50,47,0.35)] mt-2 group-hover:text-[#37322F] transition-colors">
                Open entry &rarr;
              </p>
            </Link>
          </div>
        ) : (
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">Journal</span>
            <Link
              href={`/journal/${date}`}
              className="mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[rgba(55,50,47,0.15)] text-[12px] text-[rgba(55,50,47,0.38)] hover:text-[#37322F] hover:border-[rgba(55,50,47,0.30)] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Write a journal entry
            </Link>
          </div>
        )}

        {/* Completed habits */}
        {completedHabits.length > 0 && (
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-2">
              Completed ({completedHabits.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {completedHabits.map((h) => (
                <div key={h.id} className="flex items-center gap-2.5 px-0">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                    style={{ backgroundColor: h.color }}>
                    {h.icon || h.name[0].toUpperCase()}
                  </div>
                  <span className="text-[13px] text-[#37322F] font-medium">{h.name}</span>
                  <svg className="ml-auto flex-shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke={h.color} strokeWidth="1.2" />
                    <path d="M3.5 6L5.5 8L8.5 4" stroke={h.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missed habits */}
        {missedHabits.length > 0 && (
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-2">
              Missed ({missedHabits.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {missedHabits.map((h) => (
                <div key={h.id} className="flex items-center gap-2.5 opacity-40">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                    style={{ backgroundColor: h.color }}>
                    {h.icon || h.name[0].toUpperCase()}
                  </div>
                  <span className="text-[13px] text-[#37322F]">{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {completedHabits.length === 0 && missedHabits.length === 0 && !journalEntry && (
          <p className="text-[12.5px] text-[rgba(55,50,47,0.38)] text-center py-4">
            Nothing recorded for this day.
          </p>
        )}
      </div>

      <style>{`
        @keyframes detail-slide {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
