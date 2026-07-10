"use client";

import { useActionState } from "react";

import { joinWaitlist } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, null);

  if (state?.success) {
    return (
      <p className="text-sm">
        You&apos;re on the list — we&apos;ll email you when the hosted plan
        opens up.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="h-10 rounded-full bg-background px-4"
        />
        <Button type="submit" disabled={isPending} className="h-10 shrink-0">
          {isPending ? "Joining…" : "Join the waitlist"}
        </Button>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
