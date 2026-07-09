"use client";

import { useActionState } from "react";
import { FileText, Loader2, Megaphone, Target } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  draftCaseStudy,
  draftLinkedInPost,
  suggestNextMilestone,
  type GenerateState,
} from "../actions";

function GenerateButton({
  action,
  icon,
  label,
  pendingLabel,
}: {
  action: (prev: GenerateState) => Promise<GenerateState>;
  icon: React.ReactNode;
  label: string;
  pendingLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<GenerateState>(
    action,
    {},
  );

  return (
    <div className="flex items-center gap-2">
      <form action={formAction}>
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" /> {pendingLabel}
            </>
          ) : (
            <>
              {icon} {label}
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

export function GenerateButtons({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <GenerateButton
        action={draftCaseStudy.bind(null, projectId)}
        icon={<FileText />}
        label="Draft case study"
        pendingLabel="Drafting…"
      />
      <GenerateButton
        action={suggestNextMilestone.bind(null, projectId)}
        icon={<Target />}
        label="Suggest next milestone"
        pendingLabel="Thinking…"
      />
      <GenerateButton
        action={draftLinkedInPost.bind(null, projectId)}
        icon={<Megaphone />}
        label="Draft LinkedIn post"
        pendingLabel="Writing…"
      />
    </div>
  );
}
