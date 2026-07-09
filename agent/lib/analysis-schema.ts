import { z } from "zod";

// Single source of truth for a structured job analysis. Used as the eve
// output schema by the /jobs/new server action and as the input schema of
// the create_job_analysis tool, so both paths persist the same shape.

export const fitClassifications = [
  "strong_fit",
  "stretch_fit",
  "bridge_role",
  "not_worth_it",
] as const;

export const resumeVersionTypes = [
  "master",
  "platform_devsecops",
  "cloud_infrastructure",
  "software_ai",
  "cybersecurity",
] as const;

export const jobAnalysisSchema = z.object({
  fitClassification: z
    .enum(fitClassifications)
    .describe("Honest fit classification for this role."),
  recommendedResumeVersion: z
    .enum(resumeVersionTypes)
    .describe("Which resume version to lead with."),
  resumeReasoning: z
    .string()
    .describe("One or two sentences: why this resume version fits, what to emphasize, what not to overclaim."),
  skillsToEmphasize: z
    .array(z.string())
    .describe("Skills from the profile that match this role. Never invented."),
  gaps: z
    .array(z.string())
    .describe("Candid gaps between the posting and the profile."),
  tailoredSummary: z
    .string()
    .describe("2-3 sentence first-person summary tailored to this role, following the tailor-resume rules."),
  interviewTalkingPoints: z
    .array(z.string())
    .describe("3-5 talking points connecting real experience to the role."),
  recommendation: z
    .string()
    .describe("Clear decision recommendation: apply / apply with tailoring / bridge option / skip — and why."),
  extractedJobDescription: z
    .string()
    .optional()
    .describe("Only when the posting was fetched from a URL: the extracted job description text, verbatim as posted."),
});

export type JobAnalysisResult = z.infer<typeof jobAnalysisSchema>;

// Prisma enum mappings (schema uses UPPER_SNAKE enums).
export const FIT_TO_PRISMA = {
  strong_fit: "STRONG_FIT",
  stretch_fit: "STRETCH_FIT",
  bridge_role: "BRIDGE_ROLE",
  not_worth_it: "NOT_WORTH_IT",
} as const;

export const RESUME_TYPE_TO_PRISMA = {
  master: "MASTER",
  platform_devsecops: "PLATFORM_DEVSECOPS",
  cloud_infrastructure: "CLOUD_INFRASTRUCTURE",
  software_ai: "SOFTWARE_AI",
  cybersecurity: "CYBERSECURITY",
} as const;
