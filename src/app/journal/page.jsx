'use client'

import { Sidebar } from '@/components/layout/sidebar.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea as TextareaComponent } from '@/components/ui/textarea'
import { CalendarWidget } from '@/components/features/calendar-widget.jsx'
import { EmotionStatsCard } from '@/components/features/emotion-stats-card.jsx'
import { WeeklyActivityChart } from '@/components/features/weekly-activity-chart.jsx'
import { useState } from 'react'

export default function JournalPage() {
  const [journalEntry, setJournalEntry] = useState('')
  const [selectedDate] = useState(new Date())

  const handleSave = () => {
    if (journalEntry.trim()) {
      console.log('[v0] Saving journal entry:', journalEntry)
      setJournalEntry('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-900 dark:to-stone-800">
      <Sidebar />
      <main className="md:ml-64 px-4 py-6 md:px-6 md:py-8 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  My Journal
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Celebrate what made you smile today
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">10</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">entries created</p>
              </div>
            </div>

            {/* Main Journal Entry Card */}
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-lg border border-orange-100 dark:border-stone-700">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
              </div>

              <div className="space-y-4">
                <TextareaComponent
                  placeholder="Write your thoughts and feelings here..."
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  className="min-h-40 resize-none border-orange-200 dark:border-stone-600 rounded-2xl p-4"
                />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setJournalEntry('')}
                    className="rounded-full border-orange-200 dark:border-stone-600 px-6"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!journalEntry.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg px-6"
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            </div>

            {/* Emotions Section */}
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-lg border border-orange-100 dark:border-stone-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Emotions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Here are four core emotions</p>
              
              <div className="flex items-end justify-center gap-4 md:gap-8 h-72 mb-8">
                {/* Happy Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-12 md:w-16 h-48 md:h-56 bg-yellow-400 rounded-full md:rounded-3xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-lg md:text-xl">48%</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mt-4">Happy</div>
                </div>

                {/* Sad Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-12 md:w-16 h-40 md:h-48 bg-orange-700 rounded-full md:rounded-3xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-lg md:text-xl">33%</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mt-4">Sad</div>
                </div>

                {/* Angry Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-12 md:w-16 h-24 md:h-28 bg-red-500 rounded-full md:rounded-3xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-sm md:text-lg">12%</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mt-4">Angry</div>
                </div>

                {/* Calm Bar */}
                <div className="flex flex-col items-center">
                  <div className="w-12 md:w-16 h-16 md:h-20 bg-blue-400 rounded-full md:rounded-3xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-xs md:text-base">7%</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white mt-4">Calm</div>
                </div>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg py-3">
                Create a New Entry
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-lg border border-orange-100 dark:border-stone-700 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Entries this week</div>
              </div>
              <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-lg border border-orange-100 dark:border-stone-700 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">2</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Day streak</div>
              </div>
              <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-lg border border-orange-100 dark:border-stone-700 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">10</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total entries</div>
              </div>
            </div>

            {/* Calendar Widget */}
            <CalendarWidget />

            {/* Emotion Stats */}
            <EmotionStatsCard />

            {/* Weekly Activity Chart */}
            <WeeklyActivityChart />
          </div>
        </div>
      </main>
    </div>
  )
}