import { Card } from '@/components/ui/card'

export function HabitCard({ title, icon: Icon, streak, progress, color = 'bg-accent' }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-orange-200 dark:border-orange-900/50">
      <div className={`${color} h-24 flex items-center justify-center shadow-inner`}>
        <Icon className="h-12 w-12 text-white drop-shadow-md" />
      </div>
      <div className="p-4 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/10">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-orange-600 dark:text-orange-400">🔥 {streak} days</span>
            <span className="font-semibold text-amber-700 dark:text-amber-300">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-orange-100 dark:bg-orange-950/30">
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
