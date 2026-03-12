'use client'

import { Sidebar } from '@/components/layout/sidebar.jsx'
import { Button } from '@/components/ui/button'
import {
  Dumbbell,
  Brain,
  BookOpen,
  PenTool,
  Heart,
  Zap,
  Music,
  Camera,
  Settings,
  ChevronRight,
} from 'lucide-react'

const habitCategories = [
  {
    id: '1',
    name: 'Exercise',
    description: 'Physical fitness and movement',
    icon: Dumbbell,
    color: 'bg-red-400',
  },
  {
    id: '2',
    name: 'Meditation',
    description: 'Mindfulness and mental peace',
    icon: Brain,
    color: 'bg-purple-400',
  },
  {
    id: '3',
    name: 'Reading',
    description: 'Books and learning',
    icon: BookOpen,
    color: 'bg-orange-400',
  },
  {
    id: '4',
    name: 'Writing',
    description: 'Journaling and creativity',
    icon: PenTool,
    color: 'bg-pink-400',
  },
  {
    id: '5',
    name: 'Wellness',
    description: 'Health and self-care',
    icon: Heart,
    color: 'bg-rose-400',
  },
  {
    id: '6',
    name: 'Energy',
    description: 'Productivity and focus',
    icon: Zap,
    color: 'bg-yellow-400',
  },
  {
    id: '7',
    name: 'Music',
    description: 'Playing instruments or listening',
    icon: Music,
    color: 'bg-blue-400',
  },
  {
    id: '8',
    name: 'Creative',
    description: 'Art and visual expression',
    icon: Camera,
    color: 'bg-green-400',
  },
  {
    id: '9',
    name: 'Customize',
    description: 'Create your own habit',
    icon: Settings,
    color: 'bg-indigo-500',
  },
]

export default function HabitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-900 dark:to-stone-800">
      <Sidebar />
      <main className="md:ml-64 px-4 py-6 md:px-6 md:py-8 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Choose a Habit
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Select a habit category to start building your routine
              </p>
            </div>

            {/* Habits Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {habitCategories.map((category) => {
                const Icon = category.icon
                return (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-stone-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-orange-100 dark:border-stone-700"
                  >
                    <div className={`${category.color} h-20 md:h-24 flex items-center justify-center`}>
                      <Icon className="h-10 w-10 md:h-12 md:w-12 text-white" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{category.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">{category.description}</p>
                      <Button
                        variant="outline"
                        className="mt-3 w-full text-xs md:text-sm rounded-full border-orange-200 dark:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700"
                      >
                        <span>Add Habit</span>
                        <ChevronRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Info Section */}
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-lg border border-orange-100 dark:border-stone-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tips for Building Habits
              </h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-orange-600 dark:text-orange-400">1.</span>
                  <span>Start small and be consistent with your habits</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-600 dark:text-orange-400">2.</span>
                  <span>Track your progress daily to stay motivated</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-600 dark:text-orange-400">3.</span>
                  <span>Combine habits with activities you already do</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-600 dark:text-orange-400">4.</span>
                  <span>Celebrate your streaks and milestones</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}