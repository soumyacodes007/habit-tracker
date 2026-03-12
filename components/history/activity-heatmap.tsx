"use client"

import { useMemo } from "react"

interface Habit {
  id: string
  color: string
}

interface Completion {
  habitId: string
  completedDate: string
}

interface ActivityHeatmapProps {
  habits: Habit[]
  completions: Completion[]
  today: string
  onDayClick: (date: string) => void
  selectedDate: string | null
}

const WEEKDAYS = ["", "M", "", "W", "", "F", ""]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00")
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function ActivityHeatmap({
  habits, completions, today, onDayClick, selectedDate,
}: ActivityHeatmapProps) {
  // Build per-date completion count and first habit color maps
  const dateMap = useMemo(() => {
    const map: Record<string, { count: number; total: number; color: string }> = {}
    const byDate: Record<string, string[]> = {}

    for (const c of completions) {
      if (!byDate[c.completedDate]) byDate[c.completedDate] = []
      byDate[c.completedDate].push(c.habitId)
    }

    for (const [date, ids] of Object.entries(byDate)) {
      const firstHabit = habits.find((h) => ids.includes(h.id))
      map[date] = {
        count: ids.length,
        total: habits.length,
        color: firstHabit?.color ?? "#37322F",
      }
    }
    return map
  }, [completions, habits])

  // Build last 371 days grid (53 cols × 7 rows) starting from the most recent Sunday
  const cells = useMemo(() => {
    const todayDate = new Date(today + "T00:00:00")
    // Walk back to the preceding Sunday so the grid aligns cleanly
    const endSunday = new Date(todayDate)
    endSunday.setDate(todayDate.getDate() + (6 - todayDate.getDay()))

    const grid: Array<{ date: string; dayOfWeek: number; month: number; day: number }> = []
    for (let i = 52 * 7 + 6; i >= 0; i--) {
      const d = new Date(endSunday)
      d.setDate(endSunday.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      grid.push({ date: dateStr, dayOfWeek: d.getDay(), month: d.getMonth(), day: d.getDate() })
    }
    return grid
  }, [today])

  // Group into 53-column structure
  const cols = useMemo(() => {
    const result: Array<typeof cells> = []
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7))
    }
    return result
  }, [cells])

  // Month label positions (in col index)
  const monthLabels = useMemo(() => {
    const seen = new Set<number>()
    const labels: Array<{ col: number; label: string }> = []
    cols.forEach((col, ci) => {
      const m = col.find((c) => c.day <= 7)?.month
      if (m !== undefined && !seen.has(m)) {
        seen.add(m)
        labels.push({ col: ci, label: MONTHS[m] })
      }
    })
    return labels
  }, [cols])

  const CELL = 11
  const GAP = 2
  const STEP = CELL + GAP

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: 53 * STEP + 24 }}>
        {/* Month labels */}
        <div className="relative mb-1" style={{ height: 14, marginLeft: 24 }}>
          {monthLabels.map(({ col, label }) => (
            <span
              key={label}
              className="absolute text-[10px] font-medium text-[rgba(55,50,47,0.38)]"
              style={{ left: col * STEP }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-0">
          {/* Weekday labels */}
          <div className="flex flex-col gap-[2px] mr-2">
            {WEEKDAYS.map((label, i) => (
              <div
                key={i}
                className="text-[9px] font-medium text-[rgba(55,50,47,0.35)] flex items-center"
                style={{ width: 12, height: CELL }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {cols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[2px]">
                {col.map((cell) => {
                  const info = dateMap[cell.date]
                  const isFuture = cell.date > today
                  const isSelected = selectedDate === cell.date
                  const pct = info ? Math.min(info.count / Math.max(info.total, 1), 1) : 0
                  const opacity = info ? 0.20 + pct * 0.80 : 0

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      title={cell.date}
                      onClick={() => !isFuture && onDayClick(cell.date)}
                      disabled={isFuture}
                      className="rounded-sm transition-all duration-100 flex-shrink-0"
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: info
                          ? info.color
                          : "rgba(55,50,47,0.07)",
                        opacity: isFuture ? 0.25 : info ? opacity : 1,
                        outline: isSelected ? `2px solid ${info?.color ?? "#37322F"}` : "none",
                        outlineOffset: 1,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-[rgba(55,50,47,0.38)]">Less</span>
          {[0.1, 0.3, 0.55, 0.75, 1.0].map((o, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{ width: CELL, height: CELL, backgroundColor: "#37322F", opacity: o }}
            />
          ))}
          <span className="text-[10px] text-[rgba(55,50,47,0.38)]">More</span>
        </div>
      </div>
    </div>
  )
}
