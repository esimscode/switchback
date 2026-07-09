import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "List the user's projects with honest status labels, summaries, stack, career signal, and next milestone. Use before advising on portfolio work or drafting project assets.",
  inputSchema: z.object({}),
  async execute() {
    const user = await getUser();
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        summary: true,
        problem: true,
        solution: true,
        stack: true,
        role: true,
        careerSignal: true,
        githubUrl: true,
        portfolioUrl: true,
        nextMilestone: true,
      },
    });
    return { projects };
  },
});
