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

// Mirrors the cron in agent/schedules/job-sourcing.md ("0 13 * * 1,3,5").
// Vercel Hobby crons drift up to an hour and a run takes a few minutes, so a
// tick only counts as missed once the grace window is past with no run since.
const SOURCING_DAYS_UTC = [1, 3, 5];
const SOURCING_HOUR_UTC = 13;
const SOURCING_GRACE_MS = 2 * 60 * 60 * 1000;

export function previousSourcingTick(now: Date = new Date()): Date {
  const tick = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), SOURCING_HOUR_UTC),
  );
  while (tick > now || !SOURCING_DAYS_UTC.includes(tick.getUTCDay())) {
    tick.setUTCDate(tick.getUTCDate() - 1);
  }
  return tick;
}

export type SourcingHealth = {
  lastRunAt: Date;
  fetched: number;
  created: number;
  errorCount: number;
  missedTick: Date | null;
} | null;

export async function getSourcingHealth(userId: string): Promise<SourcingHealth> {
  const run = await prisma.sourcingRun.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, fetched: true, created: true, errors: true },
  });
  if (!run) return null;
  const tick = previousSourcingTick();
  const missed = run.createdAt < tick && Date.now() - tick.getTime() > SOURCING_GRACE_MS;
  return {
    lastRunAt: run.createdAt,
    fetched: run.fetched,
    created: run.created,
    errorCount: Array.isArray(run.errors) ? run.errors.length : 0,
    missedTick: missed ? tick : null,
  };
}

const runFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Chicago",
});

const tickDayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "America/Chicago",
});

export function describeSourcingHealth(health: SourcingHealth): {
  text: string;
  warning: boolean;
} {
  if (!health) {
    return { text: "no runs yet — first run Mon/Wed/Fri ~8 AM", warning: false };
  }
  if (health.missedTick) {
    return {
      text: `${tickDayFormat.format(health.missedTick)} morning run never fired — last run ${runFormat.format(health.lastRunAt)}`,
      warning: true,
    };
  }
  const base = `last run ${runFormat.format(health.lastRunAt)} · ${health.fetched} fetched · ${health.created} new`;
  return health.errorCount > 0
    ? { text: `${base} · ${health.errorCount} source error${health.errorCount === 1 ? "" : "s"}`, warning: true }
    : { text: base, warning: false };
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
