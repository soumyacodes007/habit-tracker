import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStreaksForAllHabits } from "@/lib/repositories/streaks";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const streaks = await getStreaksForAllHabits(userId);
  return NextResponse.json(streaks);
}
