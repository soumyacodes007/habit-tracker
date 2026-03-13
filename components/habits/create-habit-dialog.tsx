"use client"

import { useState, useTransition, useEffect } from "react"
import { createHabitAction, updateHabitAction } from "@/app/actions/habits"

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

interface CreateHabitDialogProps {
  open: boolean
  onClose: () => void
  existing?: Habit | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = [
  "#37322F", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#64748b",
]

const ALL_DAYS = [
  { value: "mon", label: "M" },
  { value: "tue", label: "T" },
  { value: "wed", label: "W" },
  { value: "thu", label: "Th" },
  { value: "fri", label: "F" },
  { value: "sat", label: "S" },
  { value: "sun", label: "Su" },
] as const

const PRESET_DURATIONS = [15, 30, 45, 60, 90, 120]

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateHabitDialog({ open, onClose, existing }: CreateHabitDialogProps) {
  const isEdit = !!existing

  const [name, setName] = useState(existing?.name ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [color, setColor] = useState(existing?.color ?? COLORS[0])
  const [icon, setIcon] = useState(existing?.icon ?? "")
  const [targetDays, setTargetDays] = useState<string[]>(
    existing?.targetDays ?? ALL_DAYS.map((d) => d.value)
  )
  const [habitType, setHabitType] = useState<"check" | "timer">(
    (existing?.habitType as "check" | "timer") ?? "check"
  )
  const [timerDuration, setTimerDuration] = useState<number>(
    existing?.timerDuration ? Number(existing.timerDuration) : 30
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Reset form when dialog opens with different data
  useEffect(() => {
    if (open) {
      setName(existing?.name ?? "")
      setDescription(existing?.description ?? "")
      setColor(existing?.color ?? COLORS[0])
      setIcon(existing?.icon ?? "")
      setTargetDays(existing?.targetDays ?? ALL_DAYS.map((d) => d.value))
      setHabitType((existing?.habitType as "check" | "timer") ?? "check")
      setTimerDuration(existing?.timerDuration ? Number(existing.timerDuration) : 30)
      setError(null)
    }
  }, [open, existing])

  if (!open) return null

  const toggleDay = (day: string) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Name is required"); return }
    if (habitType === "timer" && (!timerDuration || timerDuration < 1)) {
      setError("Duration must be at least 1 minute"); return
    }
    setError(null)

    const fd = new FormData()
    fd.set("name", name.trim())
    if (description.trim()) fd.set("description", description.trim())
    fd.set("color", color)
    if (icon.trim()) fd.set("icon", icon.trim())
    fd.set("targetDays", JSON.stringify(targetDays))
    fd.set("habitType", habitType)
    if (habitType === "timer") fd.set("timerDuration", String(timerDuration))

    startTransition(async () => {
      try {
        const result = isEdit
          ? await updateHabitAction(existing!.id, fd)
          : await createHabitAction(fd)

        if (result.error) {
          setError(typeof result.error === "string" ? result.error : "Something went wrong")
        } else {
          onClose()
        }
      } catch {
        setError("Failed to save habit")
      }
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className={[
            "w-full max-w-[460px] bg-white rounded-xl",
            "shadow-[0_16px_64px_rgba(55,50,47,0.18)]",
            "overflow-hidden",
          ].join(" ")}
          style={{ animation: "dialog-enter 0.15s ease-out" }}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-0 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#37322F]">
              {isEdit ? "Edit habit" : "New habit"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center text-[rgba(55,50,47,0.4)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.06)] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {/* Habit type toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHabitType("check")}
                  className={[
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-150",
                    habitType === "check"
                      ? "border-[#37322F] bg-[rgba(55,50,47,0.04)]"
                      : "border-[rgba(55,50,47,0.10)] hover:border-[rgba(55,50,47,0.22)]",
                  ].join(" ")}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke={habitType === "check" ? "#37322F" : "rgba(55,50,47,0.35)"} strokeWidth="1.3" />
                    <path d="M5 8L7 10L11 6" stroke={habitType === "check" ? "#37322F" : "rgba(55,50,47,0.35)"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-left">
                    <p className={`text-[12.5px] font-semibold ${habitType === "check" ? "text-[#37322F]" : "text-[rgba(55,50,47,0.55)]"}`}>
                      Checkoff
                    </p>
                    <p className="text-[10px] text-[rgba(55,50,47,0.38)]">Tap to complete</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setHabitType("timer")}
                  className={[
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-150",
                    habitType === "timer"
                      ? `border-[#37322F] bg-[rgba(55,50,47,0.04)]`
                      : "border-[rgba(55,50,47,0.10)] hover:border-[rgba(55,50,47,0.22)]",
                  ].join(" ")}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="9" r="5.5" stroke={habitType === "timer" ? "#37322F" : "rgba(55,50,47,0.35)"} strokeWidth="1.3" />
                    <path d="M8 6.5V9L9.5 10" stroke={habitType === "timer" ? "#37322F" : "rgba(55,50,47,0.35)"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.5 2H9.5" stroke={habitType === "timer" ? "#37322F" : "rgba(55,50,47,0.35)"} strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <div className="text-left">
                    <p className={`text-[12.5px] font-semibold ${habitType === "timer" ? "text-[#37322F]" : "text-[rgba(55,50,47,0.55)]"}`}>
                      Timer
                    </p>
                    <p className="text-[10px] text-[rgba(55,50,47,0.38)]">Timed session</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Timer duration (conditionally shown) */}
            {habitType === "timer" && (
              <div className="flex flex-col gap-2" style={{ animation: "section-in 0.12s ease-out" }}>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                  Duration
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {PRESET_DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTimerDuration(d)}
                      className={[
                        "px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-100",
                        timerDuration === d
                          ? "text-white"
                          : "bg-[rgba(55,50,47,0.05)] text-[rgba(55,50,47,0.50)] hover:bg-[rgba(55,50,47,0.10)]",
                      ].join(" ")}
                      style={timerDuration === d ? { backgroundColor: color } : undefined}
                    >
                      {d >= 60 ? `${d / 60}h` : `${d}m`}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    max={480}
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className={[
                      "w-20 px-3 py-2 rounded-lg border text-[13px] text-center text-[#37322F] tabular-nums",
                      "border-[rgba(55,50,47,0.14)] focus:border-[rgba(55,50,47,0.35)]",
                      "focus:ring-1 focus:ring-[rgba(55,50,47,0.08)] outline-none transition-colors",
                    ].join(" ")}
                  />
                  <span className="text-[11px] text-[rgba(55,50,47,0.40)]">minutes</span>
                </div>
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={habitType === "timer" ? "e.g. Deep work session" : "e.g. Read 20 pages"}
                autoFocus
                className={[
                  "w-full px-3 py-2 rounded-lg border text-[13.5px] text-[#37322F]",
                  "placeholder:text-[rgba(55,50,47,0.28)]",
                  "border-[rgba(55,50,47,0.14)] focus:border-[rgba(55,50,47,0.35)]",
                  "focus:ring-1 focus:ring-[rgba(55,50,47,0.08)] outline-none transition-colors",
                ].join(" ")}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                Description <span className="normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this habit important to you?"
                rows={2}
                className={[
                  "w-full px-3 py-2 rounded-lg border text-[13px] text-[#37322F] resize-none",
                  "placeholder:text-[rgba(55,50,47,0.28)]",
                  "border-[rgba(55,50,47,0.14)] focus:border-[rgba(55,50,47,0.35)]",
                  "focus:ring-1 focus:ring-[rgba(55,50,47,0.08)] outline-none transition-colors",
                ].join(" ")}
              />
            </div>

            {/* Color + Icon row */}
            <div className="flex gap-5">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="relative w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <svg
                          className="absolute inset-0 m-auto"
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-28">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                  Icon
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value.slice(0, 4))}
                    placeholder="Ab"
                    className={[
                      "w-14 px-2 py-2 rounded-lg border text-[15px] text-center text-[#37322F]",
                      "placeholder:text-[rgba(55,50,47,0.25)]",
                      "border-[rgba(55,50,47,0.14)] focus:border-[rgba(55,50,47,0.35)]",
                      "focus:ring-1 focus:ring-[rgba(55,50,47,0.08)] outline-none transition-colors",
                    ].join(" ")}
                  />
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[14px] font-medium flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {icon || name.charAt(0).toUpperCase() || "H"}
                  </div>
                </div>
              </div>
            </div>

            {/* Target days */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                Active days
              </label>
              <div className="flex gap-1.5">
                {ALL_DAYS.map((d) => {
                  const active = targetDays.includes(d.value)
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={[
                        "w-9 h-9 rounded-lg text-[12px] font-semibold transition-all duration-100",
                        active
                          ? "text-white"
                          : "bg-[rgba(55,50,47,0.05)] text-[rgba(55,50,47,0.40)] hover:bg-[rgba(55,50,47,0.10)] hover:text-[#37322F]",
                      ].join(" ")}
                      style={active ? { backgroundColor: color } : undefined}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-rose-500 font-medium">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[rgba(55,50,47,0.08)] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-[rgba(55,50,47,0.55)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.05)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={[
                "px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-opacity",
                isPending ? "opacity-60 cursor-not-allowed" : "hover:opacity-90",
              ].join(" ")}
              style={{ backgroundColor: color }}
            >
              {isPending ? "Saving..." : isEdit ? "Update" : "Create habit"}
            </button>
          </div>
        </form>
      </div>

      {/* Dialog enter animation */}
      <style>{`
        @keyframes dialog-enter {
          from { opacity: 0; transform: scale(0.97) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes section-in {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
      `}</style>
    </>
  )
}
