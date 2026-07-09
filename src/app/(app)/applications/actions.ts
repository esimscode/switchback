"use server";

import { revalidatePath } from "next/cache";

import type { ApplicationStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

function optional(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createApplication(formData: FormData) {
  const user = await getUser();
  const dateApplied = optional(formData.get("dateApplied"));

  await prisma.application.create({
    data: {
      userId: user.id,
      company: String(formData.get("company") ?? "").trim(),
      roleTitle: String(formData.get("roleTitle") ?? "").trim(),
      roleFamily: optional(formData.get("roleFamily")),
      status: (optional(formData.get("status")) ?? "SAVED") as ApplicationStatus,
      source: optional(formData.get("source")),
      link: optional(formData.get("link")),
      salaryRange: optional(formData.get("salaryRange")),
      notes: optional(formData.get("notes")),
      resumeVersionId: optional(formData.get("resumeVersionId")),
      dateApplied: dateApplied ? new Date(dateApplied) : null,
    },
  });

  revalidatePath("/applications");
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
) {
  const user = await getUser();

  await prisma.application.update({
    // Guard on userId so the id can't address another user's row.
    where: { id: applicationId, userId: user.id },
    data: {
      status,
      ...(status === "APPLIED" ? { dateApplied: new Date() } : {}),
    },
  });

  revalidatePath("/applications");
}
