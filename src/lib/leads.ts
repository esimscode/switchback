import "server-only";

import { prisma } from "@/lib/db";
import type { JobLeadStatus } from "@/generated/prisma/enums";

// A lead stuck in ANALYZING longer than this is treated as a failed background
// run and offered a retry. Full analyses (including a sandbox fetch of the
// posting) run minutes, not tens of minutes.
export const ANALYZING_STALE_MINUTES = 15;

export function isAnalysisStale(lead: { status: JobLeadStatus; updatedAt: Date }): boolean {
  return (
    lead.status === "ANALYZING" &&
    Date.now() - lead.updatedAt.getTime() > ANALYZING_STALE_MINUTES * 60 * 1000
  );
}

// Maps lead id → existing JobAnalysis id for leads whose company + role were
// already analyzed (via promotion or a manual /jobs/new run), so the UI can
// guard against accidental duplicate analyses.
export async function findExistingAnalysisIds(
  userId: string,
  leads: { id: string; company: string; roleTitle: string; promotedJobAnalysisId: string | null }[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unpromoted = leads.filter((l) => !l.promotedJobAnalysisId);
  const analyses = unpromoted.length
    ? await prisma.jobAnalysis.findMany({
        where: {
          userId,
          OR: unpromoted.map((l) => ({
            company: { equals: l.company, mode: "insensitive" as const },
            roleTitle: { equals: l.roleTitle, mode: "insensitive" as const },
          })),
        },
        select: { id: true, company: true, roleTitle: true },
      })
    : [];
  for (const lead of leads) {
    if (lead.promotedJobAnalysisId) {
      map.set(lead.id, lead.promotedJobAnalysisId);
      continue;
    }
    const match = analyses.find(
      (a) =>
        a.company.toLowerCase() === lead.company.toLowerCase() &&
        a.roleTitle.toLowerCase() === lead.roleTitle.toLowerCase(),
    );
    if (match) map.set(lead.id, match.id);
  }
  return map;
}
