import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Set a reminder to nudge the user on a future date/time — e.g. follow up with a recruiter, check a post, prep before an interview. Confirm the timing with the user unless they explicitly asked to be reminded. The user is nudged in-app and by email on the due date.",
  inputSchema: z.object({
    text: z.string().min(1).max(280).describe("What to nudge about, in the user's voice."),
    dueDate: z
      .string()
      .describe("When to nudge — ISO date or datetime, e.g. 2026-07-18 or 2026-07-18T14:00."),
    link: z.string().url().optional().describe("Optional link the nudge should point to."),
  }),
  async execute({ text, dueDate, link }) {
    const user = await getUser();
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
      return { error: `Could not parse dueDate "${dueDate}". Use an ISO date or datetime.` };
    }
    const reminder = await prisma.reminder.create({
      data: { userId: user.id, text, dueDate: due, link, source: "strategist chat" },
    });
    return { saved: true, id: reminder.id, dueDate: reminder.dueDate, viewAt: "/reminders" };
  },
});
