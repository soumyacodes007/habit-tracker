'use client'
import { Sidebar } from '@/components/layout/sidebar.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Dumbbell,
  Brain,
  BookOpen,
  PenTool,
  Heart,
  Palette,
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
    name: 'Doodling',
    description: 'Painting and colouring',
    icon: Palette,
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
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="md:ml-64 px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-7xl">
        <div className="space-y-6">
         
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Choose a Habit
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Select a habit category to start building your routine
            </p>
          </div>        
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {habitCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card
                  key={category.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-orange-200 dark:border-orange-900/50 hover:scale-105
  ${category.id === habitCategories[habitCategories.length - 1].id
                      ? "xl:col-start-2 xl:translate-x-1/2"
                      : ""
                    }`}
                >
                  <div className={`${category.color} h-32 flex items-center justify-center`}>
                    <Icon className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      <span>Add Habit</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/50">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-3">
              Tips for Building Habits
            </h2>
            <ul className="space-y-2 text-amber-800 dark:text-amber-200">
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
          </Card>
        </div>
        </div>
      </main>
    </div>
  )
}
