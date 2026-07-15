import { defineTool } from "eve/tools";
import { z } from "zod";

import { getUser, prisma } from "../lib/db";

const STATUS = {
  pending: "PENDING",
  done: "DONE",
  cancelled: "CANCELLED",
} as const;

export default defineTool({
  description:
    "List the user's reminders, soonest first. Defaults to pending (upcoming and overdue); pass status to see done or cancelled ones. Use to check what's on deck or to surface overdue nudges.",
  inputSchema: z.object({
    status: z.enum(["pending", "done", "cancelled", "all"]).default("pending"),
  }),
  async execute({ status }) {
    const user = await getUser();
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.id,
        ...(status === "all" ? {} : { status: STATUS[status] }),
      },
      orderBy: { dueDate: "asc" },
      select: { id: true, text: true, dueDate: true, link: true, status: true, notifiedAt: true },
    });
    return { reminders, viewAt: "/reminders" };
  },
});
