import { BellRing, Check, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

import { clearCompleted, completeReminder, snoozeReminder } from "./actions";

export const metadata = { title: "Reminders" };
export const dynamic = "force-dynamic";

const when = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function RemindersPage() {
  const user = await getUser();
  const [pending, done] = await Promise.all([
    prisma.reminder.findMany({
      where: { userId: user.id, status: "PENDING" },
      orderBy: { dueDate: "asc" },
    }),
    prisma.reminder.findMany({
      where: { userId: user.id, status: { in: ["DONE", "CANCELLED"] } },
      orderBy: { dueDate: "desc" },
      take: 50,
    }),
  ]);
  const now = new Date();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Reminders"
        description="Nudges you or the strategist set — due ones reach you in-app and by email."
      />
      <div className="max-w-3xl space-y-8 p-6">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
            <BellRing className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No reminders pending</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ask the strategist to remind you about a follow-up, a post to check,
              or interview prep — it&apos;ll land here and in your inbox on the day.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {pending.map((r) => {
              const overdue = r.dueDate <= now;
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{r.text}</p>
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{when.format(r.dueDate)}</span>
                      {overdue ? (
                        <Badge variant="outline" className="border-transparent bg-block-lime text-black">
                          Due
                        </Badge>
                      ) : null}
                      {r.link ? (
                        <a
                          href={r.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="size-3.5" /> Open
                        </a>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <form action={snoozeReminder} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="date"
                        name="dueDate"
                        aria-label="Snooze until"
                        className="h-8 rounded-md border bg-transparent px-2 text-sm"
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Snooze
                      </Button>
                    </form>
                    <form action={completeReminder}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" size="sm">
                        <Check /> Done
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {done.length > 0 ? (
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between text-sm text-muted-foreground">
              <span>Done ({done.length})</span>
              <form action={clearCompleted}>
                <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs">
                  Clear completed
                </Button>
              </form>
            </summary>
            <ul className="mt-2 space-y-1">
              {done.map((r) => (
                <li key={r.id} className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                  <span className="line-through">{r.text}</span>
                  <span className="text-xs">
                    {r.status === "CANCELLED" ? "cancelled" : "done"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </div>
  );
}
