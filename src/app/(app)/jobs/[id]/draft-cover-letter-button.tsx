"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

import { draftCoverLetter, type GenerateState } from "../actions";

export function DraftCoverLetterButton({
  jobAnalysisId,
  label,
}: {
  jobAnalysisId: string;
  label: string;
}) {
  const [state, formAction, isPending] = useActionState<GenerateState>(
    draftCoverLetter.bind(null, jobAnalysisId),
    {},
  );

  return (
    <div className="flex items-center gap-2">
      <form action={formAction}>
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" /> Drafting…
            </>
          ) : (
            <>
              <Mail /> {label}
            </>
          )}
        </Button>
      </form>
      {state.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
    </div>
  );
}
