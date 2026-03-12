'use client'

import { Sidebar } from '@/components/layout/sidebar.jsx'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea as TextareaComponent } from '@/components/ui/textarea'
import { CalendarWidget } from '@/components/features/calendar-widget.jsx'
import { EmotionTracker } from '@/components/features/emotion-tracker.jsx'
import { EmotionStatsCard } from '@/components/features/emotion-stats-card.jsx'
import { WeeklyActivityChart } from '@/components/features/weekly-activity-chart.jsx'
import { useState } from 'react'
import { Plus } from 'lucide-react'
export default function JournalPage() {
  const [journalEntry, setJournalEntry] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const handleSave = () => {
    if (journalEntry.trim()) {
      console.log('[v0] Saving journal entry:', journalEntry)
      setJournalEntry('')
    }
  }
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 overflow-x-hidden">
        <div className="mx-auto max-w-7xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              My Journal
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Track your thoughts, emotions, and progress
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900/50">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Celebrate what made you smile today.
                  </p>
                </div>
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 mb-6">420</div>
                <p className="text-sm text-orange-600 dark:text-orange-400">entries created</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Create New Entry</h3>
                <div className="space-y-4">
                  <TextareaComponent
                    placeholder="Write your thoughts and feelings here..."
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    className="min-h-40 resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setJournalEntry('')}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!journalEntry.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Save Entry
                    </Button>
                  </div>
                </div>
              </Card>
              <EmotionTracker />
              <EmotionStatsCard />
              <WeeklyActivityChart />
            </div>
            <div className="space-y-8">
              <CalendarWidget />
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-900/50">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Entries this week</span>
                    <span className="font-bold text-amber-900 dark:text-amber-100">5</span>
                  </div>
                  <div className="h-px bg-amber-300 dark:bg-amber-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Streak</span>
                    <span className="font-bold text-amber-900 dark:text-amber-100">2 days</span>
                  </div>
                  <div className="h-px bg-amber-300 dark:bg-amber-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Total entries</span>
                    <span className="font-bold text-amber-900 dark:text-amber-100">420</span>
                  </div>
                  <Button className="w-full mt-4 bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    New Journal
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}
