'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const emotionColors = {
  happy: '#F4B860',
  sad: '#A16207',
  calm: '#65A30D',
  anxious: '#7C3AED',
}

const emotionLabels = {
  happy: 'Happy',
  sad: 'Sad',
  calm: 'Calm',
  anxious: 'Anxious',
}

export function CalendarWithEmotions({
  month: initialMonth,
  year: initialYear,
  daysData = {},
}) {
  const [mounted, setMounted] = useState(false)
  const [today, setToday] = useState(null)
  const [currentDate, setCurrentDate] = useState(null)

  useEffect(() => {
    const todayDate = new Date()
    setToday(todayDate)
    setCurrentDate(
      new Date(
        initialYear || todayDate.getFullYear(),
        initialMonth || todayDate.getMonth()
      )
    )
    setMounted(true)
  }, [])

  if (!mounted || !today || !currentDate) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-96 bg-muted rounded-lg animate-pulse" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    )
  }

  const emotionStats = {
    happy: 48,
    sad: 33,
    calm: 27,
    anxious: 40,
  }

  const totalEntries = Object.values(daysData).reduce(
    (sum, day) => sum + (day.entries || 0),
    0
  )

  return (
    <div className="grid gap-4 md:grid-cols-3">

      {/* Calendar */}
      <Card className="md:col-span-2 p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentDate.getFullYear()}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Days header */}
        <div className="mb-4 grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => (
            <div
              key={idx}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium
              ${
                day === null
                  ? 'text-muted-foreground'
                  : day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear()
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              {day && (
                <>
                  {day}

                  {daysData[day]?.emotion && (
                    <div
                      className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: emotionColors[daysData[day].emotion],
                      }}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-4 sm:p-6">
        <h3 className="mb-4 font-semibold">Journal Summary</h3>

        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-accent">
            {totalEntries || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Total journal entries
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold">Emotions This Month</p>

          {Object.entries(emotionStats).map(([emotion, percentage]) => (
            <div key={emotion} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="capitalize text-muted-foreground">
                  {emotion}
                </span>
                <span className="font-medium">{percentage}%</span>
              </div>

              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: emotionColors[emotion],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2 border-t pt-4">
          <p className="text-xs font-semibold">Legend</p>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(emotionLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: emotionColors[key] }}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}