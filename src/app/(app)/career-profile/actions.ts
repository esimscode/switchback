"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function updateCareerProfile(formData: FormData) {
  const user = await getUser();

  await prisma.careerProfile.update({
    where: { userId: user.id },
    data: {
      primaryHeadline: String(formData.get("primaryHeadline") ?? "").trim(),
      corePositioning: String(formData.get("corePositioning") ?? "").trim(),
      coreStory: String(formData.get("coreStory") ?? "").trim(),
      portfolioTagline: String(formData.get("portfolioTagline") ?? "").trim(),
      linkedinHeadline: String(formData.get("linkedinHeadline") ?? "").trim(),
      targetRoles: lines(formData.get("targetRoles")),
      bridgeRoles: lines(formData.get("bridgeRoles")),
      skills: lines(formData.get("skills")),
      credibilityRules: lines(formData.get("credibilityRules")),
    },
  });

  revalidatePath("/career-profile");
  redirect("/career-profile");
}
