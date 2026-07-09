import { z } from "zod";

// Shared shape for a case study draft: eve output schema for the project
// page's server action, and the input schema of create_project_case_study.
export const caseStudySchema = z.object({
  title: z.string().min(1).describe("Case study title — the project name plus an angle, not clickbait."),
  problem: z.string().describe("The real situation that made the project worth doing."),
  solution: z.string().describe("What was actually built, in plain language."),
  stack: z.string().describe("Technologies genuinely used, comma-separated."),
  architecture: z.string().describe("How the pieces fit together, only as they exist today."),
  challenges: z.string().describe("Real difficulties and how they were handled."),
  outcome: z.string().describe("Honest current state, capped by the project's status label."),
  nextSteps: z.string().describe("What's genuinely planned next."),
  careerSignal: z.string().describe("What this project proves about the builder, tied to their target roles."),
});

export type CaseStudyDraft = z.infer<typeof caseStudySchema>;
