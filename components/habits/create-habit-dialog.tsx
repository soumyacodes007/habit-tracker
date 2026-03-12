"use client"

import { useState, useTransition } from "react"
import { createHabitAction, updateHabitAction } from "@/app/actions/habits"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Habit {
  id: string
  name: string
  description?: string | null
  color: string
  icon: string
  targetDays?: string[] | null
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
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  const toggleDay = (day: string) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Name is required"); return }
    setError(null)

    const fd = new FormData()
    fd.set("name", name.trim())
    if (description.trim()) fd.set("description", description.trim())
    fd.set("color", color)
    if (icon.trim()) fd.set("icon", icon.trim())
    fd.set("targetDays", JSON.stringify(targetDays))

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
            "w-full max-w-[440px] bg-white rounded-xl",
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

          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Read 20 pages"
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

            {/* Color picker */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                Color
              </label>
              <div className="flex gap-2">
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

            {/* Icon */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.40)]">
                Icon <span className="normal-case tracking-normal font-normal">(1-2 chars or leave blank)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value.slice(0, 4))}
                  placeholder="e.g. a letter or symbol"
                  className={[
                    "w-24 px-3 py-2 rounded-lg border text-[15px] text-center text-[#37322F]",
                    "placeholder:text-[rgba(55,50,47,0.25)] placeholder:text-[12px]",
                    "border-[rgba(55,50,47,0.14)] focus:border-[rgba(55,50,47,0.35)]",
                    "focus:ring-1 focus:ring-[rgba(55,50,47,0.08)] outline-none transition-colors",
                  ].join(" ")}
                />
                {/* Preview */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[15px] font-medium"
                  style={{ backgroundColor: color }}
                >
                  {icon || name.charAt(0).toUpperCase() || "H"}
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
      `}</style>
    </>
  )
}
