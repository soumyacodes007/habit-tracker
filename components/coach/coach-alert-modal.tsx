"use client"

import { useEffect, useState, useTransition, useCallback } from "react"
import { getUnreadAlertsAction, dismissAlertAction, runCoachAuditAction } from "@/app/actions/coach"

// ─── Types ───────────────────────────────────────────────────────────────────

interface CoachAlert {
  id: string
  habitName: string
  daysMissed: string
  message: string
  alertType: string
  createdAt: Date | string
}

// ─── Alert type config ───────────────────────────────────────────────────────

const ALERT_STYLES: Record<string, { bg: string; border: string; accent: string; icon: string; label: string }> = {
  shame: {
    bg: "bg-gradient-to-br from-rose-950 via-[#1a0a0a] to-[#0d0505]",
    border: "border-rose-800/40",
    accent: "text-rose-400",
    icon: "🔥",
    label: "CRITICAL VIOLATION",
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-950 via-[#1a1005] to-[#0d0a02]",
    border: "border-amber-800/40",
    accent: "text-amber-400",
    icon: "⚠️",
    label: "STREAK BROKEN",
  },
  motivate: {
    bg: "bg-gradient-to-br from-violet-950 via-[#0f0a1a] to-[#070510]",
    border: "border-violet-800/40",
    accent: "text-violet-400",
    icon: "👁️",
    label: "ACCOUNTABILITY CHECK",
  },
}

function getAlertStyle(type: string) {
  return ALERT_STYLES[type] ?? ALERT_STYLES.motivate
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CoachAlertModal() {
  const [alerts, setAlerts] = useState<CoachAlert[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [hasRunAudit, setHasRunAudit] = useState(false)

  // On mount: run audit then fetch alerts
  const loadAlerts = useCallback(() => {
    startTransition(async () => {
      // First run the audit to generate any new alerts
      if (!hasRunAudit) {
        await runCoachAuditAction()
        setHasRunAudit(true)
      }

      // Then fetch unread alerts
      const result = await getUnreadAlertsAction()
      if (result.data && result.data.length > 0) {
        setAlerts(result.data)
        setCurrentIndex(0)
        // Small delay for dramatic entrance
        setTimeout(() => setVisible(true), 800)
      }
    })
  }, [hasRunAudit])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const currentAlert = alerts[currentIndex]
  if (!currentAlert || !visible) return null

  const style = getAlertStyle(currentAlert.alertType)
  const hasMore = currentIndex < alerts.length - 1

  const handleDismiss = () => {
    setDismissing(true)
    startTransition(async () => {
      await dismissAlertAction(currentAlert.id)

      setTimeout(() => {
        setDismissing(false)
        if (hasMore) {
          setCurrentIndex((i) => i + 1)
        } else {
          setVisible(false)
        }
      }, 300)
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm transition-opacity duration-500",
          dismissing ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className={[
            "relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-500",
            style.bg,
            style.border,
            dismissing ? "scale-95 opacity-0" : "scale-100 opacity-100",
          ].join(" ")}
          style={{
            boxShadow: currentAlert.alertType === "shame"
              ? "0 0 60px rgba(239, 68, 68, 0.15), 0 0 120px rgba(239, 68, 68, 0.05)"
              : currentAlert.alertType === "warning"
              ? "0 0 60px rgba(245, 158, 11, 0.12), 0 0 120px rgba(245, 158, 11, 0.04)"
              : "0 0 60px rgba(139, 92, 246, 0.12), 0 0 120px rgba(139, 92, 246, 0.04)",
          }}
        >
          {/* Scan lines effect */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
            }}
          />

          {/* Header */}
          <div className="relative px-6 pt-6 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{style.icon}</span>
                <span className={`text-[10px] font-black tracking-[0.25em] uppercase ${style.accent}`}>
                  {style.label}
                </span>
              </div>
              {alerts.length > 1 && (
                <span className="text-[10px] font-mono text-white/30">
                  {currentIndex + 1}/{alerts.length}
                </span>
              )}
            </div>

            {/* Habit name */}
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" className={style.accent} />
                  <path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={style.accent} />
                </svg>
              </div>
              <div>
                <p className="text-white/90 text-[15px] font-semibold leading-none">{currentAlert.habitName}</p>
                <p className={`text-[11px] font-mono mt-1 ${style.accent}`}>
                  {currentAlert.daysMissed} days dark · streak destroyed
                </p>
              </div>
            </div>
          </div>

          {/* Message body */}
          <div className="relative px-6 py-5">
            <div className="relative">
              <div className={`absolute -left-1 top-0 bottom-0 w-[2px] rounded-full ${style.accent} opacity-40`} />
              <p className="text-white/85 text-[14.5px] leading-[1.7] pl-4 font-light italic" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                &ldquo;{currentAlert.message}&rdquo;
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="relative px-6 pb-6 pt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
                The Enforcer is watching
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasMore && (
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-[11px] font-semibold text-white/50 hover:text-white/80 transition-colors rounded-lg border border-white/10 hover:border-white/20"
                >
                  Next →
                </button>
              )}
              <button
                onClick={handleDismiss}
                disabled={isPending}
                className={[
                  "px-5 py-2 rounded-lg text-[11.5px] font-bold transition-all duration-150",
                  "bg-white/10 border border-white/15 text-white hover:bg-white/15",
                  isPending && "opacity-50",
                ].join(" ")}
              >
                {hasMore ? "I'll do better" : "I acknowledge my failure"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
