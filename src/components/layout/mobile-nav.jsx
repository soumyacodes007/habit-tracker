'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Plus, BookOpen, User } from 'lucide-react'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/habits',
    label: 'Explore',
    icon: Compass,
  },
  {
    href: '#',
    label: 'Add',
    icon: Plus,
    isCenter: true,
  },
  {
    href: '/journal',
    label: 'Journey',
    icon: BookOpen,
  },
  {
    href: '#',
    label: 'Profile',
    icon: User,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-orange-200 dark:border-stone-700 bg-white dark:bg-stone-900 md:hidden z-40 shadow-2xl">
      <div className="flex h-20 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => e.preventDefault()}
                className="flex flex-col items-center justify-center -mt-8 w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg hover:shadow-xl transition-all transform hover:scale-110 text-white"
              >
                <Icon className="h-6 w-6" />
              </Link>
            )
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <Icon className={`h-6 w-6 ${
                isActive ? 'fill-current' : ''
              }`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
