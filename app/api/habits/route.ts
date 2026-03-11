import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHabitsByUser, createHabit } from "@/lib/repositories/habits";

const validDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(4).optional(),
  targetDays: z.array(z.enum(validDays)).min(1).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const habits = await getHabitsByUser(userId);
  return NextResponse.json(habits);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const habit = await createHabit(userId, parsed.data);
  return NextResponse.json(habit, { status: 201 });
}
