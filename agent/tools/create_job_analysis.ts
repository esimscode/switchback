import { defineTool } from "eve/tools";
import { z } from "zod";

import { FIT_TO_PRISMA, jobAnalysisSchema } from "../lib/analysis-schema";
import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Persist a completed job analysis to the user's workspace so it appears on the Job Analysis page. Call after producing an analysis the user wants to keep.",
  inputSchema: jobAnalysisSchema.extend({
    company: z.string().min(1),
    roleTitle: z.string().min(1),
    jobDescription: z.string().min(1).describe("The original job description text."),
    sourceUrl: z.string().optional(),
    salaryRange: z.string().optional(),
    location: z.string().optional(),
    jobLeadId: z
      .string()
      .optional()
      .describe("If this analysis came from a sourced job lead, its id — promotes the lead."),
  }),
  async execute(input) {
    const user = await getUser();
    const resumeVersion = await prisma.resumeVersion.findFirst({
      where: {
        userId: user.id,
        roleFamily: { equals: input.recommendedResumeVersion, mode: "insensitive" },
      },
    });

    const analysis = await prisma.jobAnalysis.create({
      data: {
        userId: user.id,
        company: input.company,
        roleTitle: input.roleTitle,
        jobDescription: input.jobDescription,
        sourceUrl: input.sourceUrl ?? null,
        salaryRange: input.salaryRange ?? null,
        location: input.location ?? null,
        fitClassification: FIT_TO_PRISMA[input.fitClassification],
        recommendedResumeVersionId: resumeVersion?.id ?? null,
        skillsToEmphasize: input.skillsToEmphasize,
        gaps: input.gaps,
        tailoredSummary: input.tailoredSummary,
        interviewTalkingPoints: input.interviewTalkingPoints,
        recommendation: [input.recommendation, input.resumeReasoning]
          .filter(Boolean)
          .join("\n\nResume choice: "),
      },
    });

    let leadPromoted = false;
    if (input.jobLeadId) {
      const { count } = await prisma.jobLead.updateMany({
        where: { id: input.jobLeadId, userId: user.id },
        data: { status: "PROMOTED", promotedJobAnalysisId: analysis.id },
      });
      leadPromoted = count === 1;
      if (leadPromoted) {
        // Lead analyses run in the background — surface completion in the bell.
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "analysis_ready",
            title: `Analysis ready: ${input.roleTitle} · ${input.company}`,
            href: `/jobs/${analysis.id}`,
          },
        });
      }
    }

    return {
      saved: true,
      id: analysis.id,
      viewAt: `/jobs/${analysis.id}`,
      ...(input.jobLeadId ? { leadPromoted } : {}),
    };
  },
});
