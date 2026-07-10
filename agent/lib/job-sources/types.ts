// Shared shape every job-source adapter normalizes into. Persistence
// (upsert/sweep) lives in persist.ts; adapters only fetch and map.

export type JobSource = "adzuna" | "greenhouse" | "lever" | "ashby";

export interface SourcedLead {
  source: JobSource;
  externalId: string;
  company: string;
  roleTitle: string;
  url: string;
  location?: string;
  salaryRange?: string;
  description?: string;
  postedAt?: Date;
  expiresAt?: Date;
  // JSON scalars only, so it satisfies Prisma's InputJsonValue.
  metadata?: Record<string, string | number | boolean | null>;
}

// Source ids are stable, so the dedupe key needs no hashing.
export function dedupeKeyFor(lead: Pick<SourcedLead, "source" | "externalId">) {
  return `${lead.source}:${lead.externalId}`;
}

const MAX_DESCRIPTION = 6000;

// Handles both real HTML (Ashby) and entity-escaped HTML (Greenhouse content).
export function htmlToText(html: string): string {
  const unescaped = html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
  return unescaped
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function clampDescription(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  return trimmed.length > MAX_DESCRIPTION ? `${trimmed.slice(0, MAX_DESCRIPTION)}…` : trimmed;
}

// `label` keeps credentials (query-string API keys) out of error messages,
// which flow back into model context via tool output.
export async function fetchJson(url: string, label: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${label}: HTTP ${res.status} ${res.statusText}`);
  }
  return res.json();
}
