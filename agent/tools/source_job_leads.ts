import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";
import {
  fetchAdzunaLeads,
  fetchAshbyLeads,
  fetchGreenhouseLeads,
  fetchLeverLeads,
  sweepStaleLeads,
  upsertLeads,
  type SourcedLead,
} from "../lib/job-sources";

const NEW_LEADS_SHOWN = 25;

export default defineTool({
  description:
    "Fetch job postings from configured sources (Adzuna keyword search and/or Greenhouse/Lever/Ashby company boards), dedupe them into the job-lead inbox, and sweep stale leads. Re-fetched leads keep their status and triage; only genuinely new postings come back as NEW. Returns counts plus the new leads for triage.",
  inputSchema: z.object({
    adzunaQueries: z
      .array(
        z.object({
          what: z
            .string()
            .min(1)
            .describe(
              "Keyword search, e.g. 'platform engineer'. For remote roles put 'remote' in the keywords — the where param is strictly geographic and 'remote' there returns nothing.",
            ),
          where: z
            .string()
            .optional()
            .describe("Geographic filter only, e.g. 'Austin, TX'. Never 'remote'."),
          country: z
            .string()
            .length(2)
            .optional()
            .describe("Adzuna country code (us, gb, ca…). Default us."),
          maxDaysOld: z.number().int().positive().optional().describe("Only postings this recent"),
        }),
      )
      .optional()
      .describe("Adzuna keyword searches to run"),
    companyBoards: z
      .array(
        z.object({
          source: z.enum(["greenhouse", "lever", "ashby"]),
          board: z
            .string()
            .min(1)
            .describe("Board slug, e.g. 'vercel' for boards.greenhouse.io/vercel"),
          company: z.string().optional().describe("Display name if the slug isn't presentable"),
        }),
      )
      .optional()
      .describe("Watched-company job boards to fetch in full"),
    titleIncludes: z
      .array(z.string())
      .optional()
      .describe(
        "Case-insensitive keywords; a company-board posting is kept only if its title contains at least one. Adzuna results are already filtered by the search query.",
      ),
    sweepStale: z
      .boolean()
      .optional()
      .describe("Run the stale-lead hygiene sweep after upserting (default true)"),
  }),
  async execute(input) {
    const user = await getUser();
    const errors: string[] = [];
    const leads: SourcedLead[] = [];

    for (const query of input.adzunaQueries ?? []) {
      try {
        leads.push(...(await fetchAdzunaLeads(query)));
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    const keywords = (input.titleIncludes ?? []).map((k) => k.toLowerCase());
    for (const { source, board, company } of input.companyBoards ?? []) {
      try {
        const fetcher =
          source === "greenhouse"
            ? fetchGreenhouseLeads
            : source === "lever"
              ? fetchLeverLeads
              : fetchAshbyLeads;
        let boardLeads = await fetcher(board, { company });
        if (keywords.length) {
          boardLeads = boardLeads.filter((lead) =>
            keywords.some((k) => lead.roleTitle.toLowerCase().includes(k)),
          );
        }
        leads.push(...boardLeads);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    const { created, refreshed, createdIds } = await upsertLeads(user.id, leads);
    const swept = input.sweepStale === false ? 0 : await sweepStaleLeads(user.id);

    // Health signal: the UI reads the latest run as "last sourced"; a stale
    // one means runs are dying before this tool executes.
    await prisma.sourcingRun.create({
      data: {
        userId: user.id,
        fetched: leads.length,
        created,
        refreshed,
        swept,
        errors,
      },
    });
    if (errors.length > 0) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "sourcing_issues",
          title: `Job sourcing hit ${errors.length} source error${errors.length === 1 ? "" : "s"}`,
          href: "/leads",
        },
      });
    }

    const createdRows = createdIds.length
      ? await prisma.jobLead.findMany({
          where: { id: { in: createdIds.slice(0, NEW_LEADS_SHOWN) } },
          select: {
            id: true,
            source: true,
            company: true,
            roleTitle: true,
            location: true,
            salaryRange: true,
            url: true,
            postedAt: true,
          },
        })
      : [];

    return {
      fetched: leads.length,
      newLeads: created,
      refreshedLeads: refreshed,
      sweptStaleLeads: swept,
      errors,
      leadsForTriage: createdRows.map((row) => ({
        ...row,
        postedAt: row.postedAt?.toISOString() ?? null,
      })),
      note:
        created > NEW_LEADS_SHOWN
          ? `Showing ${NEW_LEADS_SHOWN} of ${created} new leads — use list_job_leads status=NEW for the rest.`
          : undefined,
    };
  },
});
