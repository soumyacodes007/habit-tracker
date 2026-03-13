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

const validDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(4).optional(),
  targetDays: z.array(z.enum(validDays)).min(1).optional(),
  habitType: z.enum(["check", "timer"]).optional(),
  timerDuration: z.string().optional(), // minutes as string
});

const updateHabitSchema = createHabitSchema.partial();

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createHabitAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const raw: Record<string, unknown> = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
    habitType: formData.get("habitType") || undefined,
    timerDuration: formData.get("timerDuration") || undefined,
  };

  // targetDays comes as JSON string from forms
  const targetDaysRaw = formData.get("targetDays");
  if (targetDaysRaw) {
    try {
      raw.targetDays = JSON.parse(targetDaysRaw as string);
    } catch {
      return { error: "Invalid targetDays format" };
    }
  }

  const parsed = createHabitSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const habit = await createHabit(userId, parsed.data);
  revalidatePath("/habits");
  revalidatePath("/habits/manage");
  return { data: habit };
}

export async function updateHabitAction(habitId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const raw: Record<string, unknown> = {
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
    habitType: formData.get("habitType") || undefined,
    timerDuration: formData.get("timerDuration") || undefined,
  };

  const targetDaysRaw = formData.get("targetDays");
  if (targetDaysRaw) {
    try {
      raw.targetDays = JSON.parse(targetDaysRaw as string);
    } catch {
      return { error: "Invalid targetDays format" };
    }
  }

  const parsed = updateHabitSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const habit = await updateHabit(userId, habitId, parsed.data);
  if (!habit) return { error: "Habit not found" };

  revalidatePath("/habits");
  revalidatePath("/habits/manage");
  return { data: habit };
}

export async function archiveHabitAction(habitId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const habit = await archiveHabit(userId, habitId);
  if (!habit) return { error: "Habit not found" };

  revalidatePath("/habits");
  revalidatePath("/habits/manage");
  return { data: habit };
}
