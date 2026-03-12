'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, BookOpen } from 'lucide-react'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/habits',
    label: 'Habits',
    icon: Compass,
  },
  {
    href: '/journal',
    label: 'Journal',
    icon: BookOpen,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background md:hidden z-40">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
