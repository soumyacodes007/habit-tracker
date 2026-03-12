'use client'

import { Sidebar } from '@/components/layout/sidebar.jsx'
import { StatisticsPanel } from '@/components/features/statistics-panel.jsx'
import { DailyHabitChecklist } from '@/components/features/daily-habit-checklist.jsx'
import { EmotionTracker } from '@/components/features/emotion-tracker.jsx'
import { useState } from 'react'

export default function Home() {
  const currentDate = new Date()
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const [showAllQuickJournal, setShowAllQuickJournal] = useState(false)
  
  const quickJournalItems = [
    {
      id: 1,
      emoji: '🤔',
      title: 'Pause & reflect',
      description: 'What are you grateful for today?',
      tags: ['Today', 'Personal'],
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      borderColor: 'border-pink-200 dark:border-pink-800',
      tagColor: 'bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200',
      hoverColor: 'text-pink-700 dark:text-pink-300',
      lineColor: 'bg-pink-300 dark:bg-pink-700'
    },
    {
      id: 2,
      emoji: '💡',
      title: 'Set intentions',
      description: 'How do you want to feel?',
      tags: ['Today', 'Family'],
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      tagColor: 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
      hoverColor: 'text-purple-700 dark:text-purple-300',
      lineColor: 'bg-purple-300 dark:bg-purple-700'
    },
    {
      id: 3,
      emoji: '🌙',
      title: 'Evening',
      description: 'Reflect on your day and unwind',
      tags: ['Today'],
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      tagColor: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
      hoverColor: 'text-blue-700 dark:text-blue-300',
      lineColor: 'bg-blue-300 dark:bg-blue-700'
    },
    {
      id: 4,
      emoji: '🎯',
      title: 'Goals',
      description: 'Set your daily goals and priorities',
      tags: ['Today', 'Work'],
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      tagColor: 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200',
      hoverColor: 'text-green-700 dark:text-green-300',
      lineColor: 'bg-green-300 dark:bg-green-700'
    },
    {
      id: 5,
      emoji: '📝',
      title: 'Free write',
      description: 'Let your thoughts flow freely',
      tags: ['Creative'],
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      tagColor: 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200',
      hoverColor: 'text-yellow-700 dark:text-yellow-300',
      lineColor: 'bg-yellow-300 dark:bg-yellow-700'
    },
    {
      id: 6,
      emoji: '❤️',
      title: 'Relationships',
      description: 'Reflect on your connections',
      tags: ['Family', 'Friends'],
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      borderColor: 'border-rose-200 dark:border-rose-800',
      tagColor: 'bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200',
      hoverColor: 'text-rose-700 dark:text-rose-300',
      lineColor: 'bg-rose-300 dark:bg-rose-700'
    }
  ]

  const visibleItems = showAllQuickJournal ? quickJournalItems : quickJournalItems.slice(0, 3)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-900 dark:to-stone-800">
      <Sidebar />
      <main className="md:ml-64 px-4 py-6 md:px-6 md:py-8 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            {/* Header with Greeting */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Hi, Annie B
                </h1>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {weekDays.map((day, index) => (
                    <div key={day} className="text-center flex-shrink-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{day}</div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        index === 5 ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-stone-700'
                      }`}>
                        {7 + index}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg ml-4">
                <span className="text-white text-xl">🦊</span>
              </div>
            </div>

            {/* My Journal Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Journal</h2>
                <button className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
                  See all
                </button>
              </div>
              
              {/* Main Journal Cards Grid */}
              <div className="flex gap-3 flex-row h-[140px] md:h-[200px]">
                {/* Morning Card - Main */}
                <div className="flex-[3] bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-3xl p-4 md:p-6 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10 max-w-[70%]">
                    <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">Let's start your day</h3>
                    <p className="text-xs md:text-sm opacity-90 mb-2 md:mb-4">Begin with a mindful morning reflection</p>
                  </div>
                  {/* Decorative mountains */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 md:h-16">
                    <svg viewBox="0 0 400 80" className="w-full h-full">
                      <path d="M0,80 L0,50 L50,20 L100,35 L150,15 L200,25 L250,10 L300,20 L350,12 L400,18 L400,80 Z" 
                            fill="rgba(0,0,0,0.1)"/>
                      <path d="M0,80 L0,60 L80,30 L140,45 L200,25 L280,40 L350,25 L400,30 L400,80 Z" 
                            fill="rgba(0,0,0,0.05)"/>
                    </svg>
                  </div>
                  {/* Sun */}
                  <div className="absolute top-2 md:top-4 right-3 md:right-6 w-8 md:w-10 h-8 md:h-10 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-lg">☀️</span>
                  </div>
                </div>

                {/* Evening Card - Sidebar */}
                <div className="flex-1 bg-gradient-to-b from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-800 rounded-2xl p-3 md:p-4 shadow-lg flex flex-col items-center justify-center border border-purple-400 dark:border-purple-600 relative overflow-hidden">
                  <div className="relative z-10 text-2xl md:text-3xl mb-1 md:mb-3">🌙</div>
                  <h3 className="relative z-10 text-xs md:text-sm font-bold text-center text-purple-900 dark:text-purple-100 mb-1 md:mb-2">Evening</h3>
                  <p className="relative z-10 text-xs text-center text-purple-800 dark:text-purple-200 leading-relaxed hidden md:block">Reflect on your day</p>
                  {/* Decorative mountains */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12">
                    <svg viewBox="0 0 400 80" className="w-full h-full">
                      <path d="M0,80 L0,50 L50,20 L100,35 L150,15 L200,25 L250,10 L300,20 L350,12 L400,18 L400,80 Z" 
                            fill="rgba(0,0,0,0.1)"/>
                      <path d="M0,80 L0,60 L80,30 L140,45 L200,25 L280,40 L350,25 L400,30 L400,80 Z" 
                            fill="rgba(0,0,0,0.05)"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Journal Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Journal</h2>
                <button 
                  onClick={() => setShowAllQuickJournal(!showAllQuickJournal)}
                  className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-300 hover:scale-105"
                >
                  {showAllQuickJournal ? 'Show less' : 'See all'}
                </button>
              </div>
              
              <div className="flex overflow-x-auto gap-3 pb-2 mb-6 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible">
                {visibleItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`${item.bgColor} rounded-2xl p-3 md:p-4 hover:shadow-md transition-all duration-300 border ${item.borderColor} group cursor-pointer transform hover:scale-105 flex-shrink-0 w-40 md:w-auto md:flex-shrink ${
                      showAllQuickJournal && index >= 3 ? 'animate-fadeIn' : ''
                    }`}
                    style={{
                      animationDelay: showAllQuickJournal && index >= 3 ? `${(index - 3) * 100}ms` : '0ms'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <span className="text-base md:text-lg">{item.emoji}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xs md:text-base">{item.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 md:mb-4 leading-relaxed">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className={`px-2 py-1 ${item.tagColor} rounded-full text-xs`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {/* Hover animation */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`h-px ${item.lineColor} mb-2`}></div>
                      <p className={`text-xs ${item.hoverColor}`}>Click to start journaling</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Statistics Panel */}
            <StatisticsPanel />
            
            {/* Daily Habits */}
            <DailyHabitChecklist />

            {/* Emotion Tracker */}
            <EmotionTracker />
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}