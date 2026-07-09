"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect } from "react";

import { SwitchbackMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signInWithEmail } from "./actions";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);
  const redirectTo = useSearchParams().get("redirectTo") ?? "/";

  useEffect(() => {
    if (state && "success" in state) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-3">
        <SwitchbackMark className="size-10" />
        <h1 className="text-xl font-semibold tracking-tight">
          Sign in to Switchback
        </h1>
        <p className="text-sm text-muted-foreground">
          Same mountain. Higher ground.
        </p>
      </div>

      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        {state && "error" in state && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={isPending || Boolean(state && "success" in state)}
        >
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/auth/sign-up" className="underline underline-offset-4">
          Create one
        </Link>
      </p>
    </main>
  );
}
