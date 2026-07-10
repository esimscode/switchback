import Link from "next/link";
import { Radar } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { findExistingAnalysisIds, isAnalysisStale } from "@/lib/leads";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/user";
import type { JobLeadStatus } from "@/generated/prisma/enums";

import { LeadsAutoRefresh } from "./lead-actions";
import { LeadRow } from "./lead-row";

export const metadata = { title: "Job Leads" };
export const dynamic = "force-dynamic";

const TABS: { status: JobLeadStatus; label: string }[] = [
  { status: "REVIEWED", label: "Reviewed" },
  { status: "NEW", label: "New" },
  { status: "ANALYZING", label: "Analyzing" },
  { status: "PROMOTED", label: "Promoted" },
  { status: "DISMISSED", label: "Dismissed" },
];

const PAGE_SIZE = 50;

const EMPTY_COPY: Record<JobLeadStatus, string> = {
  REVIEWED: "No reviewed picks right now — the next sourcing run is Mon/Wed/Fri morning.",
  NEW: "Nothing awaiting triage. The strategist triages new leads on each sourcing run.",
  ANALYZING: "No background analyses in flight.",
  PROMOTED: "No leads promoted to a full analysis yet.",
  DISMISSED: "Nothing dismissed. Dismissed leads are cleared automatically once their posting expires.",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getUser();
  const params = await searchParams;
  const active: JobLeadStatus = TABS.some((t) => t.status === params.status)
    ? (params.status as JobLeadStatus)
    : "REVIEWED";

  const [leads, counts] = await Promise.all([
    prisma.jobLead.findMany({
      where: { userId: user.id, status: active },
      orderBy:
        active === "NEW"
          ? [{ postedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
          : [{ triageFit: "asc" }, { postedAt: { sort: "desc", nulls: "last" } }],
      take: PAGE_SIZE,
    }),
    prisma.jobLead.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    }),
  ]);

  const countFor = (status: JobLeadStatus) =>
    counts.find((c) => c.status === status)?._count ?? 0;
  const existingAnalyses = await findExistingAnalysisIds(user.id, leads);
  const hasAnalyzing = countFor("ANALYZING") > 0;

  return (
    <div className="flex flex-1 flex-col">
      {hasAnalyzing ? <LeadsAutoRefresh /> : null}
      <PageHeader
        title="Job Leads"
        description="Sourced Mon/Wed/Fri and triaged against your profile — only the honest picks survive."
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const count = countFor(tab.status);
            const isActive = tab.status === active;
            return (
              <Link
                key={tab.status}
                href={tab.status === "REVIEWED" ? "/leads" : `/leads?status=${tab.status}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  isActive
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-block-lime hover:text-black hover:border-transparent",
                )}
              >
                {tab.label}
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="px-1.5 py-0 text-xs"
                >
                  {count}
                </Badge>
              </Link>
            );
          })}
        </div>

        {leads.length === 0 ? (
          <p className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
            <Radar className="size-4" /> {EMPTY_COPY[active]}
          </p>
        ) : (
          <>
            <ul className="max-w-4xl space-y-5">
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  existingAnalysisId={existingAnalyses.get(lead.id)}
                  stale={isAnalysisStale(lead)}
                  showMeta
                />
              ))}
            </ul>
            {countFor(active) > PAGE_SIZE ? (
              <p className="text-xs text-muted-foreground">
                Showing the {PAGE_SIZE} most recent of {countFor(active)}. Stale leads are
                swept automatically, or ask the strategist to work through the backlog.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
