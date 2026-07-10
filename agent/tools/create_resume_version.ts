import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Create a new resume version for a role family the user is targeting (check list_resume_versions first — one version per family). Confirm the family name with the user before creating. Content is optional; never include experience the user hasn't confirmed.",
  inputSchema: z.object({
    roleFamily: z
      .string()
      .min(1)
      .max(60)
      .describe(
        "Short role-family name this version targets, e.g. \"Growth Marketing\" or \"Site Reliability\".",
      ),
    name: z
      .string()
      .max(120)
      .optional()
      .describe("Display name. Defaults to \"<roleFamily> Resume\"."),
    content: z
      .string()
      .optional()
      .describe("Optional starting markdown content, confirmed with the user."),
  }),
  async execute({ roleFamily, name, content }) {
    const user = await getUser();
    const family = roleFamily.trim();

    const existing = await prisma.resumeVersion.findFirst({
      where: {
        userId: user.id,
        roleFamily: { equals: family, mode: "insensitive" },
      },
      select: { id: true, name: true },
    });
    if (existing) {
      return {
        created: false,
        error: `A version for that role family already exists: "${existing.name}". Update it with update_resume_version instead.`,
        id: existing.id,
      };
    }

    const resume = await prisma.resumeVersion.create({
      data: {
        userId: user.id,
        roleFamily: family,
        name: name?.trim() || `${family} Resume`,
        content: content && content.trim().length > 0 ? content : null,
      },
    });
    return {
      created: true,
      id: resume.id,
      name: resume.name,
      roleFamily: resume.roleFamily,
      viewAt: `/resumes/${resume.id}`,
    };
  },
});
