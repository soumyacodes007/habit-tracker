"use client"

import { useState } from "react"
import Link from "next/link"
import HabitCard from "./habit-card"
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

interface StreakInfo {
  habitId: string
  currentStreak: number
  longestStreak: number
}

interface ManageHabitsClientProps {
  habits: Habit[]
  streaks: StreakInfo[]
}

export default function ManageHabitsClient({ habits, streaks }: ManageHabitsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)

  const handleEdit = (h: Habit) => {
    setEditHabit(h)
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setEditHabit(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 md:px-12 pt-10 pb-5 border-b border-[rgba(55,50,47,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/habits"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[rgba(55,50,47,0.40)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.06)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8.5 11L4.5 7L8.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <div>
              <h1
                className="text-[28px] md:text-[32px] font-normal text-[#37322F] leading-tight"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
              >
                Manage Habits
              </h1>
              <p className="text-[13px] text-[rgba(55,50,47,0.42)] mt-0.5">
                {habits.length} {habits.length === 1 ? "active habit" : "active habits"}
              </p>
            </div>
          </div>

          <button
            onClick={() => { setEditHabit(null); setDialogOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#37322F] text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            New habit
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(55,50,47,0.05)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="16" height="16" rx="3" stroke="#37322F" strokeWidth="1.3" strokeOpacity="0.35"/>
                <path d="M11 7V15M7 11H15" stroke="#37322F" strokeWidth="1.3" strokeOpacity="0.35" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[15px] font-medium text-[rgba(55,50,47,0.55)]">No habits created yet</p>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-1 px-5 py-2.5 rounded-full bg-[#37322F] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              Create your first habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {habits.map((habit) => {
              const s = streaks.find((st) => st.habitId === habit.id)
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  streak={s ? { currentStreak: s.currentStreak, longestStreak: s.longestStreak } : undefined}
                  onEdit={handleEdit}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Dialog */}
      <CreateHabitDialog
        open={dialogOpen}
        onClose={handleClose}
        existing={editHabit}
      />
    </div>
  )
}
