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
