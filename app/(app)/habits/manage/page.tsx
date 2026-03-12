import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getHabitsByUser } from "@/lib/repositories/habits"
import { getStreaksForAllHabits } from "@/lib/repositories/streaks"
import ManageHabitsClient from "@/components/habits/manage-habits-client"

export default async function ManageHabitsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [habits, streaks] = await Promise.all([
    getHabitsByUser(userId),
    getStreaksForAllHabits(userId),
  ])

  return <ManageHabitsClient habits={habits} streaks={streaks} />
}
