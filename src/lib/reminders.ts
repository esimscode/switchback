// Pure due-date logic for the reminder scan. No DB access here so it stays
// unit-testable with plain fixtures; the cron route supplies the rows and
// persists the results. "Due" = date reached AND not yet surfaced (the
// notified markers guarantee each item nudges exactly once).

// Applications still in play — closed ones (accepted/rejected/passed) don't
// need follow-up nudges.
export const ACTIVE_APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "FOLLOW_UP_NEEDED",
  "INTERVIEWING",
  "OFFER",
] as const;

type ReminderLike = {
  id: string;
  userId: string;
  text: string;
  dueDate: Date;
  link: string | null;
  status: string;
  notifiedAt: Date | null;
};

type ApplicationLike = {
  id: string;
  userId: string;
  company: string;
  roleTitle: string;
  status: string;
  followUpDate: Date | null;
  followUpNotifiedAt: Date | null;
};

export type DueItem = {
  userId: string;
  type: "reminder_due" | "followup_due";
  title: string;
  href: string | null;
};

/** Pending reminders whose time has come and that haven't been surfaced yet. */
export function dueReminders<T extends ReminderLike>(reminders: T[], now: Date): T[] {
  return reminders.filter(
    (r) =>
      r.status === "PENDING" &&
      r.notifiedAt === null &&
      r.dueDate.getTime() <= now.getTime(),
  );
}

/** Active applications whose follow-up is due and not yet surfaced. */
export function dueFollowUps<T extends ApplicationLike>(applications: T[], now: Date): T[] {
  const active: readonly string[] = ACTIVE_APPLICATION_STATUSES;
  return applications.filter(
    (a) =>
      a.followUpDate !== null &&
      a.followUpNotifiedAt === null &&
      active.includes(a.status) &&
      a.followUpDate.getTime() <= now.getTime(),
  );
}

export function reminderDueItem(r: ReminderLike): DueItem {
  return { userId: r.userId, type: "reminder_due", title: r.text, href: r.link };
}

export function followUpDueItem(a: ApplicationLike): DueItem {
  return {
    userId: a.userId,
    type: "followup_due",
    title: `Follow up: ${a.company} — ${a.roleTitle}`,
    href: "/applications",
  };
}
