'use client'

import { Card } from '@/components/ui/card'

const defaultEmotions = [
  { label: 'Happy', percentage: 48, color: '#F59E0B', count: 12 },
  { label: 'Sad', percentage: 33, color: '#EF4444', count: 8 },
  { label: 'Calm', percentage: 27, color: '#FB923C', count: 7 },
  { label: 'Anxious', percentage: 40, color: '#FBBF24', count: 10 },
]

export function EmotionStatsCard({
  emotions = defaultEmotions,
  totalCount = 37,
  title = 'Emotions This Week',
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">{title}</h3>

      <div className="space-y-4">
        {emotions.map((emotion, idx) => (
          <div key={idx}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{emotion.label}</p>
                <p className="text-xs text-muted-foreground">{emotion.count} entries</p>
              </div>
              <span className="text-sm font-bold text-foreground">{emotion.percentage}%</span>
            </div>
            
            {/* Large visual bar */}
            <div className="h-8 overflow-hidden rounded-lg bg-muted p-1">
              <div
                className="h-full rounded transition-all duration-300"
                style={{
                  width: `${emotion.percentage}%`,
                  backgroundColor: emotion.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-6 border-t border-border pt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Total entries: <span className="font-semibold text-foreground">{totalCount}</span>
        </p>
      </div>
    </Card>
  )
}
