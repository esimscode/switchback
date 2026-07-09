import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

const reflectionTypes = {
  weekly_checkin: "WEEKLY_CHECKIN",
  decision: "DECISION",
  blocker: "BLOCKER",
  opportunity: "OPPORTUNITY",
  project_note: "PROJECT_NOTE",
  interview_reflection: "INTERVIEW_REFLECTION",
  application_reflection: "APPLICATION_REFLECTION",
} as const;

export default defineTool({
  description:
    "Save a career reflection to the user's reflection log. Use when the user shares a decision, blocker, opportunity, weekly check-in, or a thought worth keeping. Confirm with the user first unless they explicitly asked to log it.",
  inputSchema: z.object({
    reflectionType: z
      .enum([
        "weekly_checkin",
        "decision",
        "blocker",
        "opportunity",
        "project_note",
        "interview_reflection",
        "application_reflection",
      ])
      .describe("The kind of reflection being saved."),
    title: z.string().min(1).max(200).describe("Short, specific title."),
    body: z
      .string()
      .min(1)
      .describe("The reflection content, in the user's own framing."),
    mood: z
      .string()
      .max(50)
      .optional()
      .describe("Optional one-word mood, only if the user expressed one."),
    relatedProjectId: z
      .string()
      .optional()
      .describe("Link to a project (id from list_projects) when the reflection is about one."),
    relatedApplicationId: z
      .string()
      .optional()
      .describe("Link to an application when the reflection is about one."),
  }),
  async execute({ reflectionType, title, body, mood, relatedProjectId, relatedApplicationId }) {
    const user = await getUser();
    const reflection = await prisma.careerReflection.create({
      data: {
        userId: user.id,
        reflectionType: reflectionTypes[reflectionType],
        title,
        body,
        mood: mood ?? null,
        relatedProjectId: relatedProjectId ?? null,
        relatedApplicationId: relatedApplicationId ?? null,
      },
    });
    return {
      saved: true,
      id: reflection.id,
      title: reflection.title,
      reflectionType,
      viewAt: "/reflections",
    };
  },
});
