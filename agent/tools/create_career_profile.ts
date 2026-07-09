import { defineTool } from "eve/tools";
import { z } from "zod";

import { prisma } from "../lib/db";
import { memoryCategories, MEMORY_CATEGORY_TO_PRISMA } from "./retrieve_career_memories";

const RESUME_VERSIONS = [
  { name: "Master Resume", type: "MASTER" },
  { name: "Platform-DevSecOps Resume", type: "PLATFORM_DEVSECOPS" },
  { name: "Cloud-Infrastructure Resume", type: "CLOUD_INFRASTRUCTURE" },
  { name: "Software-AI Automation Resume", type: "SOFTWARE_AI" },
  { name: "Cybersecurity Resume", type: "CYBERSECURITY" },
] as const;

export default defineTool({
  description:
    "Create the workspace's initial user and career profile during onboarding. Only call after the user confirmed the profile summary. Fails if a profile already exists — this is a single-user workspace.",
  inputSchema: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    location: z.string().optional(),
    primaryHeadline: z.string().min(1).describe("Short professional headline in their words."),
    corePositioning: z.string().min(1).describe("2-3 sentences of who they are professionally. Only confirmed facts."),
    coreStory: z.string().min(1).describe("1-2 sentences: where they've been, where they're heading — framed as specializing, never starting over."),
    portfolioTagline: z.string().optional(),
    targetRoles: z.array(z.string()).min(1),
    bridgeRoles: z.array(z.string()).default([]),
    skills: z.array(z.string()).min(1).describe("Only skills the user stated or confirmed."),
    credibilityRules: z
      .array(z.string())
      .default([])
      .describe("What must never be overclaimed for this user, plus any rules they set."),
    memories: z
      .array(
        z.object({
          key: z.string().min(1).max(100).describe("kebab-case identifier"),
          value: z.string().min(1),
          category: z.enum(memoryCategories),
        }),
      )
      .default([])
      .describe("Durable constraints/preferences surfaced during onboarding."),
  }),
  async execute(input) {
    const existing = await prisma.user.count();
    if (existing > 0) {
      return {
        error:
          "A profile already exists — this is a single-user workspace. Edit it at /career-profile instead.",
      };
    }

    const baseRules = [
      "Do not invent experience.",
      "Do not invent metrics.",
      "Do not claim projects are complete when they are not.",
      "Use honest status labels: Planned, In Progress, Prototype, Implemented, Tested, Deployed, Completed.",
      "Frame career changes as specializing and compounding — never as starting over.",
    ];
    const credibilityRules = [
      ...baseRules,
      ...input.credibilityRules.filter((rule) => !baseRules.includes(rule)),
    ];

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        location: input.location ?? null,
        careerProfile: {
          create: {
            primaryHeadline: input.primaryHeadline,
            corePositioning: input.corePositioning,
            coreStory: input.coreStory,
            portfolioTagline: input.portfolioTagline ?? null,
            targetRoles: input.targetRoles,
            bridgeRoles: input.bridgeRoles,
            skills: input.skills,
            credibilityRules,
          },
        },
        resumeVersions: {
          create: RESUME_VERSIONS.map((rv) => ({ name: rv.name, type: rv.type })),
        },
        careerMemories: {
          create: input.memories.map((memory) => ({
            key: memory.key,
            value: memory.value,
            category: MEMORY_CATEGORY_TO_PRISMA[memory.category],
            source: "onboarding",
            confidence: "high",
          })),
        },
      },
    });

    return {
      created: true,
      userId: user.id,
      resumeVersions: RESUME_VERSIONS.length,
      memories: input.memories.length,
      next: "The workspace is ready at /dashboard.",
    };
  },
});
