"use server";

import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }

  // Idempotent: signing up twice is a no-op, not an error.
  await prisma.waitlistSignup.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return { success: true };
}
