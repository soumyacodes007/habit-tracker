import { Card } from '@/components/ui/card'

const defaultEmotions = [
  { label: 'Happy', percentage: 48, color: '#F4B860' },
  { label: 'Sad', percentage: 33, color: '#A16207' },
  { label: 'Calm', percentage: 27, color: '#65A30D' },
  { label: 'Anxious', percentage: 40, color: '#7C3AED' },
]

export function EmotionTracker({ emotions = defaultEmotions }) {
  const total = emotions.reduce((sum, e) => sum + e.percentage, 0)
  const circumference = 2 * Math.PI * 45

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="mb-6 font-semibold text-foreground">Emotions</h3>
      
      <div className="flex flex-col gap-6">
        {/* Donut Chart */}
        <div className="flex justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="20"
            />
            {emotions.map((emotion, index) => {
              const startAngle = emotions.slice(0, index).reduce((sum, e) => sum + (e.percentage / total) * 360, 0)
              const endAngle = startAngle + (emotion.percentage / total) * 360
              const startRad = (startAngle - 90) * (Math.PI / 180)
              const endRad = (endAngle - 90) * (Math.PI / 180)

              const x1 = 80 + 45 * Math.cos(startRad)
              const y1 = 80 + 45 * Math.sin(startRad)
              const x2 = 80 + 45 * Math.cos(endRad)
              const y2 = 80 + 45 * Math.sin(endRad)

              const largeArc = endAngle - startAngle > 180 ? 1 : 0

              const pathData = [
                `M ${x1} ${y1}`,
                `A 45 45 0 ${largeArc} 1 ${x2} ${y2}`,
              ].join(' ')

              return (
                <path
                  key={emotion.label}
                  d={pathData}
                  fill="none"
                  stroke={emotion.color}
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              )
            })}
            <text
              x="80"
              y="80"
              textAnchor="middle"
              dy="0.3em"
              className="fill-foreground text-lg font-bold"
            >
              420
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {emotions.map((emotion) => (
            <div key={emotion.label} className="text-center">
              <div className="mb-2 flex justify-center">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: emotion.color }}
                >
                  {emotion.percentage}%
                </div>
              </div>
              <p className="text-xs font-medium text-foreground">{emotion.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
