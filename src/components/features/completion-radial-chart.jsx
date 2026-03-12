'use client'

import { Card } from '@/components/ui/card'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts'
const defaultData = [
  { name: 'Completed', value: 75, fill: '#F59E0B' },
]
export function CompletionRadialChart({ 
  percentage = 75, 
  title = 'Today\'s Completion',
  subtitle = 'Keep going!'
}) {
  const data = [
    { name: 'Completed', value: percentage, fill: '#F59E0B' },
  ]
  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/50">
      <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">{title}</h3>
      <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">{subtitle}</p>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="60%" 
          outerRadius="90%" 
          barSize={20} 
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill="#F59E0B"
          />
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="text-3xl font-bold"
            fill="hsl(var(--foreground))"
          >
            {percentage}%
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </Card>
  )
}
