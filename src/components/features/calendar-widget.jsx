'use client'

import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
export function CalendarWidget({ month: initialMonth, year: initialYear }) {
  const [mounted, setMounted] = useState(false)
  const [today, setToday] = useState(null)
  const [currentDate, setCurrentDate] = useState(null)
  useEffect(() => {
    const todayDate = new Date()
    setToday(todayDate)
    setCurrentDate(
      new Date(initialYear || todayDate.getFullYear(), initialMonth || todayDate.getMonth())
    )
    setMounted(true)
  }, [])
  if (!mounted || !today || !currentDate) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </Card>
    )
  }
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const previousMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => null)
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {previousMonthDays.map((_, i) => (
          <div key={`prev-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const isToday = 
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
          return (
            <button
              key={day}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                isToday
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-accent/20'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
