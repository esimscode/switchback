import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Update one or more job leads in a single call: record triage results (fit + one-line reasoning), mark reviewed, or dismiss. Use this after triaging sourced leads against the career profile. To promote a lead into a full analysis, call create_job_analysis with jobLeadId instead.",
  inputSchema: z.object({
    updates: z
      .array(
        z.object({
          id: z.string().min(1),
          status: z
            .enum(["NEW", "REVIEWED", "DISMISSED"])
            .optional()
            .describe("Lifecycle move; promotion happens via create_job_analysis"),
          triageFit: z
            .enum(["STRONG_FIT", "STRETCH_FIT", "BRIDGE_ROLE", "NOT_WORTH_IT"])
            .optional(),
          triageSummary: z
            .string()
            .optional()
            .describe("One line: why this fit call, grounded in the profile"),
        }),
      )
      .min(1),
  }),
  async execute(input) {
    const user = await getUser();
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const update of input.updates) {
      const { count } = await prisma.jobLead.updateMany({
        where: { id: update.id, userId: user.id },
        data: {
          ...(update.status ? { status: update.status } : {}),
          ...(update.triageFit ? { triageFit: update.triageFit } : {}),
          ...(update.triageSummary !== undefined ? { triageSummary: update.triageSummary } : {}),
        },
      });
      results.push(
        count === 1 ? { id: update.id, ok: true } : { id: update.id, ok: false, error: "not found" },
      );
    }

    // Triage that produced new picks is a background event worth surfacing.
    const reviewed = input.updates.filter(
      (u, i) => u.status === "REVIEWED" && results[i].ok,
    ).length;
    if (reviewed > 0) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "leads_reviewed",
          title: `${reviewed} new job pick${reviewed === 1 ? "" : "s"} to review`,
          href: "/leads",
        },
      });
    }

    return { updated: results.filter((r) => r.ok).length, results };
  },
});
