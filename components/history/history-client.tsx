"use client"

import { useState } from "react"
import ActivityHeatmap from "./activity-heatmap"
import MonthCalendar from "./month-calendar"
import DayDetail from "./day-detail"

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

interface HistoryClientProps {
  habits: Habit[]
  completions: Completion[]
  journalEntries: JournalEntry[]
  today: string
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function parseYearMonth(today: string): { year: number; month: number } {
  const [y, m] = today.split("-").map(Number)
  return { year: y, month: m - 1 }
}

export default function HistoryClient({ habits, completions, journalEntries, today }: HistoryClientProps) {
  const init = parseYearMonth(today)
  const [year, setYear] = useState(init.year)
  const [month, setMonth] = useState(init.month)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    const [ty, tm] = today.split("-").map(Number)
    if (year === ty && month === tm - 1) return // can't go into the future
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const [ty, tm] = today.split("-").map(Number)
  const canGoNext = !(year === ty && month === tm - 1)

  const totalDays = completions.reduce((acc, c) => {
    acc.add(c.completedDate); return acc
  }, new Set<string>()).size

  const totalJournalDays = journalEntries.length

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="px-8 md:px-12 pt-10 pb-5 border-b border-[rgba(55,50,47,0.08)] flex-shrink-0">
        <h1
          className="text-[28px] md:text-[32px] font-normal text-[#37322F] leading-tight"
          style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
        >
          History
        </h1>
        <div className="flex items-center gap-5 mt-2">
          <Stat label="Active days" value={totalDays} />
          <div className="w-px h-6 bg-[rgba(55,50,47,0.10)]" />
          <Stat label="Journal entries" value={totalJournalDays} />
          <div className="w-px h-6 bg-[rgba(55,50,47,0.10)]" />
          <Stat label="Habits tracked" value={habits.length} />
        </div>
      </div>

      <div className={`flex flex-1 overflow-hidden ${selectedDate ? "divide-x divide-[rgba(55,50,47,0.08)]" : ""}`}>
        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6 flex flex-col gap-8">
          {/* Year heatmap */}
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-4">
              Year activity
            </h2>
            <ActivityHeatmap
              habits={habits}
              completions={completions}
              today={today}
              selectedDate={selectedDate}
              onDayClick={(d) => setSelectedDate(d === selectedDate ? null : d)}
            />
          </section>

          {/* Monthly calendar */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">
                {MONTH_NAMES[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[rgba(55,50,47,0.40)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.06)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8.5 11L4.5 7L8.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  disabled={!canGoNext}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[rgba(55,50,47,0.40)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.06)] transition-colors disabled:opacity-30 disabled:cursor-default"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <MonthCalendar
              year={year}
              month={month}
              habits={habits}
              completions={completions}
              journalEntries={journalEntries}
              today={today}
              selectedDate={selectedDate}
              onDayClick={(d) => setSelectedDate(d === selectedDate ? null : d)}
            />

            {/* Habit color legend */}
            {habits.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                {habits.map((h) => (
                  <div key={h.id} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                    <span className="text-[11px] text-[rgba(55,50,47,0.45)]">{h.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[rgba(55,50,47,0.4)]" />
                  <span className="text-[11px] text-[rgba(55,50,47,0.45)]">Journal</span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Day detail panel */}
        {selectedDate && (
          <div className="w-[280px] flex-shrink-0">
            <DayDetail
              date={selectedDate}
              habits={habits}
              completions={completions}
              journalEntries={journalEntries}
              onClose={() => setSelectedDate(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[18px] font-normal text-[#37322F] tabular-nums" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>{value}</span>
      <span className="text-[12px] text-[rgba(55,50,47,0.42)]">{label}</span>
    </div>
  )
}
