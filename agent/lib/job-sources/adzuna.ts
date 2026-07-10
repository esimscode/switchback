import { clampDescription, fetchJson, htmlToText, type SourcedLead } from "./types";

// Adzuna job-search API: https://developer.adzuna.com/docs/search
// Credentials come from ADZUNA_APP_ID / ADZUNA_APP_KEY.

export interface AdzunaQuery {
  what: string;
  where?: string;
  /** Two-letter Adzuna country code (us, gb, ca, au, …). Default "us". */
  country?: string;
  maxDaysOld?: number;
  /** Max 50 (Adzuna's page-size cap). Default 50. */
  resultsPerPage?: number;
}

interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  redirect_url: string;
  created?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  category?: { label?: string };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_type?: string;
  contract_time?: string;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  us: "$",
  ca: "CA$",
  au: "AU$",
  nz: "NZ$",
  sg: "S$",
  gb: "£",
  at: "€",
  be: "€",
  de: "€",
  es: "€",
  fr: "€",
  it: "€",
  nl: "€",
  in: "₹",
  br: "R$",
  mx: "MX$",
  za: "R",
  pl: "zł",
  ch: "CHF",
};

function formatSalary(job: AdzunaJob, country: string): string | undefined {
  const min = job.salary_min ? Math.round(job.salary_min) : undefined;
  const max = job.salary_max ? Math.round(job.salary_max) : undefined;
  if (!min && !max) return undefined;
  const symbol = CURRENCY_SYMBOL[country] ?? "";
  const fmt = (n: number) => `${symbol}${n.toLocaleString("en-US")}`;
  const range = min && max && min !== max ? `${fmt(min)}–${fmt(max)}` : fmt((min ?? max)!);
  return job.salary_is_predicted === "1" ? `${range} (estimated)` : range;
}

export async function fetchAdzunaLeads(query: AdzunaQuery): Promise<SourcedLead[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Adzuna credentials missing — set ADZUNA_APP_ID and ADZUNA_APP_KEY.");
  }

  const country = (query.country ?? "us").toLowerCase();
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: query.what,
    results_per_page: String(Math.min(query.resultsPerPage ?? 50, 50)),
    sort_by: "date",
  });
  if (query.where) params.set("where", query.where);
  if (query.maxDaysOld) params.set("max_days_old", String(query.maxDaysOld));

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`;
  const data = (await fetchJson(url, `adzuna search "${query.what}" (${country})`)) as {
    results?: AdzunaJob[];
  };

  return (data.results ?? []).map((job) => ({
    source: "adzuna" as const,
    externalId: String(job.id),
    company: job.company?.display_name ?? "Unknown company",
    roleTitle: job.title,
    url: job.redirect_url,
    location: job.location?.display_name,
    salaryRange: formatSalary(job, country),
    description: clampDescription(job.description ? htmlToText(job.description) : undefined),
    postedAt: job.created ? new Date(job.created) : undefined,
    metadata: {
      category: job.category?.label ?? null,
      contractType: job.contract_type ?? null,
      contractTime: job.contract_time ?? null,
      query: query.what,
    },
  }));
}
