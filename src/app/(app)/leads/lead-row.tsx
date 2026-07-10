import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FitBadge } from "@/components/fit-badge";
import type { JobLead } from "@/generated/prisma/client";

import { LeadActions } from "./lead-actions";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

// One sourced lead: title + triage note in a bounded left column, fit pill
// top-right so the summary never runs beneath it.
export function LeadRow({
  lead,
  existingAnalysisId,
  stale,
  showMeta,
}: {
  lead: JobLead;
  existingAnalysisId?: string | null;
  stale?: boolean;
  /** Inbox view: show source · posted date under the summary. */
  showMeta?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <div className="min-w-0 flex-1">
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate underline-offset-4 hover:underline"
        >
          <span className="font-medium">{lead.company}</span>
          <span className="text-muted-foreground"> · {lead.roleTitle}</span>
        </a>
        {lead.triageSummary ? (
          <p className="mt-0.5 line-clamp-2 max-w-prose text-xs text-muted-foreground">
            {lead.triageSummary}
          </p>
        ) : null}
        {showMeta ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[
              lead.source,
              lead.postedAt ? `posted ${dateFormat.format(lead.postedAt)}` : null,
              lead.salaryRange,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
      </div>
      {lead.triageFit ? <FitBadge fit={lead.triageFit} className="shrink-0" /> : null}
    </li>
  );
}
