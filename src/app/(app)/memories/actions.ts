"use server";

import { revalidatePath } from "next/cache";

import type { MemoryCategory } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

export async function saveMemory(formData: FormData) {
  const user = await getUser();
  const id = String(formData.get("id") ?? "").trim();
  const key = String(formData.get("key") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const category = String(formData.get("category") ?? "PREFERENCE") as MemoryCategory;
  if (!key || !value) return;

  if (id) {
    await prisma.careerMemory.update({
      where: { id, userId: user.id },
      data: { key, value, category },
    });
  } else {
    await prisma.careerMemory.upsert({
      where: { userId_key: { userId: user.id, key } },
      update: { value, category },
      create: { userId: user.id, key, value, category, source: "manual", confidence: "high" },
    });
  }

  revalidatePath("/memories");
}

export async function deleteMemory(memoryId: string) {
  const user = await getUser();
  await prisma.careerMemory.delete({ where: { id: memoryId, userId: user.id } });
  revalidatePath("/memories");
}
