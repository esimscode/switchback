"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  caseStudySchema,
  type CaseStudyDraft,
} from "../../../../agent/lib/case-study-schema";
import type { ProjectStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { createEveClient } from "@/lib/eve-client";
import { asStringArray } from "@/lib/labels";
import { getUser } from "@/lib/user";

function optional(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Compact, honest project context for agent prompts.
async function projectContext(projectId: string) {
  const user = await getUser();
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId, userId: user.id },
  });
  return {
    project,
    context: [
      `Project: ${project.name}`,
      `Status (honest label — cap all claims at this): ${project.status}`,
      project.summary ? `Summary: ${project.summary}` : "",
      project.problem ? `Problem: ${project.problem}` : "",
      project.solution ? `Solution: ${project.solution}` : "",
      `Stack: ${asStringArray(project.stack).join(", ") || "not recorded"}`,
      project.role ? `Role: ${project.role}` : "",
      project.careerSignal ? `Career signal: ${project.careerSignal}` : "",
      project.githubUrl ? `GitHub: ${project.githubUrl}` : "",
      project.portfolioUrl ? `Portfolio: ${project.portfolioUrl}` : "",
      project.nextMilestone ? `Current next milestone: ${project.nextMilestone}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export async function createProject(formData: FormData) {
  const user = await getUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      status: (optional(formData.get("status")) ?? "PLANNED") as ProjectStatus,
      summary: optional(formData.get("summary")),
    },
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const user = await getUser();

  await prisma.project.update({
    where: { id: projectId, userId: user.id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      status: (optional(formData.get("status")) ?? "PLANNED") as ProjectStatus,
      summary: optional(formData.get("summary")),
      problem: optional(formData.get("problem")),
      solution: optional(formData.get("solution")),
      stack: String(formData.get("stack") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      role: optional(formData.get("role")),
      careerSignal: optional(formData.get("careerSignal")),
      githubUrl: optional(formData.get("githubUrl")),
      portfolioUrl: optional(formData.get("portfolioUrl")),
      nextMilestone: optional(formData.get("nextMilestone")),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

export type GenerateState = { error?: string; done?: string };

export async function draftCaseStudy(
  projectId: string,
  _prev: GenerateState,
): Promise<GenerateState> {
  try {
    const { project, context } = await projectContext(projectId);
    const client = createEveClient();
    const response = await client.session().send<CaseStudyDraft>({
      message: [
        "Draft a portfolio case study for this project. Load the build-case-study",
        "skill and follow it. Load my career profile so the career signal matches",
        "my positioning. The status label caps every claim. Return structured output",
        "only — do not call create_project_case_study.",
        "",
        context,
      ].join("\n"),
      outputSchema: caseStudySchema,
    });
    const result = await response.result();
    if (!result.data) return { error: "No structured case study came back. Try again." };

    await prisma.caseStudy.create({
      data: {
        userId: project.userId,
        projectId: project.id,
        status: "DRAFT",
        ...result.data,
      },
    });
  } catch (error) {
    console.error("Case study draft failed:", error);
    return { error: "Case study generation failed. Is the agent runtime up?" };
  }

  revalidatePath(`/projects/${projectId}`);
  return { done: "Case study drafted." };
}

const milestoneSchema = z.object({
  nextMilestone: z
    .string()
    .describe("The smallest useful next milestone — one concrete, finishable step."),
  reasoning: z.string().describe("One or two sentences: why this step compounds career leverage now."),
});

export async function suggestNextMilestone(
  projectId: string,
  _prev: GenerateState,
): Promise<GenerateState> {
  try {
    const { project, context } = await projectContext(projectId);
    const client = createEveClient();
    const response = await client.session().send<z.infer<typeof milestoneSchema>>({
      message: [
        "Identify the smallest useful next milestone for this project — one concrete,",
        "finishable step that most increases its value as career proof. Load my career",
        "profile and consider my target roles. Return structured output only.",
        "",
        context,
      ].join("\n"),
      outputSchema: milestoneSchema,
    });
    const result = await response.result();
    if (!result.data) return { error: "No milestone came back. Try again." };

    await prisma.project.update({
      where: { id: project.id },
      data: { nextMilestone: result.data.nextMilestone },
    });
    await prisma.agentOutput.create({
      data: {
        userId: project.userId,
        outputType: "next_milestone",
        title: `Next milestone: ${project.name}`,
        content: `${result.data.nextMilestone}\n\nWhy: ${result.data.reasoning}`,
        relatedProjectId: project.id,
      },
    });
  } catch (error) {
    console.error("Milestone suggestion failed:", error);
    return { error: "Milestone suggestion failed. Is the agent runtime up?" };
  }

  revalidatePath(`/projects/${projectId}`);
  return { done: "Next milestone updated." };
}

const linkedInSchema = z.object({
  title: z.string().describe("Short internal label for this draft."),
  post: z.string().describe("The LinkedIn post text, ready to review and paste."),
});

export async function draftLinkedInPost(
  projectId: string,
  _prev: GenerateState,
): Promise<GenerateState> {
  try {
    const { project, context } = await projectContext(projectId);
    const client = createEveClient();
    const response = await client.session().send<z.infer<typeof linkedInSchema>>({
      message: [
        "Draft a LinkedIn post about this project. Load the create-linkedin-post",
        "skill and follow it exactly — my voice, honest status, no hype. Load my",
        "career profile first. Return structured output only.",
        "",
        context,
      ].join("\n"),
      outputSchema: linkedInSchema,
    });
    const result = await response.result();
    if (!result.data) return { error: "No post draft came back. Try again." };

    await prisma.agentOutput.create({
      data: {
        userId: project.userId,
        outputType: "linkedin_post",
        title: result.data.title,
        content: result.data.post,
        relatedProjectId: project.id,
      },
    });
  } catch (error) {
    console.error("LinkedIn draft failed:", error);
    return { error: "LinkedIn draft failed. Is the agent runtime up?" };
  }

  revalidatePath(`/projects/${projectId}`);
  return { done: "LinkedIn draft saved." };
}
