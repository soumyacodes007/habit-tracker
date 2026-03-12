'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, BookOpen, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle.jsx'

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

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <header className="md:hidden sticky top-0 z-50 border-b border-orange-200 dark:border-stone-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 dark:from-orange-600 dark:to-red-700 text-white shadow-md">
              <span className="text-sm font-bold">H</span>
            </div>
            <span className="font-bold text-orange-900 dark:text-stone-100 text-sm">Habitat</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5 text-orange-900 dark:text-stone-100" />
              ) : (
                <Menu className="h-5 w-5 text-orange-900 dark:text-stone-100" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out
          bg-gradient-to-b from-orange-50 to-amber-50 dark:from-stone-900 dark:to-stone-800
          border-r border-orange-200 dark:border-stone-700
          
          ${/* Mobile */ ''}
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          
          ${/* Tablet and up */ ''}
          md:translate-x-0
          ${isCollapsed ? 'md:w-16' : 'md:w-64'}
          
          ${/* Desktop */ ''}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-72'}
          
          ${/* Large Desktop */ ''}
          ${isCollapsed ? 'xl:w-20' : 'xl:w-80'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-orange-200 dark:border-stone-700">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 dark:from-orange-600 dark:to-red-700 text-white shadow-lg flex-shrink-0">
              <span className="text-lg font-bold">H</span>
            </div>
            {!isCollapsed && (
              <div className="block">
                <span className="font-bold text-lg text-orange-900 dark:text-stone-100 block">Habitat</span>
                <span className="text-xs text-orange-600 dark:text-stone-400">Track your journey</span>
              </div>
            )}
          </Link>
          
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-stone-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-orange-900 dark:text-stone-100" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-orange-900 dark:text-stone-100" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg
                  font-medium transition-all duration-200 text-sm sm:text-base
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-red-700 text-white shadow-md'
                      : 'text-orange-700 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-stone-700'
                  }
                  ${isCollapsed ? 'md:justify-center md:px-2' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {!isCollapsed && <span className="md:block">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Theme Toggle */}
        <div className="hidden md:block absolute bottom-6 left-4 right-4">
          <div className={`p-4 rounded-lg bg-orange-100 dark:bg-stone-800 border border-orange-200 dark:border-stone-700 ${isCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && <span className="text-sm font-medium text-orange-900 dark:text-stone-100">Theme</span>}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar Spacer */}
      <div className={`
        hidden md:block flex-shrink-0 transition-all duration-300
        ${isCollapsed ? 'md:w-16 lg:w-16 xl:w-20' : 'md:w-64 lg:w-72 xl:w-80'}
      `} />
    </>
  )
}
