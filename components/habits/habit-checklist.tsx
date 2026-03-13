"use client"

import { useState, useTransition, useOptimistic, startTransition as reactStartTransition } from "react"
import { toggleCompletionAction } from "@/app/actions/completions"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Habit {
  id: string
  name: string
  description?: string | null
  color: string
  icon: string
  targetDays?: string[] | null
  habitType?: string | null
  timerDuration?: number | null
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

interface HabitChecklistProps {
  habits: Habit[]
  completions: Completion[]
  streaks: StreakInfo[]
  date: string // YYYY-MM-DD
}

// ─── Day helpers ─────────────────────────────────────────────────────────────

const DAY_MAP: Record<number, string> = {
  0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat",
}

function currentDayKey(): string {
  return DAY_MAP[new Date().getDay()]
}

// ─── Timer popup state ───────────────────────────────────────────────────────

interface TimerState {
  habitId: string
  habitName: string
  habitColor: string
  habitIcon: string
  duration: number // seconds
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HabitChecklist({
  habits,
  completions,
  streaks,
  date,
}: HabitChecklistProps) {
  const todayKey = currentDayKey()
  const [timerState, setTimerState] = useState<TimerState | null>(null)

  // filter habits scheduled for today
  const todaysHabits = habits.filter((h) => {
    if (!h.targetDays || h.targetDays.length === 0) return true
    return h.targetDays.includes(todayKey)
  })

  // Build initial set of completed habit IDs
  const completedIds = new Set(completions.map((c) => c.habitId))

  // Optimistic state for instant toggling
  const [optimisticCompleted, addOptimistic] = useOptimistic(
    completedIds,
    (state: Set<string>, habitId: string) => {
      const next = new Set(state)
      if (next.has(habitId)) next.delete(habitId)
      else next.add(habitId)
      return next
    }
  )

  const total = todaysHabits.length
  const done = todaysHabits.filter((h) => optimisticCompleted.has(h.id)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleTimerComplete = (habitId: string) => {
    reactStartTransition(() => addOptimistic(habitId))
    setTimerState(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[32px] font-normal text-[#37322F] leading-none tabular-nums" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
              {done}<span className="text-[20px] text-[rgba(55,50,47,0.30)]">/{total}</span>
            </span>
            <p className="text-[12px] text-[rgba(55,50,47,0.40)] mt-0.5">completed today</p>
          </div>
          <span className="text-[13px] font-semibold text-[rgba(55,50,47,0.50)] tabular-nums">{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[rgba(55,50,47,0.07)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#10b981" : "#37322F" }}
          />
        </div>
      </div>

      {/* Habit list */}
      {todaysHabits.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[rgba(55,50,47,0.05)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="14" height="14" rx="2" stroke="#37322F" strokeWidth="1.2" strokeOpacity="0.35"/>
              <path d="M6 9L8 11L12 7" stroke="#37322F" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[13px] text-[rgba(55,50,47,0.45)]">No habits scheduled for today</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {todaysHabits.map((habit) => {
            const isCompleted = optimisticCompleted.has(habit.id)
            const streak = streaks.find((s) => s.habitId === habit.id)

            return (
              <HabitRow
                key={habit.id}
                habit={habit}
                isCompleted={isCompleted}
                streak={streak}
                date={date}
                onToggle={() => reactStartTransition(() => addOptimistic(habit.id))}
                onStartTimer={() => {
                  if (habit.habitType === "timer" && habit.timerDuration) {
                    setTimerState({
                      habitId: habit.id,
                      habitName: habit.name,
                      habitColor: habit.color,
                      habitIcon: habit.icon,
                      duration: habit.timerDuration * 60, // minutes → seconds
                    })
                  }
                }}
              />
            )
          })}
        </div>
      )}

      {/* Timer popup */}
      {timerState && (
        <TimerPopup
          state={timerState}
          date={date}
          onComplete={handleTimerComplete}
          onClose={() => setTimerState(null)}
        />
      )}
    </div>
  )
}

// ─── Timer popup ─────────────────────────────────────────────────────────────

function TimerPopup({ state, date, onComplete, onClose }: {
  state: TimerState; date: string; onComplete: (habitId: string) => void; onClose: () => void
}) {
  const [remaining, setRemaining] = useState(state.duration)
  const [running, setRunning] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Timer tick
  useState(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    const tick = () => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (interval) clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }
    // We use a custom approach — start/stop controlled by 'running' via effect below
    return () => { if (interval) clearInterval(interval) }
  })

  // Use effect for the actual timer
  const [intervalRef, setIntervalRef] = useState<ReturnType<typeof setInterval> | null>(null)

  const toggleRunning = () => {
    if (running) {
      // Pause
      if (intervalRef) clearInterval(intervalRef)
      setIntervalRef(null)
      setRunning(false)
    } else {
      // Start
      const id = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(id)
            setRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setIntervalRef(id)
      setRunning(true)
    }
  }

  const handleDone = () => {
    if (intervalRef) clearInterval(intervalRef)
    startTransition(async () => {
      await toggleCompletionAction(state.habitId, date)
      onComplete(state.habitId)
    })
  }

  const totalSec = state.duration
  const elapsed = totalSec - remaining
  const pct = totalSec > 0 ? (elapsed / totalSec) * 100 : 0
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  // Progress ring
  const R = 72
  const circumference = 2 * Math.PI * R
  const dash = (pct / 100) * circumference

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px]" onClick={onClose}
        style={{ animation: "fade-in 0.15s ease-out" }} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ animation: "timer-enter 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[13px] font-semibold"
              style={{ backgroundColor: state.habitColor }}>
              {state.habitIcon || state.habitName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#37322F] truncate">{state.habitName}</p>
              <p className="text-[11px] text-[rgba(55,50,47,0.40)]">{Math.floor(totalSec / 60)} min session</p>
            </div>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-[rgba(55,50,47,0.35)] hover:text-[#37322F] rounded transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Timer ring */}
          <div className="flex flex-col items-center py-8 gap-5">
            <div className="relative">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(55,50,47,0.06)" strokeWidth="6" />
                <circle cx="80" cy="80" r={R} fill="none" stroke={state.habitColor} strokeWidth="6"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={circumference / 4} strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.4s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[36px] font-normal tabular-nums text-[#37322F] leading-none"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[rgba(55,50,47,0.38)] font-semibold mt-1.5">
                  {remaining === 0 ? "Complete" : running ? "Running" : "Paused"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {remaining > 0 ? (
                <button onClick={toggleRunning}
                  className="flex items-center justify-center w-12 h-12 rounded-full text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: state.habitColor }}>
                  {running ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="3" y="2" width="3" height="10" rx="1" fill="white" />
                      <rect x="8" y="2" width="3" height="10" rx="1" fill="white" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M4 2.5L11 7L4 11.5V2.5Z" fill="white" />
                    </svg>
                  )}
                </button>
              ) : (
                <button onClick={handleDone} disabled={isPending}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: state.habitColor }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isPending ? "Saving..." : "Mark complete"}
                </button>
              )}

              {remaining > 0 && remaining < totalSec && (
                <button onClick={handleDone} disabled={isPending}
                  className="text-[11px] font-medium text-[rgba(55,50,47,0.45)] hover:text-[#37322F] transition-colors underline underline-offset-2">
                  {isPending ? "Saving..." : "Finish early"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes timer-enter {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ─── Individual habit row ────────────────────────────────────────────────────

function HabitRow({
  habit, isCompleted, streak, date, onToggle, onStartTimer,
}: {
  habit: Habit
  isCompleted: boolean
  streak?: StreakInfo
  date: string
  onToggle: () => void
  onStartTimer: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState("")

  const isTimerHabit = habit.habitType === "timer" && (habit.timerDuration ?? 0) > 0

  const handleToggle = () => {
    if (isTimerHabit && !isCompleted) {
      onStartTimer()
      return
    }
    onToggle()
    startTransition(async () => {
      await toggleCompletionAction(habit.id, date, note || undefined)
    })
  }

  return (
    <div
      className={[
        "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150",
        isCompleted
          ? "bg-[rgba(55,50,47,0.03)]"
          : "hover:bg-[rgba(55,50,47,0.025)]",
      ].join(" ")}
    >
      {/* Check button / Timer button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="relative flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200"
        style={{
          borderColor: isCompleted ? habit.color : "rgba(55,50,47,0.18)",
          backgroundColor: isCompleted ? habit.color : "transparent",
        }}
      >
        {isCompleted ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            className="transition-transform duration-150"
            style={{ animation: "check-pop 0.2s ease-out" }}
          >
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : isTimerHabit ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6.5" r="4" stroke="rgba(55,50,47,0.35)" strokeWidth="1.1" />
            <path d="M6 4.5V6.5L7.5 7.5" stroke="rgba(55,50,47,0.35)" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        ) : null}
      </button>

      {/* Icon */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-semibold transition-opacity"
        style={{
          backgroundColor: habit.color,
          opacity: isCompleted ? 0.55 : 1,
        }}
      >
        {habit.icon || habit.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + desc + timer tag */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p
            className={[
              "text-[14px] font-medium leading-tight transition-all duration-200",
              isCompleted
                ? "line-through text-[rgba(55,50,47,0.35)]"
                : "text-[#37322F]",
            ].join(" ")}
          >
            {habit.name}
          </p>
          {isTimerHabit && !isCompleted && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[rgba(55,50,47,0.06)] text-[rgba(55,50,47,0.45)]">
              {habit.timerDuration}m
            </span>
          )}
        </div>
        {habit.description && (
          <p className="text-[11.5px] text-[rgba(55,50,47,0.35)] leading-tight mt-0.5 truncate">
            {habit.description}
          </p>
        )}
      </div>

      {/* Streak badge */}
      {streak && streak.currentStreak > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[rgba(55,50,47,0.05)] flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1C6 1 3 3.5 3 6C3 8.21 4.567 10 6 10C7.433 10 9 8.21 9 6C9 5 8.5 4 7.75 3.25C7.75 3.25 7.75 4.5 7 5C6.6 3.5 6 1 6 1Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(55,50,47,0.40)]"/>
          </svg>
          <span className="text-[11px] font-semibold text-[rgba(55,50,47,0.50)] tabular-nums">
            {streak.currentStreak}d
          </span>
        </div>
      )}

      {/* Note toggle */}
      <button
        type="button"
        onClick={() => setNoteOpen(!noteOpen)}
        className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[rgba(55,50,47,0.25)] hover:text-[rgba(55,50,47,0.55)] opacity-0 group-hover:opacity-100 transition-all"
        title="Add a note"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 10L5 9L10 4L8 2L3 7L2 10Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          <path d="M7 3L9 5" stroke="currentColor" strokeWidth="1.1"/>
        </svg>
      </button>

      {/* Note input (slides in) */}
      {noteOpen && (
        <div className="absolute right-4 top-full mt-1 z-10 bg-white rounded-lg border border-[rgba(55,50,47,0.12)] shadow-lg p-3 w-56" style={{ animation: "dialog-enter 0.1s ease-out" }}>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note..."
            className="w-full text-[12px] text-[#37322F] placeholder:text-[rgba(55,50,47,0.30)] outline-none"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") setNoteOpen(false) }}
          />
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes check-pop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dialog-enter {
          from { opacity: 0; transform: scale(0.97) translateY(2px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
