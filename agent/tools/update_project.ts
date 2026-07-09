import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

const projectStatuses = {
  planned: "PLANNED",
  in_progress: "IN_PROGRESS",
  prototype: "PROTOTYPE",
  implemented: "IMPLEMENTED",
  tested: "TESTED",
  deployed: "DEPLOYED",
  completed: "COMPLETED",
} as const;

export default defineTool({
  description:
    "Update an existing project — status, next milestone, summary, links, or career signal. Get the project id from list_projects. Only advance status when the user confirms the progress actually happened.",
  inputSchema: z.object({
    projectId: z.string().min(1).describe("Project id from list_projects."),
    status: z
      .enum([
        "planned",
        "in_progress",
        "prototype",
        "implemented",
        "tested",
        "deployed",
        "completed",
      ])
      .optional()
      .describe("New honest status, only if it changed."),
    summary: z.string().optional(),
    problem: z.string().optional(),
    solution: z.string().optional(),
    stack: z.array(z.string()).optional().describe("Full replacement list."),
    role: z.string().optional(),
    careerSignal: z.string().optional(),
    githubUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),
    nextMilestone: z
      .string()
      .optional()
      .describe("The next concrete step. Set when the old one is done or stale."),
  }),
  async execute({ projectId, status, stack, ...fields }) {
    const user = await getUser();
    const existing = await prisma.project.findUnique({
      where: { id: projectId, userId: user.id },
      select: { id: true },
    });
    if (!existing) {
      return { updated: false, error: "No project with that id." };
    }

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) data[key] = value;
    }
    if (status !== undefined) data.status = projectStatuses[status];
    if (stack !== undefined) data.stack = stack;

    if (Object.keys(data).length === 0) {
      return { updated: false, error: "No fields to update were provided." };
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
    });
    return {
      updated: true,
      id: project.id,
      name: project.name,
      viewAt: `/projects/${project.id}`,
    };
  },
});
