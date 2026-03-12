"use client"

import { useState } from "react"
import Link from "next/link"
import HabitDetailPanel from "./habit-detail-panel"

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface StreaksClientProps {
  habitData: HabitStreakData[]
  today: string
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function FlameIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="16" viewBox="0 0 13 16" fill="none">
      <path
        d="M6.5 1C6.5 1 3 4 3 7.5C3 9.04 3.5 10.3 4.25 11.2C4.25 11.2 4.25 9.5 5.5 8.5C5.5 10.5 6 12.5 6.5 13.5C7 12 7.75 10.75 7.75 9.5C8.5 10.25 9 11.25 9 12.5C9.5 11.5 10 10.25 10 8.5C10 5 6.5 1 6.5 1Z"
        fill={color}
        fillOpacity="0.85"
      />
      <path
        d="M6.5 9.5C6.5 9.5 5 10.5 5 12C5 13.38 5.67 14.5 6.5 14.5C7.33 14.5 8 13.38 8 12C8 10.5 6.5 9.5 6.5 9.5Z"
        fill={color}
        fillOpacity="0.5"
      />
    </svg>
  )
}

function TrendUp() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 9L5 5.5L7.5 7.5L10 3" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3H10V5" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 3L5 6.5L7.5 4.5L10 9" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9H10V7" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Sparkline (last 30 days bar chart) ──────────────────────────────────────

function Sparkline({ data, color }: { data: boolean[]; color: string }) {
  const W = 4
  const GAP = 2
  const H = 28
  const total = data.length

  return (
    <svg
      width={total * (W + GAP) - GAP}
      height={H}
      viewBox={`0 0 ${total * (W + GAP) - GAP} ${H}`}
      className="overflow-visible"
    >
      {data.map((done, i) => (
        <rect
          key={i}
          x={i * (W + GAP)}
          y={done ? 0 : H * 0.45}
          width={W}
          height={done ? H : H * 0.55}
          rx="1.5"
          fill={color}
          fillOpacity={done ? 0.85 : 0.12}
        />
      ))}
    </svg>
  )
}

// ─── Circular completion rate arc ────────────────────────────────────────────

function RateArc({ rate, color }: { rate: number; color: string }) {
  const R = 16
  const cx = 20
  const cy = 20
  const circumference = 2 * Math.PI * R
  const dash = (rate / 100) * circumference

  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(55,50,47,0.08)" strokeWidth="3" />
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={circumference / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease-out" }}
      />
    </svg>
  )
}

// ─── Streak Card ─────────────────────────────────────────────────────────────

