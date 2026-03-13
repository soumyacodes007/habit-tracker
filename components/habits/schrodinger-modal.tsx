"use client"

import { useState, useEffect } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SchrodingerWarning {
  habitName: string
  habitIcon: string
  habitColor: string
  daysSinceCreation: number
  totalCompletions: number
  youWillLose: string
  couldHaveBeen: string
  crushLine: string
  finalBlow: string
}

interface SchrodingerModalProps {
  warning: SchrodingerWarning
  onConfirmDelete: () => void
  onCancel: () => void
  isDeleting: boolean
}

// ─── Glitch text effect hook ─────────────────────────────────────────────────

function useGlitchText(finalText: string, delay: number = 0) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    const chars = "!@#$%^&*()_=+{}[]|;:<>?/~`"
    let i = 0
    let timeout: ReturnType<typeof setTimeout>

    timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i >= finalText.length) {
          clearInterval(interval)
          setDone(true)
          return
        }
        // Show scrambled chars then reveal
        const revealed = finalText.slice(0, i)
        const scrambled = chars[Math.floor(Math.random() * chars.length)]
        setDisplayed(revealed + scrambled)
        i++
        setTimeout(() => setDisplayed(finalText.slice(0, i)), 30)
      }, 45)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [finalText, delay])

  return { text: displayed, done }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SchrodingerModal({
  warning,
  onConfirmDelete,
  onCancel,
  isDeleting,
}: SchrodingerModalProps) {
  const [phase, setPhase] = useState(0) // 0→scanning, 1→reveal, 2→final
  const title = useGlitchText("⚠️ SCHRÖDINGER'S WARNING", 200)
  const subtitle = useGlitchText(`You're about to delete "${warning.habitName}"`, 600)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200)
    const t2 = setTimeout(() => setPhase(2), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      {/* Backdrop with CRT effect */}
      <div
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm"
        style={{ animation: "schro-fade 0.3s ease-out" }}
      />

      {/* Scan lines overlay */}
      <div
        className="fixed inset-0 z-[201] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)",
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[202] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[460px] rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0a0a0a 0%, #141212 40%, #1a0a0a 100%)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            boxShadow: "0 0 80px rgba(239, 68, 68, 0.08), 0 0 160px rgba(239, 68, 68, 0.03), inset 0 1px 0 rgba(255,255,255,0.03)",
            animation: "schro-enter 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Flicker bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)",
              animation: "schro-scanbar 2s ease-in-out infinite",
            }}
          />

          {/* Header */}
          <div className="px-6 pt-6 pb-2">
            <p className="text-[11px] font-mono font-bold tracking-[0.3em] uppercase text-rose-500/70"
              style={{ animation: phase >= 0 ? "schro-flicker 0.1s ease-out" : "none" }}
            >
              {title.text}
            </p>
            <p className="text-[15px] text-white/70 mt-2 font-light">
              {subtitle.text}
            </p>
          </div>

          {/* Stats bar */}
          <div className="mx-6 mt-3 flex items-center gap-4 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            style={{ opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.5s ease", animation: phase >= 1 ? "schro-slideup 0.4s ease-out" : "none" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[22px]">{warning.habitIcon}</span>
            </div>
            <div className="flex-1 flex items-center gap-6">
              <div>
                <p className="text-[18px] font-normal text-white/90 leading-none tabular-nums" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                  {warning.totalCompletions}
                </p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5 font-semibold">completions</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <p className="text-[18px] font-normal text-white/90 leading-none tabular-nums" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
                  {warning.daysSinceCreation}
                </p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5 font-semibold">days invested</p>
              </div>
            </div>
          </div>

          {/* Warning cards */}
          <div className="px-6 pt-4 pb-2 flex flex-col gap-2.5"
            style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
          >
            {/* You will lose */}
            <WarningCard
              icon="💀"
              label="YOU WILL LOSE"
              text={warning.youWillLose}
              accentColor="rgba(239, 68, 68, 0.12)"
              borderColor="rgba(239, 68, 68, 0.15)"
              textColor="text-rose-300/90"
              delay={0}
            />

            {/* Could have been */}
            <WarningCard
              icon="👑"
              label="YOU COULD HAVE BEEN"
              text={warning.couldHaveBeen}
              accentColor="rgba(245, 158, 11, 0.08)"
              borderColor="rgba(245, 158, 11, 0.12)"
              textColor="text-amber-300/90"
              delay={100}
            />

            {/* Crush line */}
            <WarningCard
              icon="💘"
              label="YOUR CRUSH WOULD HAVE NOTICED"
              text={warning.crushLine}
              accentColor="rgba(236, 72, 153, 0.08)"
              borderColor="rgba(236, 72, 153, 0.12)"
              textColor="text-pink-300/90"
              delay={200}
            />

            {/* Final blow */}
            <div className="mt-1 px-4 py-3 rounded-lg border border-white/[0.08] bg-white/[0.02]"
              style={{ animation: `schro-slideup 0.4s ease-out 0.3s both` }}
            >
              <p className="text-[13px] text-white/60 leading-relaxed italic"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
              >
                &ldquo;{warning.finalBlow}&rdquo;
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-6 pt-4 pb-6 flex items-center gap-3"
            style={{ opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.4s ease 0.6s" }}
          >
            {/* Quit button - small, shameful */}
            <button
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="flex-shrink-0 px-4 py-2.5 rounded-lg text-[11.5px] font-medium text-rose-400/60 border border-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-200 disabled:opacity-40"
            >
              {isDeleting ? "Deleting..." : "I'm a loser, I quit"}
            </button>

            {/* Stay button - big, confident */}
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg text-[12.5px] font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30"
            >
              Losing was never an option 💪
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 pb-4 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] font-mono text-white/15 uppercase tracking-[0.2em]">
              schrödinger's warning system active
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes schro-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes schro-enter {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes schro-flicker {
          0%, 100% { opacity: 1; }
          25% { opacity: 0.3; }
          50% { opacity: 0.8; }
          75% { opacity: 0.4; }
        }
        @keyframes schro-scanbar {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes schro-slideup {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

// ─── Warning card sub-component ──────────────────────────────────────────────

function WarningCard({
  icon,
  label,
  text,
  accentColor,
  borderColor,
  textColor,
  delay,
}: {
  icon: string
  label: string
  text: string
  accentColor: string
  borderColor: string
  textColor: string
  delay: number
}) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg"
      style={{
        backgroundColor: accentColor,
        border: `1px solid ${borderColor}`,
        animation: `schro-slideup 0.4s ease-out ${delay}ms both`,
      }}
    >
      <span className="text-[14px] mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-white/30 mb-1">{label}</p>
        <p className={`text-[12.5px] leading-relaxed ${textColor}`}>{text}</p>
      </div>
    </div>
  )
}
