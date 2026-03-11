import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getHabitById,
  updateHabit,
  archiveHabit,
} from "@/lib/repositories/habits";

const validDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(4).optional(),
  targetDays: z.array(z.enum(validDays)).min(1).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const habit = await getHabitById(userId, id);
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(habit);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const habit = await updateHabit(userId, id, parsed.data);
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(habit);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const habit = await archiveHabit(userId, id);
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ archived: true, habit });
}
