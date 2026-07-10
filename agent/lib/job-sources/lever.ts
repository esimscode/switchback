import { clampDescription, fetchJson, type SourcedLead } from "./types";

// Lever public postings API (no auth):
// https://github.com/lever/postings-api

interface LeverPosting {
  id: string;
  text: string; // role title
  hostedUrl: string;
  createdAt?: number; // epoch ms
  descriptionPlain?: string;
  categories?: {
    location?: string;
    allLocations?: string[];
    commitment?: string;
    team?: string;
    department?: string;
  };
  workplaceType?: string;
  salaryRange?: { min?: number; max?: number; currency?: string; interval?: string };
}

function formatSalary(range: LeverPosting["salaryRange"]): string | undefined {
  if (!range || (!range.min && !range.max)) return undefined;
  const fmt = (n: number) => n.toLocaleString("en-US");
  const span =
    range.min && range.max && range.min !== range.max
      ? `${fmt(range.min)}–${fmt(range.max)}`
      : fmt((range.min ?? range.max)!);
  const currency = range.currency ? `${range.currency} ` : "";
  const interval = range.interval ? ` per ${range.interval.replace(/-/g, " ").toLowerCase()}` : "";
  return `${currency}${span}${interval}`;
}

export async function fetchLeverLeads(
  site: string,
  opts: { company?: string } = {},
): Promise<SourcedLead[]> {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`;
  const data = await fetchJson(url, `lever board "${site}"`);

  // Unknown boards return { ok: false, error } instead of an array.
  if (!Array.isArray(data)) {
    const message =
      data && typeof data === "object" && "error" in data ? String(data.error) : "unexpected response";
    throw new Error(`lever board "${site}": ${message}`);
  }

  return (data as LeverPosting[]).map((posting) => ({
    source: "lever" as const,
    externalId: posting.id,
    company: opts.company ?? site,
    roleTitle: posting.text,
    url: posting.hostedUrl,
    location:
      posting.categories?.allLocations?.join("; ") ?? posting.categories?.location ?? undefined,
    salaryRange: formatSalary(posting.salaryRange),
    description: clampDescription(posting.descriptionPlain),
    postedAt: posting.createdAt ? new Date(posting.createdAt) : undefined,
    metadata: {
      board: site,
      commitment: posting.categories?.commitment ?? null,
      team: posting.categories?.team ?? posting.categories?.department ?? null,
      workplaceType: posting.workplaceType ?? null,
    },
  }));
}
