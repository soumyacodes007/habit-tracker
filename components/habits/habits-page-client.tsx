"use client"

import { useState } from "react"
import Link from "next/link"
import HabitChecklist from "./habit-checklist"
import CreateHabitDialog from "./create-habit-dialog"

interface Habit {
  id: string
  name: string
  description?: string | null
  color: string
  icon: string
  targetDays?: string[] | null
  createdAt: Date | string
  archivedAt?: Date | string | null
}

interface Completion {
  habitId: string
  note?: string | null
}

interface StreakInfo {
  habitId: string
  currentStreak: number
  longestStreak: number
}

interface HabitsPageClientProps {
  habits: Habit[]
  completions: Completion[]
  streaks: StreakInfo[]
  date: string
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const isToday = dt.getTime() === today.getTime()

  const formatted = dt.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })
  return isToday ? `Today — ${formatted}` : formatted
}

export default function HabitsPageClient({ habits, completions, streaks, date }: HabitsPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 md:px-12 pt-10 pb-5 border-b border-[rgba(55,50,47,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-[28px] md:text-[32px] font-normal text-[#37322F] leading-tight"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
            >
              Daily Checklist
            </h1>
            <p className="text-[13px] text-[rgba(55,50,47,0.42)] mt-1">
              {formatDisplayDate(date)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/habits/manage"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium bg-white border border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.60)] hover:border-[rgba(55,50,47,0.25)] hover:text-[#37322F] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 3H10.5M1.5 6H10.5M1.5 9H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Manage
            </Link>
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#37322F] text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              New habit
            </button>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(55,50,47,0.05)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="16" height="16" rx="3" stroke="#37322F" strokeWidth="1.3" strokeOpacity="0.35"/>
                <path d="M8 11L10 13L14.5 8.5" stroke="#37322F" strokeWidth="1.3" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-[rgba(55,50,47,0.55)]">No habits yet</p>
              <p className="text-[12.5px] text-[rgba(55,50,47,0.35)] mt-1">Create your first habit to start building consistency</p>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-1 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#37322F] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Create a habit
            </button>
          </div>
        ) : (
          <HabitChecklist habits={habits} completions={completions} streaks={streaks} date={date} />
        )}
      </div>

      {/* Dialog */}
      <CreateHabitDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
