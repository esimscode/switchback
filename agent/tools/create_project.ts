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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default defineTool({
  description:
    "Create a new project in the user's project portfolio. Use when the user describes work worth tracking as career proof. Use honest status labels — never claim more progress than the user has confirmed. Confirm the details with the user before creating.",
  inputSchema: z.object({
    name: z.string().min(1).max(120).describe("Project name."),
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
      .describe("Honest status — only what the user has confirmed."),
    summary: z.string().optional().describe("One-paragraph description."),
    problem: z.string().optional().describe("The problem it addresses."),
    solution: z.string().optional().describe("How it solves the problem."),
    stack: z
      .array(z.string())
      .default([])
      .describe("Technologies actually used."),
    role: z.string().optional().describe("The user's role on the project."),
    careerSignal: z
      .string()
      .optional()
      .describe("What this project proves about the user's capabilities."),
    githubUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),
    nextMilestone: z
      .string()
      .optional()
      .describe("The next concrete step that moves this project forward."),
  }),
  async execute(input) {
    const user = await getUser();
    const baseSlug = slugify(input.name) || "project";
    const taken = await prisma.project.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    });
    const takenSlugs = new Set(taken.map((p) => p.slug));
    let slug = baseSlug;
    for (let i = 2; takenSlugs.has(slug); i += 1) {
      slug = `${baseSlug}-${i}`;
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: input.name,
        slug,
        status: projectStatuses[input.status],
        summary: input.summary ?? null,
        problem: input.problem ?? null,
        solution: input.solution ?? null,
        stack: input.stack,
        role: input.role ?? null,
        careerSignal: input.careerSignal ?? null,
        githubUrl: input.githubUrl ?? null,
        portfolioUrl: input.portfolioUrl ?? null,
        nextMilestone: input.nextMilestone ?? null,
      },
    });
    return {
      created: true,
      id: project.id,
      name: project.name,
      status: input.status,
      viewAt: `/projects/${project.id}`,
    };
  },
});
