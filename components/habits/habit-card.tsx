"use client"

import { useState, useTransition } from "react"
import { archiveHabitAction } from "@/app/actions/habits"

interface Habit {
  id: string
  name: string
  description?: string | null
  color: string
  icon: string
  targetDays?: string[] | null
  createdAt: Date | string
}

interface StreakInfo {
  currentStreak: number
  longestStreak: number
}

interface HabitCardProps {
  habit: Habit
  streak?: StreakInfo
  onEdit: (habit: Habit) => void
}

const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
}

export default function HabitCard({ habit, streak, onEdit }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [confirmArchive, setConfirmArchive] = useState(false)

  const handleArchive = () => {
    startTransition(async () => {
      await archiveHabitAction(habit.id)
      setConfirmArchive(false)
    })
  }

  const days = habit.targetDays ?? ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

  return (
    <div
      className={[
        "group relative flex flex-col gap-3 p-5 rounded-xl bg-white",
        "border border-[rgba(55,50,47,0.10)]",
        "shadow-[0px_1px_3px_rgba(55,50,47,0.06)]",
        "hover:shadow-[0px_4px_12px_rgba(55,50,47,0.10)]",
        "transition-all duration-150",
      ].join(" ")}
    >
      {/* Top row: icon + name + menu */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white text-[15px] font-semibold"
          style={{ backgroundColor: habit.color }}
        >
          {habit.icon || habit.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14.5px] font-semibold text-[#37322F] leading-tight">{habit.name}</p>
          {habit.description && (
            <p className="text-[12px] text-[rgba(55,50,47,0.45)] leading-relaxed mt-0.5 line-clamp-2">
              {habit.description}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 rounded flex items-center justify-center text-[rgba(55,50,47,0.30)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.06)] opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="3" r="1" fill="currentColor"/>
              <circle cx="6" cy="6" r="1" fill="currentColor"/>
              <circle cx="6" cy="9" r="1" fill="currentColor"/>
            </svg>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg border border-[rgba(55,50,47,0.12)] shadow-lg py-1.5 w-[140px]"
                style={{ animation: "menu-pop 0.1s ease-out" }}
              >
                <button
                  onClick={() => { onEdit(habit); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#37322F] hover:bg-[rgba(55,50,47,0.05)] transition-colors"
                >
                  Edit habit
                </button>
                <button
                  onClick={() => { setConfirmArchive(true); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  Archive
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active days */}
      <div className="flex gap-1">
        {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((d) => {
          const active = days.includes(d)
          return (
            <span
              key={d}
              className={[
                "w-7 h-5 rounded text-[10px] font-semibold flex items-center justify-center",
                active ? "text-white" : "bg-[rgba(55,50,47,0.05)] text-[rgba(55,50,47,0.25)]",
              ].join(" ")}
              style={active ? { backgroundColor: habit.color, opacity: 0.75 } : undefined}
            >
              {DAY_LABELS[d]?.[0]}
            </span>
          )
        })}
      </div>

      {/* Streak row */}
      {streak && (
        <div className="flex items-center gap-4 pt-1 border-t border-[rgba(55,50,47,0.06)]">
          <div className="flex flex-col">
            <span className="text-[20px] font-normal text-[#37322F] leading-none tabular-nums" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              {streak.currentStreak}
            </span>
            <span className="text-[10px] text-[rgba(55,50,47,0.38)] mt-0.5 uppercase tracking-wider font-semibold">Current</span>
          </div>
          <div className="w-px h-7 bg-[rgba(55,50,47,0.08)]" />
          <div className="flex flex-col">
            <span className="text-[20px] font-normal text-[rgba(55,50,47,0.50)] leading-none tabular-nums" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              {streak.longestStreak}
            </span>
            <span className="text-[10px] text-[rgba(55,50,47,0.38)] mt-0.5 uppercase tracking-wider font-semibold">Best</span>
          </div>
        </div>
      )}

      {/* Archive confirmation */}
      {confirmArchive && (
        <>
          <div className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[1px]" onClick={() => setConfirmArchive(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-[320px]" style={{ animation: "menu-pop 0.12s ease-out" }}>
              <p className="text-[14px] font-semibold text-[#37322F] mb-1">Archive this habit?</p>
              <p className="text-[12.5px] text-[rgba(55,50,47,0.50)] mb-4">It will be removed from your daily checklist. Your streak data is preserved.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmArchive(false)} className="px-3 py-1.5 text-[12.5px] font-medium text-[rgba(55,50,47,0.55)] hover:text-[#37322F] rounded-lg hover:bg-[rgba(55,50,47,0.05)] transition-colors">
                  Keep it
                </button>
                <button onClick={handleArchive} disabled={isPending} className="px-3 py-1.5 text-[12.5px] font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50">
                  {isPending ? "Archiving..." : "Archive"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes menu-pop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
