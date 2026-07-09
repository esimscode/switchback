import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  FIT_TO_PRISMA,
  RESUME_TYPE_TO_PRISMA,
  fitClassifications,
  resumeVersionTypes,
} from "../lib/analysis-schema";
import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Create an application tracker entry for a role the user decided to pursue (or wants to save). Link it to a job analysis when one exists. Confirm with the user before creating.",
  inputSchema: z.object({
    company: z.string().min(1),
    roleTitle: z.string().min(1),
    roleFamily: z.string().optional(),
    jobAnalysisId: z
      .string()
      .optional()
      .describe("Id returned by create_job_analysis, when converting an analysis."),
    resumeVersion: z.enum(resumeVersionTypes).optional(),
    fitClassification: z.enum(fitClassifications).optional(),
    status: z
      .enum(["saved", "applied"])
      .default("saved")
      .describe("'saved' unless the user says they already applied."),
    link: z.string().optional(),
    salaryRange: z.string().optional(),
    notes: z.string().optional(),
    decisionReasoning: z
      .string()
      .optional()
      .describe("Why this role is worth pursuing, from the analysis or conversation."),
  }),
  async execute(input) {
    const user = await getUser();
    const resumeVersion = input.resumeVersion
      ? await prisma.resumeVersion.findUnique({
          where: {
            userId_type: {
              userId: user.id,
              type: RESUME_TYPE_TO_PRISMA[input.resumeVersion],
            },
          },
        })
      : null;

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        company: input.company,
        roleTitle: input.roleTitle,
        roleFamily: input.roleFamily ?? null,
        jobAnalysisId: input.jobAnalysisId ?? null,
        resumeVersionId: resumeVersion?.id ?? null,
        fitClassification: input.fitClassification
          ? FIT_TO_PRISMA[input.fitClassification]
          : null,
        status: input.status === "applied" ? "APPLIED" : "SAVED",
        dateApplied: input.status === "applied" ? new Date() : null,
        link: input.link ?? null,
        salaryRange: input.salaryRange ?? null,
        notes: input.notes ?? null,
        decisionReasoning: input.decisionReasoning ?? null,
      },
    });

    return {
      saved: true,
      id: application.id,
      status: application.status,
      viewAt: "/applications",
    };
  },
});
