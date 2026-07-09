"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";

import { SwitchbackMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signUpWithEmail } from "./actions";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

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
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          A private workspace for your career strategy.
        </p>
      </div>

      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>

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
            autoComplete="new-password"
          />
        </div>

        {state && "error" in state && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={isPending || Boolean(state && "success" in state)}
        >
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </main>
  );
}
