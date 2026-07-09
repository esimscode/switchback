import { defineTool } from "eve/tools";
import { z } from "zod";

import { caseStudySchema } from "../lib/case-study-schema";
import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Persist a case study draft for one of the user's projects. Follow the build-case-study skill first; the draft must respect the project's honest status label.",
  inputSchema: caseStudySchema.extend({
    projectId: z.string().min(1).describe("Id from list_projects."),
  }),
  async execute({ projectId, ...draft }) {
    const user = await getUser();
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: user.id },
      select: { id: true, name: true },
    });
    if (!project) {
      return { error: `No project found with id ${projectId}. Call list_projects first.` };
    }

    const caseStudy = await prisma.caseStudy.create({
      data: {
        userId: user.id,
        projectId: project.id,
        status: "DRAFT",
        ...draft,
      },
    });

    return {
      saved: true,
      id: caseStudy.id,
      title: caseStudy.title,
      status: "draft",
      viewAt: `/projects/${project.id}`,
    };
  },
});
