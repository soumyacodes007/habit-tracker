"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { useState, useTransition } from "react"
import { runCoachAuditAction } from "@/app/actions/coach"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  subItems?: { label: string; href: string }[]
}

function PenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 3.5L10.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2.5C2 2.5 3 2 5 2C7 2 8 3 8 3V12C8 12 7 11.5 5 11.5C3 11.5 2 12 2 12V2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 3C8 3 9 2 11 2C12 2 12 2.5 12 2.5V12C12 12 11 11.5 9 11.5C8.5 11.5 8 12 8 12V3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1C7 1 3 4 3 7.5C3 9.985 4.79 12 7 12C9.21 12 11 9.985 11 7.5C11 6 10 4.5 9 3.5C9 3.5 9 5 8 5.5C7.5 4 7 1 7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InsightsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.0" strokeOpacity="0.6" />
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 1.5V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9.5 1.5V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="3.5" y="7.5" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
      <rect x="6.25" y="7.5" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
      <rect x="9" y="7.5" width="1.5" height="1.5" rx="0.3" fill="currentColor" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
    >
      <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Coach Trigger Button ─────────────────────────────────────────────────────

function CoachTriggerButton() {
  const [isRunning, setIsRunning] = useState(false)

  const handleClick = async () => {
    if (isRunning) return
    setIsRunning(true)
    try {
      await runCoachAuditAction(true) // force = skip 24h cooldown
      // Tell the modal to refresh and show alerts
      window.dispatchEvent(new CustomEvent("coach-alerts-updated"))
    } catch (e) {
      console.error("[Coach] Audit failed:", e)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isRunning}
      className={[
        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all duration-200",
        isRunning
          ? "bg-[rgba(55,50,47,0.08)] text-[rgba(55,50,47,0.4)] cursor-wait"
          : "bg-[#1a1817] text-white/90 hover:bg-[#252220] shadow-sm hover:shadow-md",
      ].join(" ")}
    >
      {isRunning ? (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" className="animate-spin flex-shrink-0">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeDasharray="20" strokeDashoffset="7" strokeLinecap="round" />
          </svg>
          <span>Scanning streaks...</span>
        </>
      ) : (
        <>
          <span className="text-[13px]"></span>
          <span>Summon The Coach</span>
        </>
      )}
    </button>
  )
}

const PRIMARY_NAV: NavItem[] = [
  {
    label: "Journal",
    href: "/journal",
    icon: <PenIcon />,
    subItems: [
      { label: "Today", href: "/journal" },
      { label: "Browse Entries", href: "/journal/browse" },
    ],
  },
  {
    label: "Habits",
    href: "/habits",
    icon: <CheckIcon />,
    subItems: [
      { label: "Daily Checklist", href: "/habits" },
      { label: "Manage Habits", href: "/habits/manage" },
    ],
  },
  {
    label: "Streaks",
    href: "/streaks",
    icon: <FlameIcon />,
  },
  {
    label: "Insights",
    href: "/insights",
    icon: <InsightsIcon />,
  },
  {
    label: "History",
    href: "/history",
    icon: <CalendarIcon />,
  },
]

function NavLink({
  item,
  isActive,
  isParentActive,
}: {
  item: NavItem
  isActive: boolean
  isParentActive: boolean
}) {
  const [open, setOpen] = useState(isParentActive)
  const hasChildren = item.subItems && item.subItems.length > 0
  const pathname = usePathname()

  return (
    <div>
      <div
        className={[
          "group relative flex items-center gap-2.5 px-3 py-[6px] rounded-md cursor-pointer select-none",
          "transition-all duration-100",
          isActive && !hasChildren
            ? "bg-[rgba(55,50,47,0.07)] text-[#37322F]"
            : isParentActive && hasChildren
              ? "text-[#37322F]"
              : "text-[rgba(55,50,47,0.55)] hover:text-[#37322F] hover:bg-[rgba(55,50,47,0.04)]",
        ].join(" ")}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {/* Active indicator */}
        {isActive && !hasChildren && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#37322F] rounded-r-full" />
        )}

        <span className="flex-shrink-0">{item.icon}</span>

        {hasChildren ? (
          <span className="flex-1 text-[13px] font-medium leading-none">{item.label}</span>
        ) : (
          <Link href={item.href} className="flex-1 text-[13px] font-medium leading-none">
            {item.label}
          </Link>
        )}

        {hasChildren && (
          <span className="text-[rgba(55,50,47,0.35)] group-hover:text-[rgba(55,50,47,0.55)] transition-colors">
            <ChevronIcon open={open} />
          </span>
        )}
      </div>

      {/* Sub-items */}
      {hasChildren && open && (
        <div className="ml-[22px] mt-0.5 flex flex-col gap-0.5 border-l border-[rgba(55,50,47,0.08)] pl-3">
          {item.subItems!.map((sub) => {
            const subActive = pathname === sub.href
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={[
                  "block py-[5px] text-[12.5px] leading-none rounded-sm transition-colors duration-100",
                  subActive
                    ? "text-[#37322F] font-medium"
                    : "text-[rgba(55,50,47,0.50)] hover:text-[#37322F]",
                ].join(" ")}
              >
                {sub.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AppSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <Link href="/journal" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-[#37322F] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.9" />
              <rect x="5.5" y="1" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.5" />
              <rect x="1" y="5.5" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.5" />
              <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[#37322F] leading-none">
            DailyRoutine
          </span>
        </Link>
        <button
          className="md:hidden text-[rgba(55,50,47,0.5)] hover:text-[#37322F] transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-[rgba(55,50,47,0.07)]" />

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
        <p className="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-widest text-[rgba(55,50,47,0.35)] mb-1">
          Workspace
        </p>
        {PRIMARY_NAV.map((item) => {
          const isActive = pathname === item.href
          const isParentActive = item.subItems
            ? item.subItems.some((s) => pathname.startsWith(s.href.split("?")[0])) ||
            pathname.startsWith(item.href)
            : false
          return (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive}
              isParentActive={isParentActive}
            />
          )
        })}
      </nav>

      {/* Coach Button - above profile */}
      <div className="px-3 pb-2">
        <CoachTriggerButton />
      </div>

      {/* Footer - User */}
      <div className="mx-4 h-px bg-[rgba(55,50,47,0.07)]" />
      <div className="px-4 py-3 flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-7 h-7",
              userButtonPopoverCard: "font-sans",
            },
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-[#37322F] leading-none truncate">Your account</p>
          <p className="text-[11px] text-[rgba(55,50,47,0.45)] leading-none mt-0.5">Manage profile</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-[rgba(55,50,47,0.12)] text-[#37322F] hover:bg-[#F7F5F3] transition-colors"
        onClick={() => setMobileOpen(true)}
      >
        <MenuIcon />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden md:flex flex-col w-[220px] flex-shrink-0",
          "bg-[#F0EDE9] border-r border-[rgba(55,50,47,0.10)]",
          "h-screen sticky top-0",
        ].join(" ")}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={[
          "md:hidden fixed left-0 top-0 bottom-0 z-50 w-[240px] flex flex-col",
          "bg-[#F0EDE9] border-r border-[rgba(55,50,47,0.10)]",
          "transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
