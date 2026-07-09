import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

const contentStatuses = {
  draft: "DRAFT",
  ready: "READY",
  published: "PUBLISHED",
} as const;

export default defineTool({
  description:
    "Write content to one of the user's resume versions (get ids from list_resume_versions). Overwrites the existing content, so show the user the new version and get their explicit confirmation before saving. Never include experience, metrics, or skills the user hasn't confirmed — the resume is the source of truth the strategist tailors from.",
  inputSchema: z.object({
    resumeVersionId: z
      .string()
      .min(1)
      .describe("Resume version id from list_resume_versions."),
    content: z
      .string()
      .min(1)
      .describe("Full markdown content for this version. Replaces what's there."),
    status: z
      .enum(["draft", "ready", "published"])
      .optional()
      .describe("Optionally update the content status."),
  }),
  async execute({ resumeVersionId, content, status }) {
    const user = await getUser();
    const existing = await prisma.resumeVersion.findUnique({
      where: { id: resumeVersionId, userId: user.id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return { updated: false, error: "No resume version with that id." };
    }

    const resume = await prisma.resumeVersion.update({
      where: { id: resumeVersionId },
      data: {
        content,
        ...(status ? { status: contentStatuses[status] } : {}),
      },
    });
    return {
      updated: true,
      id: resume.id,
      name: resume.name,
      viewAt: `/resumes/${resume.id}`,
    };
  },
});
