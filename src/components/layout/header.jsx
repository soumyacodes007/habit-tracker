'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle.jsx'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <span className="text-lg font-bold">J</span>
          </div>
          <span className="hidden font-semibold sm:inline-block">JOURN-I</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/habits" className="text-sm font-medium hover:text-primary transition-colors">
            Habits
          </Link>
          <Link href="/journal" className="text-sm font-medium hover:text-primary transition-colors">
            Logbook
          </Link>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
