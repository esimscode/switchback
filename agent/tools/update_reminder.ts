import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Reschedule (snooze), re-word, or re-link an existing reminder. Identify it by id from list_reminders. Rescheduling clears the 'already nudged' mark so it fires again on the new date.",
  inputSchema: z.object({
    id: z.string(),
    dueDate: z
      .string()
      .optional()
      .describe("New due date/time — ISO date or datetime. Re-arms the nudge."),
    text: z.string().min(1).max(280).optional(),
    link: z.string().url().optional(),
  }),
  async execute({ id, dueDate, text, link }) {
    const user = await getUser();
    const existing = await prisma.reminder.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return { error: "No matching reminder found. Use list_reminders to get the id." };
    }
    let due: Date | undefined;
    if (dueDate) {
      due = new Date(dueDate);
      if (Number.isNaN(due.getTime())) {
        return { error: `Could not parse dueDate "${dueDate}". Use an ISO date or datetime.` };
      }
    }
    const updated = await prisma.reminder.update({
      where: { id },
      data: {
        ...(due && { dueDate: due, notifiedAt: null, status: "PENDING" }),
        ...(text && { text }),
        ...(link !== undefined && { link }),
      },
    });
    return {
      updated: true,
      id,
      dueDate: updated.dueDate.toISOString(),
      viewAt: "/reminders",
    };
  },
});
