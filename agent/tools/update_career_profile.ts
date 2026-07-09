import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Update fields of the user's career profile. Only pass fields that should change; everything else is left untouched. This overwrites stored positioning — always confirm the exact new wording with the user first.",
  inputSchema: z.object({
    primaryHeadline: z.string().optional(),
    corePositioning: z.string().optional(),
    coreStory: z.string().optional(),
    portfolioTagline: z.string().optional(),
    linkedinHeadline: z.string().optional(),
    targetRoles: z.array(z.string()).optional().describe("Full replacement list."),
    bridgeRoles: z.array(z.string()).optional().describe("Full replacement list."),
    skills: z.array(z.string()).optional().describe("Full replacement list."),
    credibilityRules: z.array(z.string()).optional().describe("Full replacement list."),
  }),
  async execute(input) {
    const user = await getUser();
    const data = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(data).length === 0) {
      return { error: "No fields to update were provided." };
    }
    await prisma.careerProfile.update({
      where: { userId: user.id },
      data,
    });
    return {
      updated: true,
      fields: Object.keys(data),
      viewAt: "/career-profile",
    };
  },
});
