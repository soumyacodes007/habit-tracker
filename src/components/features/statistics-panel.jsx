import { Card } from '@/components/ui/card'
import { Flame, Target, TrendingUp } from 'lucide-react'

export function StatisticsPanel({
  currentStreak = 13,
  longestStreak = 10,
  completedToday = 8,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="p-4 md:p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-800 dark:to-stone-700 border-orange-200 dark:border-stone-600">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-stone-600 shadow-sm">
            <Flame className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-orange-700 dark:text-stone-300">Current Streak</p>
            <p className="text-xl md:text-2xl font-bold text-orange-900 dark:text-stone-100">{currentStreak}</p>
            <p className="text-xs text-orange-600 dark:text-stone-400">days</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-stone-800 dark:to-stone-700 border-amber-200 dark:border-stone-600">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-stone-600 shadow-sm">
            <Target className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-amber-700 dark:text-stone-300">Longest Streak</p>
            <p className="text-xl md:text-2xl font-bold text-amber-900 dark:text-stone-100">{longestStreak}</p>
            <p className="text-xs text-amber-600 dark:text-stone-400">days</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-stone-800 dark:to-stone-700 border-yellow-200 dark:border-stone-600">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-stone-600 shadow-sm">
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-yellow-700 dark:text-stone-300">Completed Today</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-900 dark:text-stone-100">{completedToday}</p>
            <p className="text-xs text-yellow-600 dark:text-stone-400">habits</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
