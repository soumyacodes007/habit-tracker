'use client'

import { Card } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const defaultData = [
  { day: 'Mon', activities: 12 },
  { day: 'Tue', activities: 15 },
  { day: 'Wed', activities: 18 },
  { day: 'Thu', activities: 14 },
  { day: 'Fri', activities: 20 },
  { day: 'Sat', activities: 22 },
  { day: 'Sun', activities: 16 },
]

export function WeeklyActivityChart({ data = defaultData, title = 'Weekly Activity' }) {
  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
          <Area 
            type="monotone" 
            dataKey="activities" 
            stroke="#F59E0B" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorActivities)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
