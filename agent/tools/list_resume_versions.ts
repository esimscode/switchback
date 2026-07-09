import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "List the user's resume versions (name, focus type, status). Pass includeContent: true to also get each version's markdown content — do this when tailoring or reviewing an actual resume.",
  inputSchema: z.object({
    includeContent: z
      .boolean()
      .default(false)
      .describe("Include the full markdown content of each version."),
  }),
  async execute({ includeContent }) {
    const user = await getUser();
    const versions = await prisma.resumeVersion.findMany({
      where: { userId: user.id },
      orderBy: { type: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        ...(includeContent ? { content: true } : {}),
      },
    });
    return {
      resumeVersions: versions.map((version) => ({
        ...version,
        ...(includeContent
          ? {
              content:
                version.content ??
                "(empty — the user has not added content yet)",
            }
          : {}),
      })),
    };
  },
});
