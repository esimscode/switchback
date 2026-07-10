import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

const DESCRIPTION_PREVIEW = 1500;

export default defineTool({
  description:
    "List job leads from the sourcing inbox, optionally filtered by status. NEW leads are awaiting triage; use update_job_leads to record triage results or dismiss, and create_job_analysis (with jobLeadId) to promote one into a full analysis.",
  inputSchema: z.object({
    status: z.enum(["NEW", "REVIEWED", "DISMISSED", "PROMOTED"]).optional(),
    limit: z.number().int().positive().max(100).optional().describe("Default 50"),
  }),
  async execute(input) {
    const user = await getUser();
    const leads = await prisma.jobLead.findMany({
      where: { userId: user.id, ...(input.status ? { status: input.status } : {}) },
      orderBy: [{ postedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: input.limit ?? 50,
    });

    return {
      count: leads.length,
      leads: leads.map((lead) => ({
        id: lead.id,
        source: lead.source,
        company: lead.company,
        roleTitle: lead.roleTitle,
        location: lead.location,
        salaryRange: lead.salaryRange,
        url: lead.url,
        status: lead.status,
        triageFit: lead.triageFit,
        triageSummary: lead.triageSummary,
        postedAt: lead.postedAt?.toISOString() ?? null,
        lastSeenAt: lead.lastSeenAt.toISOString(),
        description:
          lead.description && lead.description.length > DESCRIPTION_PREVIEW
            ? `${lead.description.slice(0, DESCRIPTION_PREVIEW)}…`
            : lead.description,
      })),
    };
  },
});
