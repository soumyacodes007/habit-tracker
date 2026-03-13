"use client"

import { useState, useTransition } from "react"
import { batchAnalyzeAction } from "@/app/actions/insights"

// ─── Types ───────────────────────────────────────────────────────────────────

interface InsightEntry {
  id: string
  date: string
  content: string
  mood: string | null
  sentiment: string | null
  themes: string[] | null
  aiSummary: string | null
}

interface InsightsClientProps {
  entries: InsightEntry[]
  today: string
}

// ─── Sentiment config ────────────────────────────────────────────────────────

const SENTIMENT_META: Record<string, { label: string; color: string; level: number }> = {
  positive:   { label: "Positive",   color: "#10b981", level: 5 },
  grateful:   { label: "Grateful",   color: "#06b6d4", level: 5 },
  neutral:    { label: "Neutral",    color: "#64748b", level: 3 },
  anxious:    { label: "Anxious",    color: "#f59e0b", level: 2 },
  lethargic:  { label: "Lethargic",  color: "#8b5cf6", level: 1 },
  frustrated: { label: "Frustrated", color: "#ef4444", level: 1 },
}

function getSentimentMeta(s: string | null) {
  if (!s) return { label: "Pending", color: "rgba(55,50,47,0.20)", level: 3 }
  return SENTIMENT_META[s] ?? { label: s, color: "#64748b", level: 3 }
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${months[m - 1]} ${d}`
}

function formatDayLabel(dateStr: string, today: string): string {
  if (dateStr === today) return "Today"
  const [y, m, d] = today.split("-").map(Number)
  const yd = new Date(y, m - 1, d)
  yd.setDate(yd.getDate() - 1)
  const yds = `${yd.getFullYear()}-${String(yd.getMonth() + 1).padStart(2, "0")}-${String(yd.getDate()).padStart(2, "0")}`
  if (dateStr === yds) return "Yesterday"
  return formatShortDate(dateStr)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InsightsClient({ entries, today }: InsightsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [batchResult, setBatchResult] = useState<string | null>(null)

  const analyzed = entries.filter((e) => e.sentiment)
  const unanalyzed = entries.filter((e) => !e.sentiment)

  // Aggregate themes
  const themeFreq = new Map<string, number>()
  for (const e of analyzed) {
    for (const t of e.themes ?? []) {
      themeFreq.set(t, (themeFreq.get(t) ?? 0) + 1)
    }
  }
  const sortedThemes = [...themeFreq.entries()].sort((a, b) => b[1] - a[1])

  // Sentiment distribution
  const sentimentCounts = new Map<string, number>()
  for (const e of analyzed) {
    sentimentCounts.set(e.sentiment!, (sentimentCounts.get(e.sentiment!) ?? 0) + 1)
  }

  // Build 14-day timeline
  const dayEntries: { date: string; entry: InsightEntry | null }[] = []
  for (let i = 13; i >= 0; i--) {
    const [y, m, d] = today.split("-").map(Number)
    const dt = new Date(y, m - 1, d)
    dt.setDate(dt.getDate() - i)
    const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
    dayEntries.push({ date: ds, entry: entries.find((e) => e.date === ds) ?? null })
  }

  // Dominant sentiment
  const dominant = analyzed.length > 0
    ? [...sentimentCounts.entries()].sort((a, b) => b[1] - a[1])[0]
    : null

  const handleBatchAnalyze = () => {
    startTransition(async () => {
      const result = await batchAnalyzeAction()
      if (result.data) {
        setBatchResult(`Analyzed ${result.data.analyzed} of ${result.data.total} entries`)
        setTimeout(() => setBatchResult(null), 4000)
      }
    })
  }

  // Chart dimensions
  const chartW = 560
  const chartH = 120
  const padX = 30
  const padY = 15
  const plotW = chartW - padX * 2
  const plotH = chartH - padY * 2

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
              Mood Ring
            </h1>
            <p className="text-[13px] text-[rgba(55,50,47,0.42)] mt-1">
              AI-powered emotional insights from your journal — last 14 days
            </p>
          </div>

          {unanalyzed.length > 0 && (
            <button
              onClick={handleBatchAnalyze}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#37322F] text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {isPending ? "Analyzing..." : `Analyze ${unanalyzed.length} entries`}
            </button>
          )}
        </div>

        {batchResult && (
          <p className="text-[12px] text-emerald-600 font-medium mt-2">{batchResult}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(55,50,47,0.05)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#37322F" strokeWidth="1.3" strokeOpacity="0.35" />
                <path d="M7 13C7 13 8.5 15 11 15C13.5 15 15 13 15 13" stroke="#37322F" strokeWidth="1.3" strokeOpacity="0.35" strokeLinecap="round" />
                <circle cx="8.5" cy="9" r="1" fill="#37322F" fillOpacity="0.35" />
                <circle cx="13.5" cy="9" r="1" fill="#37322F" fillOpacity="0.35" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-[rgba(55,50,47,0.55)]">No journal entries yet</p>
            <p className="text-[12.5px] text-[rgba(55,50,47,0.35)]">Write in your journal to see emotional insights here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* ──── Summary strip ──── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-[rgba(55,50,47,0.08)] shadow-[0_1px_3px_rgba(55,50,47,0.04)]">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">
                  Entries
                </span>
                <span className="text-[24px] font-normal text-[#37322F] tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                  {entries.length}
                </span>
                <span className="text-[11px] text-[rgba(55,50,47,0.40)]">in 14 days</span>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-[rgba(55,50,47,0.08)] shadow-[0_1px_3px_rgba(55,50,47,0.04)]">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">
                  Dominant mood
                </span>
                {dominant ? (
                  <>
                    <span className="text-[24px] font-normal leading-none"
                      style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", color: getSentimentMeta(dominant[0]).color }}>
                      {getSentimentMeta(dominant[0]).label}
                    </span>
                    <span className="text-[11px] text-[rgba(55,50,47,0.40)]">{dominant[1]} of {analyzed.length} entries</span>
                  </>
                ) : (
                  <span className="text-[13px] text-[rgba(55,50,47,0.35)]">Pending analysis</span>
                )}
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-[rgba(55,50,47,0.08)] shadow-[0_1px_3px_rgba(55,50,47,0.04)]">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)]">
                  Top theme
                </span>
                {sortedThemes.length > 0 ? (
                  <>
                    <span className="text-[24px] font-normal text-[#37322F] leading-none truncate"
                      style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                      {sortedThemes[0][0]}
                    </span>
                    <span className="text-[11px] text-[rgba(55,50,47,0.40)]">{sortedThemes[0][1]} mentions</span>
                  </>
                ) : (
                  <span className="text-[13px] text-[rgba(55,50,47,0.35)]">Pending analysis</span>
                )}
              </div>
            </div>

            {/* ──── Sentiment timeline ──── */}
            <div className="rounded-xl bg-white border border-[rgba(55,50,47,0.08)] shadow-[0_1px_3px_rgba(55,50,47,0.04)] p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-4">
                Sentiment timeline
              </h2>
              <div className="overflow-x-auto">
                <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[560px]">
                  {/* Grid lines */}
                  {[1, 2, 3, 4, 5].map((level) => {
                    const y = padY + plotH - ((level - 1) / 4) * plotH
                    return (
                      <line key={level} x1={padX} y1={y} x2={padX + plotW} y2={y}
                        stroke="rgba(55,50,47,0.06)" strokeWidth="1" />
                    )
                  })}

                  {/* Data points + line */}
                  {(() => {
                    const points: { x: number; y: number; color: string; date: string; label: string }[] = []
                    dayEntries.forEach((de, i) => {
                      if (!de.entry?.sentiment) return
                      const meta = getSentimentMeta(de.entry.sentiment)
                      const x = padX + (i / 13) * plotW
                      const y = padY + plotH - ((meta.level - 1) / 4) * plotH
                      points.push({ x, y, color: meta.color, date: de.date, label: meta.label })
                    })

                    if (points.length === 0) return null

                    // Line path
                    const pathD = points.map((p, i) =>
                      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                    ).join(" ")

                    return (
                      <>
                        <path d={pathD} fill="none" stroke="rgba(55,50,47,0.18)" strokeWidth="1.5" />
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4.5" fill={p.color} stroke="white" strokeWidth="2" />
                          </g>
                        ))}
                      </>
                    )
                  })()}

                  {/* X-axis labels */}
                  {dayEntries.map((de, i) => {
                    if (i % 2 !== 0 && i !== 13) return null // show every other day
                    const x = padX + (i / 13) * plotW
                    return (
                      <text key={de.date} x={x} y={chartH - 2} textAnchor="middle"
                        className="text-[8px] fill-[rgba(55,50,47,0.35)]">
                        {formatShortDate(de.date)}
                      </text>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* ──── Sentiment distribution + Mood Calendar ──── */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6 items-start">
              {/* Sentiment distribution */}
              <div className="rounded-xl bg-white border border-[rgba(55,50,47,0.08)] shadow-[0_1px_3px_rgba(55,50,47,0.04)] p-5 h-full">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-4">
                  Sentiment breakdown
                </h2>
                {analyzed.length === 0 ? (
                  <p className="text-[12.5px] text-[rgba(55,50,47,0.35)]">No analyzed entries yet</p>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {[...sentimentCounts.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .map(([s, count]) => {
                        const meta = getSentimentMeta(s)
                        const pct = Math.round((count / analyzed.length) * 100)
                        return (
                          <div key={s} className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                            <span className="text-[13px] text-[#37322F] font-medium w-24">{meta.label}</span>
                            <div className="flex-1 h-[6px] rounded-full bg-[rgba(55,50,47,0.06)] overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: meta.color, opacity: 0.8 }} />
                            </div>
                            <span className="text-[11.5px] text-[rgba(55,50,47,0.40)] font-semibold tabular-nums w-8 text-right">
                              {pct}%
                            </span>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Mood Calendar */}
              <div className="rounded-[1.25rem] bg-white border border-[rgba(55,50,47,0.08)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-[#37322F] leading-none" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                    {new Date(Number(today.split("-")[0]), Number(today.split("-")[1]) - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                  </h2>
                  <span className="text-[11px] font-semibold text-[rgba(55,50,47,0.40)] bg-[rgba(55,50,47,0.04)] px-2 py-1 rounded-full">
                    {analyzed.length} Moods
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-y-3 gap-x-1.5 text-center">
                  {/* Days of week header */}
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div key={i} className="text-[11px] font-bold text-[rgba(55,50,47,0.45)] mb-2">
                      {d}
                    </div>
                  ))}

                  {/* Calendar grid cells */}
                  {(() => {
                    const [y, m] = today.split("-").map(Number)
                    const currentMonth = new Date(y, m - 1, 1)
                    const startDayOfWeek = currentMonth.getDay()
                    const shift = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

                    const calendarStart = new Date(currentMonth)
                    calendarStart.setDate(currentMonth.getDate() - shift)

                    const cells = []
                    for (let i = 0; i < 35; i++) { // 5 rows
                      const d = new Date(calendarStart)
                      d.setDate(calendarStart.getDate() + i)
                      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                      const isCurrentMonth = d.getMonth() === (m - 1)
                      const isToday = dStr === today
                      const entry = entries.find(e => e.date === dStr)
                      const sentiment = entry?.sentiment
                      const meta = sentiment ? getSentimentMeta(sentiment) : null

                      // Determine face type
                      const isGood = sentiment && ["positive", "happy", "grateful"].includes(sentiment)
                      const isNeutral = sentiment && ["neutral"].includes(sentiment)
                      const isBad = sentiment && !isGood && !isNeutral

                      cells.push(
                        <div key={dStr} className={`relative flex flex-col items-center justify-center h-10 ${!isCurrentMonth ? "opacity-30" : ""}`}>
                          {sentiment && meta ? (
                            <div
                              className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[#37322F] shadow-sm transform transition-transform hover:scale-110 z-10"
                              style={{ backgroundColor: meta.color }}
                              title={`${meta.label} - ${formatShortDate(dStr)}`}
                            >
                              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                {isGood ? (
                                  <>
                                    <circle cx="6.5" cy="7" r="1.3" fill="currentColor" opacity="0.6" />
                                    <circle cx="11.5" cy="7" r="1.3" fill="currentColor" opacity="0.6" />
                                    <path d="M5.5 10.5C5.5 10.5 7 12.5 9 12.5C11 12.5 12.5 10.5 12.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
                                  </>
                                ) : isNeutral ? (
                                  <>
                                    <circle cx="6.5" cy="7" r="1.3" fill="currentColor" opacity="0.5" />
                                    <circle cx="11.5" cy="7" r="1.3" fill="currentColor" opacity="0.5" />
                                    <path d="M6 11.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
                                  </>
                                ) : (
                                  <>
                                    <circle cx="6.5" cy="8" r="1.3" fill="currentColor" opacity="0.7" />
                                    <circle cx="11.5" cy="8" r="1.3" fill="currentColor" opacity="0.7" />
                                    <path d="M5.5 12C5.5 12 7 10 9 10C11 10 12.5 12 12.5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
                                  </>
                                )}
                              </svg>
                            </div>
                          ) : (
                            <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center z-10 ${isToday ? "border-[1.5px] border-[rgba(55,50,47,0.2)]" : ""}`}>
                               <span className={`text-[11px] font-medium leading-none ${isToday ? "text-[#37322F]" : "text-[rgba(55,50,47,0.3)]"}`}>
                                 {d.getDate()}
                               </span>
                            </div>
                          )}
                          {/* Selected ring for today */}
                          {isToday && sentiment && (
                            <div className="absolute inset-0 m-auto w-9 h-9 border border-[rgba(55,50,47,0.15)] rounded-full z-0" />
                          )}
                          {/* Day number below if face is shown */}
                          {sentiment && (
                            <span className="text-[9px] font-medium text-[rgba(55,50,47,0.25)] mt-1 tracking-tight leading-none absolute -bottom-3">
                              {d.getDate()}
                            </span>
                          )}
                        </div>
                      )
                    }
                    return cells
                  })()}
                </div>
              </div>
            </div>

            {/* ──── Day-by-day cards ──── */}
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.38)] mb-3">
                Daily entries
              </h2>
              <div className="flex flex-col gap-2">
                {[...dayEntries].reverse().map((de) => {
                  if (!de.entry) return null
                  const e = de.entry
                  const meta = getSentimentMeta(e.sentiment)
                  const excerpt = stripHtml(e.content).slice(0, 140)

                  return (
                    <div
                      key={e.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[rgba(55,50,47,0.08)] shadow-[0_1px_3px_rgba(55,50,47,0.04)] transition-all duration-150 hover:shadow-[0_2px_8px_rgba(55,50,47,0.08)]"
                    >
                      {/* Date column */}
                      <div className="flex-shrink-0 w-14 text-center">
                        <p className="text-[11px] font-semibold text-[rgba(55,50,47,0.45)] uppercase tracking-wide">
                          {formatDayLabel(e.date, today)}
                        </p>
                        <p className="text-[9px] text-[rgba(55,50,47,0.30)] mt-0.5">{formatShortDate(e.date)}</p>
                      </div>

                      {/* Sentiment dot */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {e.aiSummary ? (
                          <p className="text-[13.5px] font-medium text-[#37322F] leading-snug">{e.aiSummary}</p>
                        ) : (
                          <p className="text-[13px] text-[rgba(55,50,47,0.55)] leading-snug">{excerpt}...</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {e.sentiment && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          )}
                          {(e.themes ?? []).map((t) => (
                            <span key={t} className="text-[10px] text-[rgba(55,50,47,0.45)] font-medium px-1.5 py-0.5 rounded bg-[rgba(55,50,47,0.04)]">
                              {t}
                            </span>
                          ))}
                          {!e.sentiment && (
                            <span className="text-[10px] text-[rgba(55,50,47,0.30)] italic">
                              Awaiting analysis
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
