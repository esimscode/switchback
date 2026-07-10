import { clampDescription, fetchJson, htmlToText, type SourcedLead } from "./types";

// Ashby public job-posting API (no auth):
// https://developers.ashbyhq.com/docs/public-job-posting-api

interface AshbyJob {
  id: string;
  title: string;
  jobUrl: string;
  applyUrl?: string;
  location?: string;
  secondaryLocations?: { location?: string }[];
  isListed?: boolean;
  isRemote?: boolean;
  workplaceType?: string;
  employmentType?: string;
  department?: string;
  team?: string;
  publishedAt?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  compensation?: { compensationTierSummary?: string };
}

export async function fetchAshbyLeads(
  board: string,
  opts: { company?: string } = {},
): Promise<SourcedLead[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}?includeCompensation=true`;
  const data = (await fetchJson(url, `ashby board "${board}"`)) as { jobs?: AshbyJob[] };

  return (data.jobs ?? [])
    .filter((job) => job.isListed !== false)
    .map((job) => {
      const locations = [
        job.location,
        ...(job.secondaryLocations ?? []).map((l) => l.location),
      ].filter(Boolean);
      const description =
        job.descriptionPlain ?? (job.descriptionHtml ? htmlToText(job.descriptionHtml) : undefined);
      return {
        source: "ashby" as const,
        externalId: job.id,
        company: opts.company ?? board,
        roleTitle: job.title,
        url: job.jobUrl ?? job.applyUrl ?? `https://jobs.ashbyhq.com/${board}/${job.id}`,
        location: locations.length ? locations.join("; ") : undefined,
        salaryRange: job.compensation?.compensationTierSummary,
        description: clampDescription(description),
        postedAt: job.publishedAt ? new Date(job.publishedAt) : undefined,
        metadata: {
          board,
          isRemote: job.isRemote ?? null,
          workplaceType: job.workplaceType ?? null,
          employmentType: job.employmentType ?? null,
          team: job.team ?? job.department ?? null,
        },
      };
    });
}
