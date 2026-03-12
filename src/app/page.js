'use client'

import { Sidebar } from '@/components/layout/sidebar.jsx'
import { WelcomeSection } from '@/components/features/welcome-section.jsx'
import { StatisticsPanel } from '@/components/features/statistics-panel.jsx'
import { HabitCard } from '@/components/features/habit-card.jsx'
import { TimerWidget } from '@/components/features/timer-widget.jsx'
import { EmotionTracker } from '@/components/features/emotion-tracker.jsx'
import { CalendarWithEmotions } from '@/components/features/calendar-with-emotions.jsx'
import { DailyHabitChecklist } from '@/components/features/daily-habit-checklist.jsx'
import { HabitProgressChart } from '@/components/features/habit-progress-chart.jsx'
import { StreakBarChart } from '@/components/features/streak-bar-chart.jsx'
import { EmotionPieChart } from '@/components/features/emotion-pie-chart.jsx'
import { CompletionRadialChart } from '@/components/features/completion-radial-chart.jsx'

import { Dumbbell, Brain, BookOpen, PenTool, Bike,HandHeart } from 'lucide-react'

const habits = [
  {
    id: '1',
    title: 'Exercise',
    icon: Dumbbell,
    streak: 5,
    progress: 65,
    color: 'bg-red-400',
  },
  {
    id: '2',
    title: 'Meditation',
    icon: Brain,
    streak: 12,
    progress: 85,
    color: 'bg-purple-400',
  },
  {
    id: '3',
    title: 'Reading',
    icon: BookOpen,
    streak: 8,
    progress: 60,
    color: 'bg-orange-400',
  },
  {
    id: '4',
    title: 'Journaling',
    icon: PenTool,
    streak: 3,
    progress: 40,
    color: 'bg-pink-400',
  },
  {
    id: '5',
    title: 'Cycling',
    icon: Bike,
    streak: 4,
    progress: 35,
    color: 'bg-blue-400',
  },
{
    id: '6',
    title: 'Self-Care',
    icon: HandHeart,
    streak: 7,
    progress: 75,
    color: 'bg-rose-400',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="mx-auto max-w-7xl">
        <div className="space-y-8">
          {/* Welcome Section */}
          <WelcomeSection />

          {/* Statistics */}
          <StatisticsPanel />
          <DailyHabitChecklist />

          {/* Calendar with Emotions - Full Width Featured Section */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Your Journey</h2>
            <CalendarWithEmotions
              daysData={{
                5: { date: 5, emotion: 'happy', entries: 2 },
                8: { date: 8, emotion: 'calm', entries: 1 },
                10: { date: 10, emotion: 'happy', entries: 3 },
                12: { date: 12, emotion: 'anxious', entries: 1 },
                15: { date: 15, emotion: 'calm', entries: 2 },
                18: { date: 18, emotion: 'happy', entries: 2 },
                20: { date: 20, emotion: 'sad', entries: 1 },
                22: { date: 22, emotion: 'happy', entries: 3 },
                25: { date: 25, emotion: 'calm', entries: 2 },
              }}
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Habits and Timer */}
            <div className="space-y-8 lg:col-span-3">
              {/* Habits Grid */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Today's Habits</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      {...habit}
                    />
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <HabitProgressChart />
                <StreakBarChart />
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <EmotionPieChart />
                <CompletionRadialChart percentage={68} />
              </div>

              <TimerWidget />

              {/* Emotion Tracker */}
              <EmotionTracker />
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}
