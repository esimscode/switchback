"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ContentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

export async function updateResumeVersion(
  resumeVersionId: string,
  formData: FormData,
) {
  const user = await getUser();
  const status = String(formData.get("status") ?? "DRAFT") as ContentStatus;
  const content = String(formData.get("content") ?? "");

  await prisma.resumeVersion.update({
    where: { id: resumeVersionId, userId: user.id },
    data: {
      status,
      content: content.trim().length > 0 ? content : null,
    },
  });

  revalidatePath(`/resumes/${resumeVersionId}`);
  revalidatePath("/career-profile");
  redirect("/career-profile");
}

export async function createResumeVersion(formData: FormData) {
  const user = await getUser();
  const roleFamily = String(formData.get("roleFamily") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!roleFamily) {
    redirect("/resumes");
  }

  const existing = await prisma.resumeVersion.findFirst({
    where: {
      userId: user.id,
      roleFamily: { equals: roleFamily, mode: "insensitive" },
    },
    select: { id: true },
  });
  // One version per family: land on the existing one instead of erroring.
  if (existing) {
    redirect(`/resumes/${existing.id}`);
  }

  const resume = await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      roleFamily,
      name: name || `${roleFamily} Resume`,
    },
  });

  revalidatePath("/resumes");
  revalidatePath("/career-profile");
  redirect(`/resumes/${resume.id}`);
}
