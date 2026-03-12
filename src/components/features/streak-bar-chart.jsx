'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const defaultData = [
  { habit: 'Exercise', current: 5, longest: 12 },
  { habit: 'Meditation', current: 12, longest: 15 },
  { habit: 'Reading', current: 8, longest: 10 },
  { habit: 'Journaling', current: 3, longest: 7 },
  { habit: 'Cycling', current: 4, longest: 6 },
  { habit: 'Self-Care', current: 7, longest: 9 },
]

export function StreakBarChart({ data = defaultData, title = 'Habit Streaks Comparison' }) {
  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="habit" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            height={60}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="current" fill="#F59E0B" name="Current Streak" radius={[8, 8, 0, 0]} />
          <Bar dataKey="longest" fill="#FB923C" name="Longest Streak" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
