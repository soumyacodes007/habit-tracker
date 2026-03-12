import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getHabitsByUser } from "@/lib/repositories/habits"
import { getCompletionsForRange } from "@/lib/repositories/completions"
import { computeStreaks } from "@/lib/repositories/streaks"
import StreaksClient from "@/components/streaks/streaks-client"

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(d.getDate() + n); return r
}

export default async function StreaksPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const today = new Date()
  const yearAgo = addDays(today, -364)

  const [habits, completions] = await Promise.all([
    getHabitsByUser(userId),
    getCompletionsForRange(userId, toDateStr(yearAgo), toDateStr(today)),
  ])

  const todayStr = toDateStr(today)
  const thirtyDaysAgo = toDateStr(addDays(today, -29))

  // Build enriched per-habit data
  const habitData = habits.map((habit) => {
    const all = completions
      .filter((c) => c.habitId === habit.id)
      .map((c) => c.completedDate)
      .sort()

    const { currentStreak, longestStreak } = computeStreaks(all)

    // Last 30 days presence map
    const allSet = new Set(all)
    const last30: boolean[] = []
    for (let i = 29; i >= 0; i--) {
      last30.push(allSet.has(toDateStr(addDays(today, -i))))
    }

    // Completion rate (days completed / days habit existed, capped at 365)
    const createdAt = new Date(habit.createdAt)
    const daysSinceCreated = Math.max(
      1,
      Math.min(365, Math.round((today.getTime() - createdAt.getTime()) / 86400000))
    )
    const completionRate = Math.round((all.length / daysSinceCreated) * 100)

    // Trending up = completed today AND yesterday (streak growing) or just started today
    const isTrendingUp = currentStreak > 0 && allSet.has(todayStr)
    // Trending down = streak was active yesterday but broke today
    const isTrendingDown = !allSet.has(todayStr) && allSet.has(toDateStr(addDays(today, -1))) === false && longestStreak > 0 && currentStreak === 0

    return {
      habit,
      currentStreak,
      longestStreak,
      last30,
      totalCompletions: all.length,
      completionRate,
      isTrendingUp,
      isTrendingDown,
      completedToday: allSet.has(todayStr),
    }
  })

  // Sort: highest current streak first, then longest streak
  habitData.sort((a, b) =>
    b.currentStreak !== a.currentStreak
      ? b.currentStreak - a.currentStreak
      : b.longestStreak - a.longestStreak
  )

  return <StreaksClient habitData={habitData} today={todayStr} />
}
