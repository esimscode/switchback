"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

export async function completeReminder(formData: FormData) {
  const user = await getUser();
  const id = String(formData.get("id") ?? "");
  if (id) {
    // userId guard so an id can't address another user's row.
    await prisma.reminder.update({
      where: { id, userId: user.id },
      data: { status: "DONE" },
    });
  }
  revalidatePath("/reminders");
}

export async function snoozeReminder(formData: FormData) {
  const user = await getUser();
  const id = String(formData.get("id") ?? "");
  const due = new Date(String(formData.get("dueDate") ?? ""));
  if (id && !Number.isNaN(due.getTime())) {
    // Rescheduling re-arms the nudge (notifiedAt cleared, status back to PENDING).
    await prisma.reminder.update({
      where: { id, userId: user.id },
      data: { dueDate: due, notifiedAt: null, status: "PENDING" },
    });
  }
  revalidatePath("/reminders");
}

export async function clearCompleted() {
  const user = await getUser();
  await prisma.reminder.deleteMany({
    where: { userId: user.id, status: { in: ["DONE", "CANCELLED"] } },
  });
  revalidatePath("/reminders");
}
