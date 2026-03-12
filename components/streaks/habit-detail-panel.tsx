"use client"

import { useMemo, useEffect } from "react"
import Link from "next/link"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Habit {
  id: string
  name: string
  description?: string | null
  color: string
  icon: string
  targetDays?: string[] | null
  createdAt: Date | string
}

interface HabitStreakData {
  habit: Habit
  currentStreak: number
  longestStreak: number
  last30: boolean[]
  totalCompletions: number
  completionRate: number
  isTrendingUp: boolean
  isTrendingDown: boolean
  completedToday: boolean
  allDates: string[]
}

interface HabitDetailPanelProps {
  data: HabitStreakData
  today: string
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const WEEKDAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function toDate(str: string) { return new Date(str + "T00:00:00") }
function fmtDate(str: string) {
  const d = toDate(str)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

// ─── Habit-specific heatmap (last 52 weeks, single color) ───────────────────

function HabitHeatmap({ allDates, color, today }: { allDates: string[]; color: string; today: string }) {
  const datesSet = useMemo(() => new Set(allDates), [allDates])

  const cells = useMemo(() => {
    const todayDate = toDate(today)
    const endSunday = new Date(todayDate)
    endSunday.setDate(todayDate.getDate() + (6 - todayDate.getDay()))
    const result: Array<{ date: string; col: number; row: number; month: number; day: number }> = []
    for (let i = 51 * 7 + 6; i >= 0; i--) {
      const d = new Date(endSunday); d.setDate(endSunday.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
      result.push({ date: dateStr, col: Math.floor((51*7+6-i)/7), row: (51*7+6-i)%7, month: d.getMonth(), day: d.getDate() })
    }
    return result
  }, [today])

  const cols = useMemo(() => {
    const c: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) c.push(cells.slice(i, i + 7))
    return c
  }, [cells])

  const monthLabels = useMemo(() => {
    const seen = new Set<number>(); const labels: {col:number;label:string}[] = []
    cols.forEach((col, ci) => {
      const m = col.find(c => c.day <= 7)?.month
      if (m !== undefined && !seen.has(m)) { seen.add(m); labels.push({col: ci, label: MONTH_NAMES[m]}) }
    })
    return labels
  }, [cols])

  const CELL = 11; const GAP = 2; const STEP = CELL + GAP
  const totalCols = 52

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: totalCols * STEP + 20 }}>
        {/* Month labels */}
        <div className="relative mb-1" style={{ height: 13, marginLeft: 20 }}>
          {monthLabels.map(({ col, label }) => (
            <span key={label} className="absolute text-[9.5px] text-[rgba(55,50,47,0.35)] font-medium" style={{ left: col * STEP }}>
              {label}
            </span>
          ))}
        </div>
        <div className="flex">
          {/* Weekday labels */}
          <div className="flex flex-col gap-[2px] mr-1.5">
            {["","M","","W","","F",""].map((l, i) => (
              <div key={i} className="text-[8px] text-[rgba(55,50,47,0.30)] flex items-center" style={{ height: CELL, width: 12 }}>{l}</div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[2px]">
            {cols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[2px]">
                {col.map((cell) => {
                  const done = datesSet.has(cell.date)
                  const isFuture = cell.date > today
                  return (
                    <div
                      key={cell.date}
                      className="rounded-sm"
                      title={`${fmtDate(cell.date)}${done ? " — completed" : ""}`}
                      style={{
                        width: CELL, height: CELL,
                        backgroundColor: done ? color : "rgba(55,50,47,0.07)",
                        opacity: isFuture ? 0.2 : done ? 0.9 : 1,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2 justify-end">
          <span className="text-[9px] text-[rgba(55,50,47,0.35)]">Less</span>
          {[0.12, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
            <div key={i} className="rounded-sm" style={{ width: CELL, height: CELL, backgroundColor: color, opacity: o }} />
          ))}
          <span className="text-[9px] text-[rgba(55,50,47,0.35)]">More</span>
        </div>
      </div>
    </div>
  )
}

// ─── Week strip (last 7 days) ─────────────────────────────────────────────────

function WeekStrip({ allDates, color, today }: { allDates: string[]; color: string; today: string }) {
  const datesSet = useMemo(() => new Set(allDates), [allDates])
  const days = useMemo(() => {
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(today + "T00:00:00"); d.setDate(d.getDate() - (6 - i))
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
      return { dateStr, day: d.getDate(), weekday: WEEKDAY_SHORT[d.getDay()], isToday: dateStr === today }
    })
  }, [today])

  return (
    <div className="flex gap-2 justify-between">
      {days.map(({ dateStr, day, weekday, isToday }) => {
        const done = datesSet.has(dateStr)
        return (
          <div key={dateStr} className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-semibold text-[rgba(55,50,47,0.40)] uppercase tracking-wider">{weekday}</span>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-150"
              style={{
                backgroundColor: done ? color : isToday ? "rgba(55,50,47,0.08)" : "transparent",
                color: done ? "white" : isToday ? "#37322F" : "rgba(55,50,47,0.45)",
                boxShadow: isToday && !done ? "0 0 0 1.5px rgba(55,50,47,0.35)" : done ? `0 0 0 1.5px ${color}` : "none",
              }}
            >
              {day}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Big completion ring ──────────────────────────────────────────────────────

function BigRing({ rate, color, current, total }: { rate: number; color: string; current: number; total: number }) {
  const R = 52; const cx = 60; const cy = 60
  const circumference = 2 * Math.PI * R
  const dash = (rate / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(55,50,47,0.07)" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease-out" }}
        />
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="22" fontWeight="500" fill="#37322F"
          fontFamily="var(--font-instrument-serif),Georgia,serif">
          {rate}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="rgba(55,50,47,0.45)" letterSpacing="1">
          COMPLETION
        </text>
        <text x={cx} y={cy + 26} textAnchor="middle" fontSize="8.5" fill="rgba(55,50,47,0.35)">
          {current} of {total} days
        </text>
      </svg>
    </div>
  )
}

// ─── Monthly bar chart (last 12 months) ──────────────────────────────────────

function MonthlyBars({ allDates, color, today }: { allDates: string[]; color: string; today: string }) {
  const months = useMemo(() => {
    const [ty, tm] = today.split("-").map(Number)
    const result: { label: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      let y = ty; let m = tm - i
      while (m < 1) { m += 12; y-- }
      const monthStr = `${y}-${String(m).padStart(2,"0")}`
      const count = allDates.filter(d => d.startsWith(monthStr)).length
      result.push({ label: MONTH_NAMES[m - 1], count })
    }
    return result
  }, [allDates, today])

  const maxCount = Math.max(...months.map(m => m.count), 1)
  const BAR_H = 48

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-3">Monthly activity</p>
      <div className="flex items-end gap-1.5">
        {months.map(({ label, count }, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm" style={{
              height: BAR_H,
              display: "flex", alignItems: "flex-end",
            }}>
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: `${Math.max(count > 0 ? 12 : 3, (count / maxCount) * BAR_H)}px`,
                  backgroundColor: color,
                  opacity: count > 0 ? 0.3 + (count / maxCount) * 0.65 : 0.1,
                }}
              />
            </div>
            <span className="text-[8px] text-[rgba(55,50,47,0.35)] font-medium">{label[0]}</span>
            {count > 0 && <span className="text-[8px] text-[rgba(55,50,47,0.50)] tabular-nums">{count}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function HabitDetailPanel({ data, today, onClose }: HabitDetailPanelProps) {
  const { habit, currentStreak, longestStreak, allDates, totalCompletions, completionRate, completedToday } = data

  const daysSinceCreated = useMemo(() => {
    const created = new Date(habit.createdAt)
    const todayDate = toDate(today)
    return Math.max(1, Math.round((todayDate.getTime() - created.getTime()) / 86400000))
  }, [habit.createdAt, today])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const streakMessage = currentStreak === 0
    ? "Start your streak today."
    : currentStreak < 3
    ? "Good start. Keep building."
    : currentStreak < 7
    ? "You are building momentum."
    : currentStreak < 30
    ? `${currentStreak} days and counting. Keep it up.`
    : `${currentStreak} days. Exceptional consistency.`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: "fade-in 0.15s ease-out" }}
      />

      {/* Sliding panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[520px] bg-[#F7F5F3] shadow-[−16px_0_60px_rgba(55,50,47,0.18)] overflow-y-auto flex flex-col"
        style={{ animation: "slide-in-right 0.22s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F7F5F3]/95 backdrop-blur-sm px-6 pt-6 pb-4 border-b border-[rgba(55,50,47,0.09)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0"
                style={{ backgroundColor: habit.color }}
              >
                {habit.icon || habit.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-[18px] font-normal text-[#37322F] leading-tight"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                  {habit.name}
                </h2>
                {habit.description && (
                  <p className="text-[11.5px] text-[rgba(55,50,47,0.45)] mt-0.5">{habit.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[rgba(55,50,47,0.40)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.07)] transition-colors flex-shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 2L11 11M11 2L2 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 py-5 flex flex-col gap-6">
          {/* Streak banner (like the reference's "24 Days Streak") */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ backgroundColor: currentStreak > 0 ? `${habit.color}14` : "rgba(55,50,47,0.05)" }}
          >
            <div className="flex items-center gap-2.5">
              {currentStreak > 0 && (
                <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                  <path d="M7 1C7 1 3.5 5 3.5 8.5C3.5 10.5 4.5 12 5.5 13.1C5.5 11 6 9.5 7 8.5C7 11 8 13.5 7 15.5C8 14 9 12.5 9 10.75C10 11.75 10.5 13 10.5 14.5C11.5 13 12 11 12 8.5C12 5 7 1 7 1Z"
                    fill={currentStreak >= 7 ? "#f97316" : habit.color} fillOpacity="0.85" />
                </svg>
              )}
              <span className="text-[13px] font-semibold text-[#37322F]">{streakMessage}</span>
            </div>
            <Link
              href="/habits"
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: habit.color }}
            >
              Check in
            </Link>
          </div>

          {/* Last 7 days */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-3">This week</p>
            <WeekStrip allDates={allDates} color={habit.color} today={today} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Current" value={`${currentStreak}d`} color={habit.color} highlight={currentStreak > 0} />
            <StatBox label="Best" value={`${longestStreak}d`} />
            <StatBox label="Total" value={`${totalCompletions}`} sub="completions" />
          </div>

          {/* Completion ring + monthly bars side by side */}
          <div className="flex items-end gap-6">
            <BigRing rate={completionRate} color={habit.color} current={totalCompletions} total={daysSinceCreated} />
            <div className="flex-1">
              <MonthlyBars allDates={allDates} color={habit.color} today={today} />
            </div>
          </div>

          {/* Year heatmap */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-3">
              Year activity
            </p>
            <HabitHeatmap allDates={allDates} color={habit.color} today={today} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}

// ─── Mini stat box ─────────────────────────────────────────────────────────────

function StatBox({ label, value, sub, color, highlight }: { label: string; value: string; sub?: string; color?: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-white border border-[rgba(55,50,47,0.09)]">
      <span className="text-[22px] font-normal leading-none tabular-nums"
        style={{ fontFamily: "var(--font-instrument-serif),Georgia,serif", color: highlight && color ? color : "#37322F" }}>
        {value}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(55,50,47,0.38)]">{label}</span>
      {sub && <span className="text-[9.5px] text-[rgba(55,50,47,0.35)]">{sub}</span>}
    </div>
  )
}
