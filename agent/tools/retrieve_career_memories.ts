import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export const memoryCategories = [
  "positioning",
  "preference",
  "constraint",
  "project",
  "resume_rule",
  "job_search_rule",
  "portfolio_rule",
  "interview_rule",
] as const;

export const MEMORY_CATEGORY_TO_PRISMA = {
  positioning: "POSITIONING",
  preference: "PREFERENCE",
  constraint: "CONSTRAINT",
  project: "PROJECT",
  resume_rule: "RESUME_RULE",
  job_search_rule: "JOB_SEARCH_RULE",
  portfolio_rule: "PORTFOLIO_RULE",
  interview_rule: "INTERVIEW_RULE",
} as const;

export default defineTool({
  description:
    "Retrieve the user's durable career memories: positioning rules, preferences, constraints, and strategy rules. Call at the start of a conversation before giving career advice.",
  inputSchema: z.object({
    category: z
      .enum(memoryCategories)
      .optional()
      .describe("Filter to one category; omit for all memories."),
  }),
  async execute({ category }) {
    const user = await getUser();
    const memories = await prisma.careerMemory.findMany({
      where: {
        userId: user.id,
        ...(category ? { category: MEMORY_CATEGORY_TO_PRISMA[category] } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: { key: true, value: true, category: true, confidence: true },
    });
    return { memories };
  },
});
