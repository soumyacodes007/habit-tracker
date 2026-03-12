"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Underline from "@tiptap/extension-underline"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Image from "@tiptap/extension-image"
import { createJournalEntryAction, updateJournalEntryAction } from "@/app/actions/journal"

type Mood = "happy" | "neutral" | "sad"

interface JournalEntry {
  id: string
  content: string
  mood?: Mood | null
  date: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface JournalEditorProps {
  date: string
  existing?: JournalEntry | null
}

// ─── Mood config ──────────────────────────────────────────────────────────────

const MOODS: {
  value: Mood
  label: string
  icon: React.ReactNode
  active: string
  icon_active: string
}[] = [
  {
    value: "happy",
    label: "Good",
    active: "bg-emerald-50 border-emerald-200 text-emerald-700",
    icon_active: "text-emerald-500",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.1" />
        <path d="M5 8.5C5 8.5 5.917 10 7.5 10C9.083 10 10 8.5 10 8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="5.5" cy="6.5" r="0.75" fill="currentColor" />
        <circle cx="9.5" cy="6.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "neutral",
    label: "Okay",
    active: "bg-amber-50 border-amber-200 text-amber-700",
    icon_active: "text-amber-500",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.1" />
        <path d="M5 9.5H10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="5.5" cy="6.5" r="0.75" fill="currentColor" />
        <circle cx="9.5" cy="6.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "sad",
    label: "Rough",
    active: "bg-rose-50 border-rose-200 text-rose-600",
    icon_active: "text-rose-400",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.1" />
        <path d="M5 10C5 10 5.917 8.5 7.5 8.5C9.083 8.5 10 10 10 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="5.5" cy="6" r="0.75" fill="currentColor" />
        <circle cx="9.5" cy="6" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
]

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yest = new Date(today); yest.setDate(today.getDate() - 1)

  const formatted = dt.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
  if (dt.getTime() === today.getTime()) return `Today — ${formatted}`
  if (dt.getTime() === yest.getTime()) return `Yesterday — ${formatted}`
  return formatted
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={[
        "flex items-center justify-center w-7 h-7 rounded text-[12.5px] font-medium transition-all duration-75",
        active
          ? "bg-[rgba(55,50,47,0.12)] text-[#37322F]"
          : "text-[rgba(55,50,47,0.50)] hover:bg-[rgba(55,50,47,0.06)] hover:text-[#37322F]",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function ToolbarSep() {
  return <div className="w-px h-4 bg-[rgba(55,50,47,0.12)] mx-0.5" />
}

// ─── Save state ───────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error"

// ─── Main editor ─────────────────────────────────────────────────────────────

export default function JournalEditor({ date, existing }: JournalEditorProps) {
  const [mood, setMood] = useState<Mood | null>(existing?.mood ?? null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [entryId, setEntryId] = useState<string | null>(existing?.id ?? null)
  const [lastSaved, setLastSaved] = useState<Date | null>(
    existing?.updatedAt ? new Date(existing.updatedAt) : null
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  const save = useCallback(
    (html: string, currentMood: Mood | null) => {
      // strip empty prosemirror paragraph
      const stripped = html.replace(/<p><\/p>/g, "").trim()
      if (!stripped) return

      setSaveState("saving")
      const fd = new FormData()
      fd.set("content", html)
      fd.set("date", date)
      if (currentMood) fd.set("mood", currentMood)

      startTransition(async () => {
        try {
          const result = entryId
            ? await updateJournalEntryAction(entryId, fd)
            : await createJournalEntryAction(fd)

          if (result.error) {
            setSaveState("error")
          } else {
            if (!entryId && result.data) setEntryId(result.data.id)
            setLastSaved(new Date())
            setSaveState("saved")
            setTimeout(() => setSaveState("idle"), 2500)
          }
        } catch {
          setSaveState("error")
        }
      })
    },
    [date, entryId]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({
        placeholder: "What's on your mind today? Write freely...",
      }),
      CharacterCount,
    ],
    content: existing?.content ?? "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[400px] prose-custom",
      },
    },
    onUpdate: ({ editor }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        save(editor.getHTML(), mood)
      }, 1500)
    },
    immediatelyRender: false,
  })

  // Save on mood change
  const handleMoodSelect = (m: Mood) => {
    const next = mood === m ? null : m
    setMood(next)
    if (editor && editor.getText().trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      save(editor.getHTML(), next)
    }
  }

