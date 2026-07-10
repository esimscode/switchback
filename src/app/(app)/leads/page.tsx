import Link from "next/link";
import { Radar } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import {
  describeSourcingHealth,
  findExistingAnalysisIds,
  getSourcingHealth,
  isAnalysisStale,
} from "@/lib/leads";
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
  const sourcingStatus = describeSourcingHealth(await getSourcingHealth(user.id));

  return (
    <div className="flex flex-1 flex-col">
      {hasAnalyzing ? <LeadsAutoRefresh /> : null}
      <PageHeader
        title="Job Leads"
        description={`Sourced Mon/Wed/Fri, triaged against your profile — ${sourcingStatus.text}`}
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
                  "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  isActive
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:border-transparent hover:bg-block-lime hover:text-black",
                )}
              >
                {tab.label}
                {/* On the lime hover ground the count must go black too — the
                    outline badge's own text color would stay white in dark mode. */}
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={cn(
                    "px-1.5 py-0 text-xs",
                    !isActive && "group-hover:border-black/30 group-hover:text-black",
                  )}
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
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  existingAnalysisId={existingAnalyses.get(lead.id)}
                  stale={isAnalysisStale(lead)}
                  showMeta
                  variant="card"
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
