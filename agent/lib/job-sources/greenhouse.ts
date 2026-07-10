import { clampDescription, fetchJson, htmlToText, type SourcedLead } from "./types";

// Greenhouse public job-board API (no auth):
// https://developers.greenhouse.io/job-board.html

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  company_name?: string;
  location?: { name?: string };
  content?: string; // entity-escaped HTML
  first_published?: string;
  updated_at?: string;
}

export async function fetchGreenhouseLeads(
  board: string,
  opts: { company?: string } = {},
): Promise<SourcedLead[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`;
  const data = (await fetchJson(url, `greenhouse board "${board}"`)) as {
    jobs?: GreenhouseJob[];
  };

  return (data.jobs ?? []).map((job) => {
    const posted = job.first_published ?? job.updated_at;
    return {
      source: "greenhouse" as const,
      externalId: String(job.id),
      company: opts.company ?? job.company_name ?? board,
      roleTitle: job.title,
      url: job.absolute_url,
      location: job.location?.name,
      description: clampDescription(job.content ? htmlToText(job.content) : undefined),
      postedAt: posted ? new Date(posted) : undefined,
      metadata: { board },
    };
  });
}
