"use client"

import { useState, useRef, useTransition } from "react"
import { verifyAndCompleteAction } from "@/app/actions/verify"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProofUploadModalProps {
  habitId: string
  habitName: string
  habitDescription: string | null
  habitColor: string
  habitIcon: string
  date: string
  onVerified: () => void
  onClose: () => void
}

type Stage = "upload" | "verifying" | "verified" | "rejected"

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProofUploadModal({
  habitId,
  habitName,
  habitDescription,
  habitColor,
  habitIcon,
  date,
  onVerified,
  onClose,
}: ProofUploadModalProps) {
  const [stage, setStage] = useState<Stage>("upload")
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null)
  const [aiMessage, setAiMessage] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return

    // Convert any image format to JPEG via canvas (Groq only supports JPEG/PNG/GIF/WebP)
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      // Resize to max 1024px to stay under Groq's 4MB limit
      const MAX = 1024
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > MAX || h > MAX) {
        const scale = MAX / Math.max(w, h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }

      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)

      // Always export as JPEG
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.85)
      setPreview(jpegDataUrl)
      const base64 = jpegDataUrl.split(",")[1]
      setImageData({ base64, mimeType: "image/jpeg" })
      URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmitProof = () => {
    if (!imageData) return
    setStage("verifying")

    startTransition(async () => {
      const result = await verifyAndCompleteAction(
        habitId,
        habitName,
        habitDescription,
        date,
        imageData.base64,
        imageData.mimeType
      )

      if (result.data) {
        setAiMessage(result.data.message)
        if (result.data.verified) {
          setStage("verified")
          // Auto-close after delay
          setTimeout(() => {
            onVerified()
          }, 2500)
        } else {
          setStage("rejected")
        }
      } else {
        setAiMessage("Verification system error. Try again.")
        setStage("rejected")
      }
    })
  }

  const handleRetry = () => {
    setStage("upload")
    setPreview(null)
    setImageData(null)
    setAiMessage("")
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px]"
        onClick={onClose}
        style={{ animation: "pow-fade-in 0.15s ease-out" }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ animation: "pow-enter 0.25s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[13px] font-semibold"
              style={{ backgroundColor: habitColor }}
            >
              {habitIcon || habitName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#37322F] truncate">{habitName}</p>
              <p className="text-[11px] text-[rgba(55,50,47,0.40)]">
                {stage === "upload" ? "Upload proof to complete" : stage === "verifying" ? "Analyzing your proof..." : stage === "verified" ? "Proof accepted!" : "Proof rejected"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-[rgba(55,50,47,0.35)] hover:text-[#37322F] rounded transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ─── Upload stage ─── */}
          {stage === "upload" && (
            <div className="px-6 py-5">
              {!preview ? (
                <div
                  className={[
                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-150",
                    dragOver
                      ? "border-[#37322F] bg-[rgba(55,50,47,0.04)]"
                      : "border-[rgba(55,50,47,0.15)] hover:border-[rgba(55,50,47,0.30)] hover:bg-[rgba(55,50,47,0.02)]",
                  ].join(" ")}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-12 h-12 rounded-full bg-[rgba(55,50,47,0.06)] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="4" width="16" height="12" rx="2" stroke="#37322F" strokeWidth="1.2" strokeOpacity="0.4" />
                      <circle cx="7" cy="9" r="1.5" stroke="#37322F" strokeWidth="1" strokeOpacity="0.35" />
                      <path d="M2 14L6 10L9 13L13 8L18 14" stroke="#37322F" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-[#37322F]">
                    Drop your proof here
                  </p>
                  <p className="text-[11px] text-[rgba(55,50,47,0.40)]">
                    or click to browse
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Preview */}
                  <div className="relative rounded-xl overflow-hidden border border-[rgba(55,50,47,0.10)]">
                    <img src={preview} alt="Proof" className="w-full h-48 object-cover" />
                    <button
                      onClick={handleRetry}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmitProof}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: habitColor }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Submit Proof for Verification
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          )}

          {/* ─── Verifying stage ─── */}
          {stage === "verifying" && (
            <div className="px-6 py-10 flex flex-col items-center gap-4">
              <div className="relative">
                {preview && (
                  <img src={preview} alt="Analyzing" className="w-20 h-20 rounded-xl object-cover opacity-60" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" className="animate-spin">
                    <circle cx="12" cy="12" r="9" stroke={habitColor} strokeWidth="2.5" fill="none" strokeDasharray="40" strokeDashoffset="12" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-[13px] font-medium text-[#37322F]">AI is inspecting your proof...</p>
              <p className="text-[11px] text-[rgba(55,50,47,0.40)]">This may take a few seconds</p>
            </div>
          )}

          {/* ─── Verified stage ─── */}
          {stage === "verified" && (
            <div className="px-6 py-8 flex flex-col items-center gap-4" style={{ animation: "pow-result 0.3s ease-out" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${habitColor}15` }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14L11.5 19.5L22 8.5" stroke={habitColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-[#37322F]">Proof Accepted</p>
              <p className="text-[13px] text-[rgba(55,50,47,0.60)] text-center leading-relaxed italic px-4"
                style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
              >
                &ldquo;{aiMessage}&rdquo;
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: habitColor }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(55,50,47,0.35)]">
                  Streak updated
                </span>
              </div>
            </div>
          )}

          {/* ─── Rejected stage ─── */}
          {stage === "rejected" && (
            <div className="px-6 py-6 flex flex-col items-center gap-4" style={{ animation: "pow-result 0.3s ease-out" }}>
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M8 8L20 20M20 8L8 20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-[#37322F]">Proof Rejected</p>
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 w-full">
                <p className="text-[13px] text-rose-700 text-center leading-relaxed italic"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                >
                  &ldquo;{aiMessage}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-[rgba(55,50,47,0.15)] text-[#37322F] hover:bg-[rgba(55,50,47,0.04)] transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold text-[rgba(55,50,47,0.45)] hover:text-[#37322F] transition-colors"
                >
                  Give up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pow-enter {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pow-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pow-result {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
