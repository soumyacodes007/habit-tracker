'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { useState, useEffect } from 'react'

export function TimerWidget({ initialMinutes = 15, initialSeconds = 25 }) {
  const [minutes, setMinutes] = useState(initialMinutes)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 0) {
          setMinutes((m) => {
            if (m === 0) {
              setIsRunning(false)
              return 0
            }
            return m - 1
          })
          return 59
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference * (1 - (minutes * 60 + seconds) / (initialMinutes * 60 + initialSeconds))

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="mb-6 text-center font-semibold text-foreground">Meditation</h3>

      <div className="flex flex-col items-center gap-6">
        {/* Circular Timer */}
        <div className="relative h-48 w-48 sm:h-56 sm:w-56">
          <svg width="100%" height="100%" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#6366F1"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">mins left</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => {
              setIsRunning(false)
              setMinutes(initialMinutes)
              setSeconds(initialSeconds)
            }}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
