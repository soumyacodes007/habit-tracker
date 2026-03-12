import { Card } from '@/components/ui/card'

export function HabitCard({ title, icon: Icon, streak, progress, color = 'bg-accent' }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-orange-200 dark:border-orange-900/50">
      <div className={`${color} h-16 md:h-20 lg:h-24 flex items-center justify-center shadow-inner`}>
        <Icon className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white drop-shadow-md" />
      </div>
      <div className="p-3 md:p-4 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/10">
        <h3 className="font-semibold text-foreground text-sm md:text-base">{title}</h3>
        <div className="mt-2 md:mt-3 space-y-2">
          <div className="flex justify-between text-xs md:text-sm">
            <span className="text-orange-600 dark:text-orange-400">🔥 {streak} days</span>
            <span className="font-semibold text-amber-700 dark:text-amber-300">{progress}%</span>
          </div>
          <div className="h-1.5 md:h-2 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-950/30">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
