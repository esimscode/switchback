import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FitBadge } from "@/components/fit-badge";
import type { JobLead } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

import { LeadActions } from "./lead-actions";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

// One sourced lead. "row" is the dashboard's compact list form; "card" is the
// inbox grid tile. Both keep the title + triage note in a bounded column with
// the fit pill top-right so the summary never runs beneath it.
export function LeadRow({
  lead,
  existingAnalysisId,
  stale,
  showMeta,
  variant = "row",
}: {
  lead: JobLead;
  existingAnalysisId?: string | null;
  stale?: boolean;
  /** Inbox view: show source · posted date under the summary. */
  showMeta?: boolean;
  variant?: "row" | "card";
}) {
  const isCard = variant === "card";

  const title = (
    <a
      href={lead.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block underline-offset-4 hover:underline", !isCard && "truncate")}
    >
      <span className="font-medium">{lead.company}</span>
      <span className="text-muted-foreground"> · {lead.roleTitle}</span>
    </a>
  );

  const summary = lead.triageSummary ? (
    <p
      className={cn(
        "mt-0.5 max-w-prose text-xs text-muted-foreground",
        isCard ? "line-clamp-3" : "line-clamp-2",
      )}
    >
      {lead.triageSummary}
    </p>
  ) : null;

  const meta = showMeta ? (
    <p className="mt-0.5 text-xs text-muted-foreground">
      {[
        lead.source,
        lead.postedAt ? `posted ${dateFormat.format(lead.postedAt)}` : null,
        lead.salaryRange,
      ]
        .filter(Boolean)
        .join(" · ")}
    </p>
  ) : null;

  const actions = (
    <div className={cn("flex flex-wrap items-center gap-2", isCard ? "mt-auto pt-3" : "mt-1.5")}>
      <LeadActions
        leadId={lead.id}
        status={lead.status}
        stale={stale}
        existingAnalysisId={existingAnalysisId}
      />
      {lead.status === "PROMOTED" && lead.promotedJobAnalysisId ? (
        <Link
          href={`/jobs/${lead.promotedJobAnalysisId}`}
          className="inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
        >
          View analysis <ArrowRight className="size-3" />
        </Link>
      ) : null}
      {lead.location ? (
        <span className="truncate text-xs text-muted-foreground">{lead.location}</span>
      ) : null}
    </div>
  );

  if (isCard) {
    return (
      <li className="flex h-full flex-col rounded-[1.5rem] bg-card p-5 text-sm ring-1 ring-border">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">{title}</div>
          {lead.triageFit ? <FitBadge fit={lead.triageFit} className="shrink-0" /> : null}
        </div>
        {summary}
        {meta}
        {actions}
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 text-sm">
      <div className="min-w-0 flex-1">
        {title}
        {summary}
        {meta}
        {actions}
      </div>
      {lead.triageFit ? <FitBadge fit={lead.triageFit} className="shrink-0" /> : null}
    </li>
  );
}
