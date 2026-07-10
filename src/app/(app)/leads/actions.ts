"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { createEveClient } from "@/lib/eve-client";
import { getUser } from "@/lib/user";

function revalidateLeadViews() {
  revalidatePath("/dashboard");
  revalidatePath("/leads");
}

export async function dismissLead(leadId: string) {
  const user = await getUser();
  await prisma.jobLead.updateMany({
    where: { id: leadId, userId: user.id },
    data: { status: "DISMISSED" },
  });
  revalidateLeadViews();
}

export async function restoreLead(leadId: string) {
  const user = await getUser();
  await prisma.jobLead.updateMany({
    where: { id: leadId, userId: user.id, status: "DISMISSED" },
    data: { status: "REVIEWED" },
  });
  revalidateLeadViews();
}

export type AnalyzeLeadState = { error?: string };

// Promotion path of the sourcing loop, run in the background: mark the lead
// ANALYZING and hand the whole job to the eve runtime, which executes the
// session durably whether or not anyone is watching. The agent persists the
// result itself via create_job_analysis (jobLeadId promotes the lead and
// writes an "analysis ready" notification), so nothing here waits on the
// multi-minute analysis.
//
// `force` re-analyzes a job that already has an analysis (same company +
// role); the UI requires an explicit confirmation before sending it.
export async function analyzeLead(
  leadId: string,
  force: boolean,
  _prev: AnalyzeLeadState,
): Promise<AnalyzeLeadState> {
  const user = await getUser();
  const lead = await prisma.jobLead.findUnique({
    where: { id: leadId, userId: user.id },
  });
  if (!lead) return { error: "Lead not found." };
  if (lead.status === "PROMOTED") return { error: "Already analyzed." };

  if (!force) {
    const existing = await prisma.jobAnalysis.findFirst({
      where: {
        userId: user.id,
        company: { equals: lead.company, mode: "insensitive" },
        roleTitle: { equals: lead.roleTitle, mode: "insensitive" },
      },
      select: { id: true },
    });
    if (existing) {
      return { error: "This job already has an analysis — confirm to analyze again." };
    }
  }

  try {
    const client = createEveClient();
    const session = client.session();
    // Awaits only the POST that starts the turn; the run continues server-side.
    await session.send({
      message: [
        "Analyze this job posting for me. Load the analyze-job skill and follow it:",
        "use get_career_profile and list_resume_versions, classify fit honestly,",
        "and never claim skills outside my profile.",
        `When the analysis is done, save it by calling create_job_analysis with jobLeadId: "${lead.id}".`,
        "This is an automated background run with no user present — save without asking for confirmation.",
        "",
        `Company: ${lead.company}`,
        `Role: ${lead.roleTitle}`,
        lead.location ? `Location: ${lead.location}` : "",
        lead.salaryRange ? `Salary range: ${lead.salaryRange}` : "",
        `Posting URL: ${lead.url}`,
        "",
        lead.description
          ? `Job description as captured by the sourcing run (may be truncated — if it looks cut off, fetch the posting URL with your web tools and analyze the full text, passing that full text as jobDescription when saving):\n${lead.description}`
          : `No description was captured. Fetch the posting from the URL with your web tools, extract the job description text, and analyze that.`,
      ]
        .filter((line) => line !== "")
        .join("\n"),
    });
  } catch (error) {
    console.error("Failed to start lead analysis:", error);
    return { error: "Couldn't start the analysis. Is the agent runtime up?" };
  }

  await prisma.jobLead.update({
    where: { id: lead.id },
    data: { status: "ANALYZING" },
  });

  revalidateLeadViews();
  return {};
}
