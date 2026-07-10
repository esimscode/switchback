import { prisma } from "../db";
import { dedupeKeyFor, type SourcedLead } from "./types";

export interface UpsertResult {
  created: number;
  refreshed: number;
  createdIds: string[];
}

// Re-fetches refresh content and lastSeenAt but never touch status or triage —
// a DISMISSED lead must stay dismissed while the posting is still live, or the
// next sourcing run would resurrect it as NEW.
export async function upsertLeads(userId: string, leads: SourcedLead[]): Promise<UpsertResult> {
  const now = new Date();
  const result: UpsertResult = { created: 0, refreshed: 0, createdIds: [] };

  for (const lead of leads) {
    const dedupeKey = dedupeKeyFor(lead);
    const content = {
      company: lead.company,
      roleTitle: lead.roleTitle,
      url: lead.url,
      location: lead.location ?? null,
      salaryRange: lead.salaryRange ?? null,
      description: lead.description ?? null,
      postedAt: lead.postedAt ?? null,
      expiresAt: lead.expiresAt ?? null,
      metadata: lead.metadata ?? {},
    };

    const existing = await prisma.jobLead.findUnique({
      where: { userId_dedupeKey: { userId, dedupeKey } },
      select: { id: true },
    });

    if (existing) {
      await prisma.jobLead.update({
        where: { id: existing.id },
        data: { ...content, lastSeenAt: now },
      });
      result.refreshed += 1;
    } else {
      const created = await prisma.jobLead.create({
        data: {
          ...content,
          userId,
          dedupeKey,
          source: lead.source,
          externalId: lead.externalId,
          lastSeenAt: now,
        },
      });
      result.created += 1;
      result.createdIds.push(created.id);
    }
  }

  return result;
}

// Hygiene sweep: hard-delete non-promoted leads whose posting has expired or
// that no sourcing run has seen recently. Safe to delete DISMISSED leads here —
// a posting that stopped appearing at its source can't be re-fetched, so it
// won't resurface. Promoted leads are never swept; JobAnalysis is the durable
// record and the lead keeps its provenance.
export async function sweepStaleLeads(
  userId: string,
  opts: { maxUnseenDays?: number } = {},
): Promise<number> {
  const maxUnseenDays = opts.maxUnseenDays ?? 14;
  const now = new Date();
  const seenCutoff = new Date(now.getTime() - maxUnseenDays * 24 * 60 * 60 * 1000);

  const { count } = await prisma.jobLead.deleteMany({
    where: {
      userId,
      status: { not: "PROMOTED" },
      OR: [{ expiresAt: { lt: now } }, { lastSeenAt: { lt: seenCutoff } }],
    },
  });
  return count;
}
