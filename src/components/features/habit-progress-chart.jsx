'use client'

import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const defaultData = [
  { day: 'Mon', exercise: 80, meditation: 90, reading: 60, journaling: 40 },
  { day: 'Tue', exercise: 85, meditation: 85, reading: 65, journaling: 50 },
  { day: 'Wed', exercise: 75, meditation: 95, reading: 70, journaling: 45 },
  { day: 'Thu', exercise: 90, meditation: 88, reading: 75, journaling: 60 },
  { day: 'Fri', exercise: 85, meditation: 92, reading: 80, journaling: 55 },
  { day: 'Sat', exercise: 95, meditation: 90, reading: 85, journaling: 70 },
  { day: 'Sun', exercise: 88, meditation: 94, reading: 78, journaling: 65 },
]

export function HabitProgressChart({ data = defaultData, title = 'Weekly Habit Progress' }) {
  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="day" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
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
          <Line 
            type="monotone" 
            dataKey="exercise" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={{ fill: '#EF4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="meditation" 
            stroke="#F59E0B" 
            strokeWidth={2}
            dot={{ fill: '#F59E0B', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="reading" 
            stroke="#FB923C" 
            strokeWidth={2}
            dot={{ fill: '#FB923C', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="journaling" 
            stroke="#FBBF24" 
            strokeWidth={2}
            dot={{ fill: '#FBBF24', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
