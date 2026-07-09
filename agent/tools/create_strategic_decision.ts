import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

const DECISION_TYPE_TO_PRISMA = {
  apply: "APPLY",
  pass: "PASS",
  tailor_resume: "TAILOR_RESUME",
  prioritize_project: "PRIORITIZE_PROJECT",
  accept_offer: "ACCEPT_OFFER",
  reject_offer: "REJECT_OFFER",
  project_focus: "PROJECT_FOCUS",
} as const;

export default defineTool({
  description:
    "Record a strategic career decision with its reasoning so it can be revisited later. Use when the user talks through and lands on a decision worth keeping. Confirm before saving.",
  inputSchema: z.object({
    decisionType: z.enum([
      "apply",
      "pass",
      "tailor_resume",
      "prioritize_project",
      "accept_offer",
      "reject_offer",
      "project_focus",
    ]),
    context: z.string().min(1).describe("The situation that forced the decision."),
    optionsConsidered: z
      .array(z.string())
      .default([])
      .describe("The options that were on the table."),
    decision: z.string().min(1).describe("What was decided."),
    reasoning: z.string().optional().describe("Why, in the user's own terms."),
    tradeoffs: z.string().optional().describe("What is being given up."),
    nextAction: z.string().optional().describe("The concrete next step."),
  }),
  async execute(input) {
    const user = await getUser();
    const decision = await prisma.strategicDecision.create({
      data: {
        userId: user.id,
        decisionType: DECISION_TYPE_TO_PRISMA[input.decisionType],
        context: input.context,
        optionsConsidered: input.optionsConsidered,
        decision: input.decision,
        reasoning: input.reasoning ?? null,
        tradeoffs: input.tradeoffs ?? null,
        nextAction: input.nextAction ?? null,
      },
    });
    return { saved: true, id: decision.id, decision: decision.decision };
  },
});
