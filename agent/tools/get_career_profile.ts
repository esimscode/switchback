import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Get the user's career profile: positioning, story, target and bridge roles, skills, credibility rules, and taglines. Load this before giving career advice.",
  inputSchema: z.object({}),
  async execute() {
    const user = await getUser();
    const profile = await prisma.careerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      return { error: "No career profile found. Seed data has not been loaded." };
    }
    return {
      name: user.name,
      location: user.location,
      primaryHeadline: profile.primaryHeadline,
      corePositioning: profile.corePositioning,
      coreStory: profile.coreStory,
      portfolioTagline: profile.portfolioTagline,
      linkedinHeadline: profile.linkedinHeadline,
      targetRoles: profile.targetRoles,
      bridgeRoles: profile.bridgeRoles,
      skills: profile.skills,
      credibilityRules: profile.credibilityRules,
    };
  },
});
