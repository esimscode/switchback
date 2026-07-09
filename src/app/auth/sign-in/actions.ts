"use server";

import { auth } from "@/lib/auth/server";

type SignInState = { error: string } | { success: true; redirectTo: string };

export async function signInWithEmail(
  _prevState: SignInState | null,
  formData: FormData,
): Promise<SignInState> {
  const { error } = await auth.signIn.email({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message || "Failed to sign in. Try again." };
  }

  // Only follow same-app paths — never absolute URLs — to rule out
  // open-redirect abuse of the redirectTo param. The client performs the
  // navigation as a full page load so client-side session state (the
  // sidebar UserButton) starts fresh instead of showing the signed-out
  // snapshot until a manual reload.
  const redirectTo = formData.get("redirectTo");
  const target =
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
      ? redirectTo
      : "/";
  return { success: true, redirectTo: target };
}
