'use client'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { Dumbbell, Brain, BookOpen, PenTool, Heart, Zap, Music, CheckCircle2 } from 'lucide-react'

const defaultHabits = [
  { id: 1, title: 'Exercise', icon: Dumbbell, category: 'fitness' },
  { id: 2, title: 'Meditation', icon: Brain, category: 'mindfulness' },
  { id: 3, title: 'Reading', icon: BookOpen, category: 'learning' },
  { id: 4, title: 'Journaling', icon: PenTool, category: 'reflection' },
  { id: 5, title: 'Gratitude', icon: Heart, category: 'wellness' },
  { id: 6, title: 'Morning Stretch', icon: Zap, category: 'fitness' },
]

export function DailyHabitChecklist({ habits = defaultHabits }) {
  const [checkedHabits, setCheckedHabits] = useState({})

  const toggleHabit = (habitId) => {
    setCheckedHabits((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }))
  }

  const completedCount = Object.values(checkedHabits).filter(Boolean).length
  const completionPercentage = Math.round((completedCount / habits.length) * 100)

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/10 dark:to-amber-950/10 border-orange-200 dark:border-orange-900/50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">Today's Habits</h2>
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-orange-900 dark:text-orange-100">{completedCount}/{habits.length}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-stone-600">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-orange-600 dark:text-stone-400">
          {completionPercentage}% completed today
        </p>
      </div>

      {/* Habit list */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const Icon = habit.icon
          const isChecked = checkedHabits[habit.id]

          return (
            <div
              key={habit.id}
              className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                isChecked
                  ? 'bg-orange-100/50 dark:bg-stone-600'
                  : 'bg-card hover:bg-orange-50/30 dark:hover:bg-stone-700'
              }`}
            >
              <Checkbox
                checked={isChecked || false}
                onCheckedChange={() => toggleHabit(habit.id)}
                className="h-5 w-5"
              />
              <Icon className={`h-5 w-5 ${isChecked ? 'text-orange-600 dark:text-orange-400' : 'text-orange-500 dark:text-stone-400'}`} />
              <span
                className={`flex-1 font-medium ${
                  isChecked
                    ? 'text-orange-600 dark:text-stone-400 line-through'
                    : 'text-orange-900 dark:text-stone-100'
                }`}
              >
                {habit.title}
              </span>
              {isChecked && (
                <div className="h-6 w-6 rounded-full bg-orange-500 dark:bg-orange-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Motivational message */}
      <div className="mt-6 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 p-3 text-center border border-amber-300 dark:border-amber-900/50">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          {completedCount === 0 && "Let's build those habits today!"}
          {completedCount > 0 && completedCount < habits.length && `Keep it up! ${habits.length - completedCount} more to go!`}
          {completedCount === habits.length && "Amazing! You've completed all your habits today!"}
        </p>
      </div>
    </Card>
  )
}
