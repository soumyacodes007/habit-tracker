"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createHabit,
  updateHabit,
  archiveHabit,
} from "@/lib/repositories/habits";

// ─── Validation schemas ───────────────────────────────────────────────────────

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(4).optional(),
});

const updateHabitSchema = createHabitSchema.partial();

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createHabitAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = createHabitSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const habit = await createHabit(userId, parsed.data);
  revalidatePath("/dashboard");
  return { data: habit };
}

export async function updateHabitAction(habitId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = updateHabitSchema.safeParse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const habit = await updateHabit(userId, habitId, parsed.data);
  if (!habit) return { error: "Habit not found" };

  revalidatePath("/dashboard");
  return { data: habit };
}

export async function archiveHabitAction(habitId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const habit = await archiveHabit(userId, habitId);
  if (!habit) return { error: "Habit not found" };

  revalidatePath("/dashboard");
  return { data: habit };
}
