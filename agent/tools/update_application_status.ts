import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

const STATUS_TO_PRISMA = {
  saved: "SAVED",
  applied: "APPLIED",
  follow_up_needed: "FOLLOW_UP_NEEDED",
  interviewing: "INTERVIEWING",
  rejected: "REJECTED",
  offer: "OFFER",
  accepted: "ACCEPTED",
  passed: "PASSED",
} as const;

export default defineTool({
  description:
    "Update the status of a tracked application (e.g. the user says they applied, got an interview, or were rejected). Identify the application by id, or by company (plus role title when the company has several).",
  inputSchema: z.object({
    applicationId: z.string().optional(),
    company: z
      .string()
      .optional()
      .describe("Company name to match when no id is known (case-insensitive)."),
    roleTitle: z.string().optional(),
    status: z.enum([
      "saved",
      "applied",
      "follow_up_needed",
      "interviewing",
      "rejected",
      "offer",
      "accepted",
      "passed",
    ]),
    followUpDate: z
      .string()
      .optional()
      .describe("ISO date (YYYY-MM-DD) when a follow-up is due."),
    note: z.string().optional().describe("Appended to the application notes."),
  }),
  async execute(input) {
    const user = await getUser();

    const matches = await prisma.application.findMany({
      where: {
        userId: user.id,
        ...(input.applicationId
          ? { id: input.applicationId }
          : {
              company: { contains: input.company ?? "", mode: "insensitive" },
              ...(input.roleTitle
                ? { roleTitle: { contains: input.roleTitle, mode: "insensitive" } }
                : {}),
            }),
      },
      select: { id: true, company: true, roleTitle: true, status: true, notes: true },
    });

    if (matches.length === 0) {
      return { error: "No matching application found. Ask the user which application they mean." };
    }
    if (matches.length > 1) {
      return {
        error: "Multiple applications match — ask the user which one.",
        candidates: matches.map((m) => ({ id: m.id, company: m.company, roleTitle: m.roleTitle })),
      };
    }

    const target = matches[0];
    const status = STATUS_TO_PRISMA[input.status];
    const updated = await prisma.application.update({
      where: { id: target.id },
      data: {
        status,
        ...(status === "APPLIED" && { dateApplied: new Date() }),
        ...(input.followUpDate && { followUpDate: new Date(input.followUpDate) }),
        ...(input.note && {
          notes: [target.notes, input.note].filter(Boolean).join("\n"),
        }),
      },
    });

    return {
      updated: true,
      company: updated.company,
      roleTitle: updated.roleTitle,
      status: input.status,
      viewAt: "/applications",
    };
  },
});
