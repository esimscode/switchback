"use server";

import { auth } from "@/lib/auth/server";

// Switchback is a single-person workspace. AUTH_ALLOWED_EMAILS (comma-
// separated) limits who can create an account; unset means open sign-up.
function isAllowedEmail(email: string): boolean {
  const allowed = process.env.AUTH_ALLOWED_EMAILS;
  if (!allowed) return true;
  return allowed
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(email.trim().toLowerCase());
}

type SignUpState = { error: string } | { success: true; redirectTo: string };

export async function signUpWithEmail(
  _prevState: SignUpState | null,
  formData: FormData,
): Promise<SignUpState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email address must be provided." };
  }
  if (!isAllowedEmail(email)) {
    return { error: "Sign-ups are restricted on this workspace." };
  }

  const { error } = await auth.signUp.email({
    email,
    name: formData.get("name") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message || "Failed to create account." };
  }

  // Full page load on the client so session-driven UI starts fresh.
  return { success: true, redirectTo: "/" };
}