function StreakCard({ data, rank, onSelect }: { data: HabitStreakData; rank: number; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  const { habit, currentStreak, longestStreak, last30, totalCompletions, completionRate, isTrendingUp, isTrendingDown, completedToday } = data

  const isOnFire = currentStreak >= 7
  const isLongestActive = currentStreak > 0 && currentStreak === longestStreak

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      className={[
        "relative group flex flex-col gap-0 rounded-2xl overflow-hidden bg-white cursor-pointer",
        "border transition-all duration-200",
        hovered
          ? "border-[rgba(55,50,47,0.20)] shadow-[0_8px_28px_rgba(55,50,47,0.13)]"
          : "border-[rgba(55,50,47,0.09)] shadow-[0_1px_4px_rgba(55,50,47,0.06)]",
        "transform-gpu",
      ].join(" ")}
      style={{
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Color band at top */}
      <div className="h-1 w-full" style={{ backgroundColor: habit.color }} />

      {/* Card body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0 transition-transform duration-200"
            style={{
              backgroundColor: habit.color,
              transform: hovered ? "scale(1.07)" : "scale(1)",
            }}
          >
            {habit.icon || habit.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14.5px] font-semibold text-[#37322F] leading-tight truncate">{habit.name}</p>
              {isLongestActive && currentStreak > 0 && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `${habit.color}18`, color: habit.color }}>
                  Best
                </span>
              )}
            </div>
            {habit.description && (
              <p className="text-[11.5px] text-[rgba(55,50,47,0.40)] mt-0.5 truncate">{habit.description}</p>
            )}
          </div>
          {/* Status dot */}
          <div
            className={["w-2 h-2 rounded-full flex-shrink-0 transition-colors", completedToday ? "" : "bg-[rgba(55,50,47,0.12)]"].join(" ")}
            style={completedToday ? { backgroundColor: habit.color } : undefined}
            title={completedToday ? "Completed today" : "Not done today"}
          />
        </div>

        {/* Main streak numbers */}
        <div className="flex items-stretch gap-4">
          {/* Current streak */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              {currentStreak > 0 && <FlameIcon color={isOnFire ? "#f97316" : "rgba(55,50,47,0.35)"} />}
              <span
                className="text-[36px] font-normal leading-none tabular-nums text-[#37322F]"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
              >
                {currentStreak}
              </span>
              {isTrendingUp && <TrendUp />}
              {isTrendingDown && <TrendDown />}
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">
              Current streak
            </p>
          </div>

          <div className="w-px bg-[rgba(55,50,47,0.07)] self-stretch" />

          {/* Longest streak */}
          <div className="flex-1">
            <span
              className="text-[36px] font-normal leading-none tabular-nums text-[rgba(55,50,47,0.45)]"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
            >
              {longestStreak}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mt-0.5">
              Personal best
            </p>
          </div>

          <div className="w-px bg-[rgba(55,50,47,0.07)] self-stretch" />

          {/* Completion rate arc */}
          <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="relative">
              <RateArc rate={completionRate} color={habit.color} />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#37322F]">
                {completionRate}%
              </span>
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[rgba(55,50,47,0.35)]">Rate</p>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.35)]">Last 30 days</p>
            <p className="text-[10px] text-[rgba(55,50,47,0.38)] tabular-nums">
              {last30.filter(Boolean).length} of 30
            </p>
          </div>
          <Sparkline data={last30} color={habit.color} />
        </div>

        {/* Footer stats row */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(55,50,47,0.07)]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[rgba(55,50,47,0.40)]">
              <span className="font-semibold text-[#37322F]">{totalCompletions}</span> total
            </span>
            {currentStreak === 0 && longestStreak > 0 && (
              <span className="text-[11px] text-[rgba(55,50,47,0.35)]">Streak broke</span>
            )}
            {currentStreak === 0 && longestStreak === 0 && (
              <span className="text-[11px] text-[rgba(55,50,47,0.35)]">Not started</span>
            )}
          </div>
          <Link
            href="/habits"
            className="text-[10.5px] font-medium text-[rgba(55,50,47,0.38)] hover:text-[#37322F] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Check in &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StreaksClient({ habitData, today }: StreaksClientProps) {
  const [selectedHabit, setSelectedHabit] = useState<HabitStreakData | null>(null)

  // Aggregate stats
  const totalActive = habitData.filter((d) => d.currentStreak > 0).length
  const highestStreak = habitData.reduce((m, d) => Math.max(m, d.currentStreak), 0)
  const bestHabit = habitData.find((d) => d.currentStreak === highestStreak)
  const completedTodayCount = habitData.filter((d) => d.completedToday).length

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="px-8 md:px-12 pt-10 pb-6 border-b border-[rgba(55,50,47,0.08)] flex-shrink-0">
        <h1
          className="text-[28px] md:text-[32px] font-normal text-[#37322F] leading-tight"
          style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
        >
          Streaks
        </h1>

        {/* Summary band */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
          <SummaryPill label="Active streaks" value={`${totalActive}`} sub={`of ${habitData.length} habits`} />
          <div className="h-6 w-px bg-[rgba(55,50,47,0.10)]" />
          <SummaryPill label="Highest streak" value={`${highestStreak}d`} sub={bestHabit?.habit.name ?? "—"} color={bestHabit?.habit.color} />
          <div className="h-6 w-px bg-[rgba(55,50,47,0.10)]" />
          <SummaryPill label="Done today" value={`${completedTodayCount}`} sub={`of ${habitData.length}`} />
        </div>
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        {habitData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(55,50,47,0.05)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2C11 2 6 6.5 6 11C6 14.31 8.13 17 11 17C13.87 17 16 14.31 16 11C16 9 15.02 7 13.51 5.5C13.51 7.5 12.5 9 11 10C11 7 11 2 11 2Z" stroke="#37322F" strokeWidth="1.3" strokeOpacity="0.35" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-[rgba(55,50,47,0.55)]">No habits tracked yet</p>
              <p className="text-[12.5px] text-[rgba(55,50,47,0.35)] mt-1">Create habits and start checking them off to build streaks</p>
            </div>
            <Link
              href="/habits"
              className="mt-1 px-5 py-2.5 rounded-full bg-[#37322F] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
            >
              Go to Habits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {habitData.map((data, i) => (
              <StreakCard
                key={data.habit.id}
                data={data}
                rank={i + 1}
                onSelect={() => setSelectedHabit(data)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedHabit && (
        <HabitDetailPanel
          data={selectedHabit}
          today={today}
          onClose={() => setSelectedHabit(null)}
        />
      )}
    </div>
  )
}

// ─── Summary pill ─────────────────────────────────────────────────────────────

function SummaryPill({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <div>
        <div className="flex items-center gap-1.5">
          {color && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
          <span
            className="text-[22px] font-normal text-[#37322F] leading-none tabular-nums"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {value}
          </span>
        </div>
        <p className="text-[10.5px] text-[rgba(55,50,47,0.42)] mt-0.5">
          <span className="font-semibold">{label}</span> &middot; {sub}
        </p>
      </div>
    </div>
  )
}
