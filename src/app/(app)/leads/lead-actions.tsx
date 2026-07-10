"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Loader2, RotateCcw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { analyzeLead, dismissLead, restoreLead, type AnalyzeLeadState } from "./actions";

export function LeadActions({
  leadId,
  status,
  stale,
  existingAnalysisId,
}: {
  leadId: string;
  status: "NEW" | "REVIEWED" | "ANALYZING" | "DISMISSED" | "PROMOTED";
  /** An in-flight ANALYZING run that looks dead; offer a retry. */
  stale?: boolean;
  /** A JobAnalysis already exists for this company + role. */
  existingAnalysisId?: string | null;
}) {
  // Re-analyzing an already-analyzed job needs an explicit second click.
  const needsConfirm = Boolean(existingAnalysisId);
  const [confirming, setConfirming] = useState(false);
  const [state, analyzeAction, isStarting] = useActionState<AnalyzeLeadState>(
    analyzeLead.bind(null, leadId, needsConfirm),
    {},
  );
  const [isMutating, startMutation] = useTransition();
  const busy = isStarting || isMutating;

  if (status === "PROMOTED") {
    return null;
  }

  if (status === "ANALYZING" && !stale) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Loader2 className="animate-spin" /> Analyzing in background…
      </Badge>
    );
  }

  if (status === "DISMISSED") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        disabled={busy}
        onClick={() => startMutation(() => restoreLead(leadId))}
      >
        <RotateCcw /> Restore
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {needsConfirm && !confirming ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => setConfirming(true)}
        >
          <Compass /> Analyze again
        </Button>
      ) : (
        <form action={analyzeAction}>
          <Button
            type="submit"
            variant={confirming ? "destructive" : "outline"}
            size="sm"
            disabled={busy}
          >
            {isStarting ? (
              <>
                <Loader2 className="animate-spin" /> Starting…
              </>
            ) : confirming ? (
              <>
                <Compass /> Sure? Analyze again
              </>
            ) : (
              <>
                <Compass /> {stale ? "Retry analysis" : "Analyze"}
              </>
            )}
          </Button>
        </form>
      )}
      {existingAnalysisId ? (
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href={`/jobs/${existingAnalysisId}`}>
            View analysis <ArrowRight />
          </Link>
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        disabled={busy}
        onClick={() => startMutation(() => dismissLead(leadId))}
      >
        <X /> Dismiss
      </Button>
      {state.error ? <span className="text-xs text-destructive">{state.error}</span> : null}
    </div>
  );
}

// Keeps server-rendered lead lists fresh while background analyses run:
// promoted leads drop off and completions surface without a manual reload.
export function LeadsAutoRefresh({ intervalMs = 7000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
