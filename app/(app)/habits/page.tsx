import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getHabitsByUser } from "@/lib/repositories/habits"
import { getCompletionsForDate } from "@/lib/repositories/completions"
import { getStreaksForAllHabits } from "@/lib/repositories/streaks"
import HabitChecklist from "@/components/habits/habit-checklist"
import HabitsPageClient from "@/components/habits/habits-page-client"

function todayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export default async function HabitsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const date = todayString()

  const [habits, completions, streaks] = await Promise.all([
    getHabitsByUser(userId),
    getCompletionsForDate(userId, date),
    getStreaksForAllHabits(userId),
  ])

  return (
    <HabitsPageClient
      habits={habits}
      completions={completions}
      streaks={streaks}
      date={date}
    />
  )
}
