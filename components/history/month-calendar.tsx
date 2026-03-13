"use client"

import { useMemo } from "react"

interface Habit {
  id: string
  color: string
  name: string
}

interface Completion {
  habitId: string
  completedDate: string
}

interface JournalEntry {
  date: string
  mood?: string | null
}

interface MonthCalendarProps {
  year: number
  month: number // 0-indexed
  habits: Habit[]
  completions: Completion[]
  journalEntries: JournalEntry[]
  today: string
  selectedDate: string | null
  onDayClick: (date: string) => void
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]


export default function MonthCalendar({
  year, month, habits, completions, journalEntries, today, selectedDate, onDayClick,
}: MonthCalendarProps) {
  // Build Sets for fast lookup
  const completionMap = useMemo(() => {
    const m: Record<string, string[]> = {} // date → habitId[]
    for (const c of completions) {
      if (!m[c.completedDate]) m[c.completedDate] = []
      m[c.completedDate].push(c.habitId)
    }
    return m
  }, [completions])

  const journalMap = useMemo(() => {
    const m: Record<string, string | null> = {}
    for (const j of journalEntries) {
      m[j.date] = j.mood ?? null
    }
    return m
  }, [journalEntries])

  // Build calendar grid
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    // Monday-based week: 0=Mon…6=Sun
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const total = Math.ceil((startOffset + daysInMonth) / 7) * 7

    const result: Array<{ date: string | null; day: number | null }> = []
    for (let i = 0; i < total; i++) {
      const d = i - startOffset + 1
      if (d < 1 || d > daysInMonth) {
        result.push({ date: null, day: null })
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        result.push({ date: dateStr, day: d })
      }
    }
    return result
  }, [year, month])

  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7))
    return result
  }, [days])

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-[10.5px] font-semibold text-[rgba(55,50,47,0.35)] text-center uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="border-l border-t border-[rgba(55,50,47,0.08)]">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((cell, di) => {
              if (!cell.date || !cell.day) {
                return (
                  <div
                    key={di}
                    className="border-r border-b border-[rgba(55,50,47,0.08)] h-[84px] bg-[rgba(55,50,47,0.015)]"
                  />
                )
              }

              const completedIds = completionMap[cell.date] ?? []
              const journalMood = journalMap[cell.date]
              const hasJournal = cell.date in journalMap
              const isToday = cell.date === today
              const isSelected = cell.date === selectedDate
              const isFuture = cell.date > today

              // Find the emoji and color for the journal mood
              let moodColor = "transparent"
              let moodEmoji = ""
              if (hasJournal) {
                 if (journalMood === "happy" || journalMood === "positive") { moodColor = "#10b981"; moodEmoji = "🤩"; }
                 else if (journalMood === "grateful") { moodColor = "#06b6d4"; moodEmoji = "😌"; }
                 else if (journalMood === "neutral") { moodColor = "#64748b"; moodEmoji = "😐"; }
                 else if (journalMood === "anxious") { moodColor = "#f59e0b"; moodEmoji = "😬"; }
                 else if (journalMood === "lethargic") { moodColor = "#8b5cf6"; moodEmoji = "🥱"; }
                 else if (journalMood === "sad" || journalMood === "frustrated") { moodColor = "#ef4444"; moodEmoji = "😫"; }
                 else { moodColor = "#64748b"; moodEmoji = "·"; } 
              }

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => !isFuture && onDayClick(cell.date!)}
                  disabled={isFuture}
                  className={[
                    "relative border-r border-b border-[rgba(55,50,47,0.08)] h-[84px] text-left overflow-hidden",
                    "transition-colors duration-100 group",
                    isFuture ? "cursor-default" : "cursor-pointer hover:bg-[rgba(55,50,47,0.025)]",
                    isSelected ? "bg-[rgba(55,50,47,0.04)]" : "",
                  ].join(" ")}
                >
                  {/* Date number: top-left corner, small (12px), gray text */}
                  <div className="absolute top-1.5 left-2">
                    <span
                      className={[
                        "text-[12px] font-medium leading-none transition-colors",
                        isToday
                          ? "text-[#37322F] font-bold"
                          : isFuture
                          ? "text-[rgba(55,50,47,0.22)]"
                          : "text-[rgba(55,50,47,0.45)] group-hover:text-[#37322F]",
                      ].join(" ")}
                    >
                      {cell.day}
                    </span>
                  </div>

                  {/* Mood circle: fixed 40x40px centered in cell */}
                  {hasJournal ? (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[20px] leading-none transition-transform group-hover:scale-110"
                        style={{ 
                          backgroundColor: `${moodColor}15`,
                          border: `1px solid ${moodColor}30`,
                        }}
                      >
                        <span style={{ 
                          filter: `drop-shadow(0 2px 4px ${moodColor}40)` 
                        }}>
                          {moodEmoji}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[20px] border border-dashed border-[rgba(55,50,47,0.1)] text-[rgba(55,50,47,0.1)]">
                        +
                      </div>
                    </div>
                  )}

                  {/* Habit dots - positioned at the bottom */}
                  {completedIds.length > 0 && (
                    <div className="absolute bottom-1.5 left-0 right-0 flex justify-center flex-wrap gap-[3px] px-1 pointer-events-none">
                      {completedIds.slice(0, 5).map((id) => {
                        const habit = habits.find((h) => h.id === id)
                        return (
                          <div
                            key={id}
                            className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                            style={{ backgroundColor: habit?.color ?? "#37322F" }}
                          />
                        )
                      })}
                      {completedIds.length > 5 && (
                        <span className="text-[7px] font-bold text-[rgba(55,50,47,0.40)] flex items-center pl-[1px] leading-none">+{completedIds.length - 5}</span>
                      )}
                    </div>
                  )}

                  {/* Selection ring */}
                  {isSelected && (
                    <div className="absolute inset-0 ring-1 ring-inset ring-[rgba(55,50,47,0.25)] pointer-events-none" />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
