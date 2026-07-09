"use server";

import { revalidatePath } from "next/cache";

import type { ReflectionType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

function optional(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createReflection(formData: FormData) {
  const user = await getUser();

  await prisma.careerReflection.create({
    data: {
      userId: user.id,
      reflectionType: (optional(formData.get("reflectionType")) ??
        "WEEKLY_CHECKIN") as ReflectionType,
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? "").trim(),
      mood: optional(formData.get("mood")),
      relatedProjectId: optional(formData.get("relatedProjectId")),
      relatedApplicationId: optional(formData.get("relatedApplicationId")),
    },
  });

  revalidatePath("/reflections");
}
