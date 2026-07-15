import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

export default defineTool({
  description:
    "Mark a reminder done (or cancel it) once it's handled. Identify it by id from list_reminders.",
  inputSchema: z.object({
    id: z.string(),
    cancel: z
      .boolean()
      .default(false)
      .describe("Set true to cancel (dropped, not acted on) rather than complete."),
  }),
  async execute({ id, cancel }) {
    const user = await getUser();
    const existing = await prisma.reminder.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return { error: "No matching reminder found. Use list_reminders to get the id." };
    }
    await prisma.reminder.update({
      where: { id },
      data: { status: cancel ? "CANCELLED" : "DONE" },
    });
    return { done: !cancel, cancelled: cancel, id, viewAt: "/reminders" };
  },
});