  // Handle image file pick
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      editor.chain().focus().setImage({ src, alt: file.name }).run()
    }
    reader.readAsDataURL(file)
    // reset so same file can be re-selected
    e.target.value = ""
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const wordCount = editor?.getText().trim()
    ? editor.getText().trim().split(/\s+/).length
    : 0

  const saveLabel = {
    idle: null,
    saving: "Saving...",
    saved: "Saved",
    error: "Failed to save",
  }[saveState]

  return (
    <>
      {/* Editor styles */}
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(55,50,47,0.25);
          pointer-events: none;
          height: 0;
          font-family: var(--font-instrument-serif, Georgia, serif);
        }

        .prose-custom {
          font-family: var(--font-instrument-serif, Georgia, serif);
          font-size: 15.5px;
          line-height: 1.8;
          color: #37322F;
        }
        .prose-custom p { margin: 0 0 0.6em; }
        .prose-custom h1 { font-size: 1.6em; font-weight: 600; margin: 1em 0 0.4em; line-height: 1.25; }
        .prose-custom h2 { font-size: 1.3em; font-weight: 600; margin: 0.9em 0 0.3em; line-height: 1.3; }
        .prose-custom h3 { font-size: 1.1em; font-weight: 600; margin: 0.8em 0 0.25em; }
        .prose-custom strong { font-weight: 700; }
        .prose-custom em { font-style: italic; }
        .prose-custom u { text-decoration: underline; }
        .prose-custom s { text-decoration: line-through; }
        .prose-custom blockquote {
          border-left: 2.5px solid rgba(55,50,47,0.18);
          padding-left: 1em;
          margin: 0.8em 0;
          color: rgba(55,50,47,0.65);
          font-style: italic;
        }
        .prose-custom ul { list-style: disc; padding-left: 1.4em; margin: 0.5em 0; }
        .prose-custom ol { list-style: decimal; padding-left: 1.4em; margin: 0.5em 0; }
        .prose-custom li { margin: 0.2em 0; }
        .prose-custom code {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.88em;
          background: rgba(55,50,47,0.06);
          border-radius: 3px;
          padding: 0.1em 0.35em;
        }
        .prose-custom pre {
          background: rgba(55,50,47,0.05);
          border-radius: 6px;
          padding: 0.85em 1em;
          overflow-x: auto;
          margin: 0.75em 0;
        }
        .prose-custom pre code { background: none; padding: 0; font-size: 0.87em; }
        .prose-custom hr {
          border: none;
          border-top: 1px solid rgba(55,50,47,0.12);
          margin: 1.5em 0;
        }
        /* Task list */
        .prose-custom ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        .prose-custom ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5em;
        }
        .prose-custom ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          margin-top: 0.15em;
        }
        .prose-custom ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 13px;
          height: 13px;
          accent-color: #37322F;
          cursor: pointer;
        }
        .prose-custom ul[data-type="taskList"] li > div { flex: 1; }

        /* Images */
        .prose-custom img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0.75em 0;
          display: block;
          box-shadow: 0 1px 4px rgba(55,50,47,0.10);
        }
        .prose-custom img.ProseMirror-selectednode {
          outline: 2px solid rgba(55,50,47,0.35);
          outline-offset: 2px;
        }
      `}</style>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-8 md:px-12 pt-10 pb-0">
          <h1
            className="text-[28px] md:text-[32px] font-normal text-[#37322F] leading-tight"
            style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
          >
            {formatDisplayDate(date)}
          </h1>

          {/* Mood picker */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[10.5px] text-[rgba(55,50,47,0.40)] font-semibold uppercase tracking-widest mr-1">
              Mood
            </span>
            {MOODS.map((opt) => {
              const isActive = mood === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handleMoodSelect(opt.value)}
                  className={[
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] font-medium",
                    "transition-all duration-100 outline-none select-none",
                    isActive
                      ? opt.active
                      : "bg-transparent border-[rgba(55,50,47,0.12)] text-[rgba(55,50,47,0.45)] hover:border-[rgba(55,50,47,0.22)] hover:text-[#37322F]",
                  ].join(" ")}
                >
                  <span className={isActive ? opt.icon_active : "text-[rgba(55,50,47,0.38)]"}>
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Toolbar */}
          <div className="mt-5 flex items-center gap-0.5 py-2 border-y border-[rgba(55,50,47,0.08)]">
            {/* Heading */}
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor?.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <span className="text-[11px] font-bold leading-none">H1</span>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor?.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <span className="text-[11px] font-bold leading-none">H2</span>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor?.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <span className="text-[11px] font-bold leading-none">H3</span>
            </ToolbarBtn>

            <ToolbarSep />

            {/* Inline marks */}
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive("bold")}
              title="Bold (Ctrl+B)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 2H7C8.105 2 9 2.895 9 4C9 5.105 8.105 6 7 6H3V2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M3 6H7.5C8.881 6 10 7.119 10 8.5C10 9.881 8.881 11 7.5 11H3V6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive("italic")}
              title="Italic (Ctrl+I)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M5 2H9M3 10H7M7 2L5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              active={editor?.isActive("underline")}
              title="Underline (Ctrl+U)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 2V6C3 8.209 4.791 10 7 10V10C9.209 10 11 8.209 11 6V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M1 12H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              active={editor?.isActive("strike")}
              title="Strikethrough"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M4 3C4 3 4.5 2 6 2C7.5 2 8.5 2.895 8.5 4C8.5 4.667 8.167 5 7.5 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M4.5 7C4.5 7 4.5 9.5 6 9.5C7.5 9.5 8.5 9 8.5 8C8.5 7.333 8 7 7.5 7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            </ToolbarBtn>

            <ToolbarSep />

            {/* Lists */}
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
              title="Bullet list"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="2" cy="3.5" r="1" fill="currentColor"/>
                <circle cx="2" cy="6.5" r="1" fill="currentColor"/>
                <circle cx="2" cy="9.5" r="1" fill="currentColor"/>
                <path d="M5 3.5H11M5 6.5H11M5 9.5H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              active={editor?.isActive("orderedList")}
              title="Numbered list"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 2V4M1.5 2H2.5M1.5 4H2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <path d="M1 6.5H3M3 6.5V7.5H1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 9.5C1 9.5 1 9 2.5 9.5C3.5 9.9 1 10.5 1 11H3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 3.5H11M5.5 6.5H11M5.5 9.5H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleTaskList().run()}
              active={editor?.isActive("taskList")}
              title="Task list"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M1.75 4L2.5 4.75L4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="1" y="7.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M5.5 4H11M5.5 9H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </ToolbarBtn>

            <ToolbarSep />

            {/* Block */}
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              active={editor?.isActive("blockquote")}
              title="Blockquote"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 3H5.5M1.5 6H5.5M1.5 9H3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M7 3H11M7 6H11M7 9H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().toggleCode().run()}
              active={editor?.isActive("code")}
              title="Inline code"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 3L1 6L4 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 3L11 6L8 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ToolbarBtn>

            <ToolbarSep />

            {/* Image upload */}
            <ToolbarBtn
              onClick={() => fileInputRef.current?.click()}
              title="Insert image"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="2" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                <circle cx="4.5" cy="5" r="1" fill="currentColor"/>
                <path d="M1 9.5L4 7L6.5 9L8.5 7L12 9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ToolbarBtn>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <ToolbarSep />

            {/* Undo / Redo */}
            <ToolbarBtn
              onClick={() => editor?.chain().focus().undo().run()}
              title="Undo (Ctrl+Z)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 5H7C9.209 5 11 6.791 11 9V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M4 3L2 5L4 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor?.chain().focus().redo().run()}
              title="Redo (Ctrl+Y)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 5H5C2.791 5 1 6.791 1 9V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M8 3L10 5L8 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ToolbarBtn>
          </div>
        </div>

        {/* Tiptap editor area */}
        <div
          className="flex-1 px-8 md:px-12 py-5 overflow-y-auto cursor-text"
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Footer / status bar */}
        <div className="sticky bottom-0 px-8 md:px-12 py-2.5 border-t border-[rgba(55,50,47,0.08)] bg-[#F7F5F3]/90 backdrop-blur-sm flex items-center justify-between">
          <span className="text-[11px] text-[rgba(55,50,47,0.35)] tabular-nums">
            {wordCount} {wordCount === 1 ? "word" : "words"}
            {lastSaved && (
              <>
                {" · Last saved "}
                {lastSaved.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </>
            )}
          </span>
          <span
            className={[
              "text-[11px] font-medium transition-colors duration-150",
              saveState === "saving" && "text-[rgba(55,50,47,0.40)]",
              saveState === "saved" && "text-emerald-600",
              saveState === "error" && "text-rose-500",
              saveState === "idle" && "invisible",
            ].filter(Boolean).join(" ")}
          >
            {saveLabel}
          </span>
        </div>
      </div>
    </>
  )
}
