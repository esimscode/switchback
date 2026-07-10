"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  FIT_TO_PRISMA,
  jobAnalysisSchema,
  type JobAnalysisResult,
} from "../../../../agent/lib/analysis-schema";
import { prisma } from "@/lib/db";
import { createEveClient } from "@/lib/eve-client";
import { getUser } from "@/lib/user";

function optional(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export type AnalyzeJobState = { error?: string };

export async function analyzeJob(
  _prev: AnalyzeJobState,
  formData: FormData,
): Promise<AnalyzeJobState> {
  const company = String(formData.get("company") ?? "").trim();
  const roleTitle = String(formData.get("roleTitle") ?? "").trim();
  const jobDescription = String(formData.get("jobDescription") ?? "").trim();
  const sourceUrl = optional(formData.get("sourceUrl"));
  const salaryRange = optional(formData.get("salaryRange"));
  const location = optional(formData.get("location"));

  if (!company || !roleTitle) {
    return { error: "Company and role title are required." };
  }
  if (!jobDescription && !sourceUrl) {
    return { error: "Paste a job description, or provide a posting URL for the strategist to fetch." };
  }

  const user = await getUser();

  let analysis: JobAnalysisResult;
  try {
    const client = createEveClient();
    const session = client.session();
    const response = await session.send<JobAnalysisResult>({
      message: [
        "Analyze this job posting for me. Load the analyze-job skill and follow it:",
        "use get_career_profile and list_resume_versions, classify fit honestly,",
        "and never claim skills outside my profile.",
        "Do NOT call create_job_analysis — return the analysis as structured output only.",
        "",
        `Company: ${company}`,
        `Role: ${roleTitle}`,
        location ? `Location: ${location}` : "",
        salaryRange ? `Salary range: ${salaryRange}` : "",
        "",
        jobDescription
          ? `Job description:\n${jobDescription}`
          : `No description was pasted. Fetch the posting from this URL with your web tools, extract the job description text, analyze it, and include the extracted text verbatim in extractedJobDescription: ${sourceUrl}`,
      ]
        .filter((line) => line !== "")
        .join("\n"),
      outputSchema: jobAnalysisSchema,
    });
    const result = await response.result();
    if (!result.data) {
      return { error: "The strategist did not return a structured analysis. Try again." };
    }
    analysis = result.data;
  } catch (error) {
    console.error("Job analysis failed:", error);
    return { error: "Analysis failed. Check that the agent runtime is running and try again." };
  }

  const resumeVersion = await prisma.resumeVersion.findFirst({
    where: {
      userId: user.id,
      roleFamily: { equals: analysis.recommendedResumeVersion, mode: "insensitive" },
    },
  });

  const finalDescription =
    jobDescription || analysis.extractedJobDescription?.trim() || "";
  if (!finalDescription) {
    return {
      error:
        "The strategist couldn't extract a job description from that URL (some job boards block fetching). Paste the description instead.",
    };
  }

  const saved = await prisma.jobAnalysis.create({
    data: {
      userId: user.id,
      company,
      roleTitle,
      jobDescription: finalDescription,
      sourceUrl,
      salaryRange,
      location,
      fitClassification: FIT_TO_PRISMA[analysis.fitClassification],
      recommendedResumeVersionId: resumeVersion?.id ?? null,
      skillsToEmphasize: analysis.skillsToEmphasize,
      gaps: analysis.gaps,
      tailoredSummary: analysis.tailoredSummary,
      interviewTalkingPoints: analysis.interviewTalkingPoints,
      recommendation: `${analysis.recommendation}\n\nResume choice: ${analysis.resumeReasoning}`,
    },
  });

  revalidatePath("/jobs");
  redirect(`/jobs/${saved.id}`);
}

export async function createApplicationFromAnalysis(analysisId: string) {
  const user = await getUser();
  const analysis = await prisma.jobAnalysis.findUniqueOrThrow({
    where: { id: analysisId, userId: user.id },
  });

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      company: analysis.company,
      roleTitle: analysis.roleTitle,
      jobAnalysisId: analysis.id,
      resumeVersionId: analysis.recommendedResumeVersionId,
      fitClassification: analysis.fitClassification,
      salaryRange: analysis.salaryRange,
      link: analysis.sourceUrl,
      status: "SAVED",
      decisionReasoning: analysis.recommendation,
    },
  });

  revalidatePath("/applications");
  redirect(`/applications?created=${application.id}`);
}
