import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import {
  ACTIVE_APPLICATION_STATUSES,
  dueFollowUps,
  dueReminders,
  followUpDueItem,
  reminderDueItem,
  type DueItem,
} from "@/lib/reminders";

export const dynamic = "force-dynamic";

// Daily scan (Vercel Cron, 0 14 * * *). Surfaces due reminders and due
// application follow-ups into notifications — once each, via the notified
// markers — then (Slice 3) emails a digest of what was newly surfaced.
export async function GET(request: NextRequest) {
  // Vercel injects `Authorization: Bearer $CRON_SECRET` on cron requests when
  // CRON_SECRET is set. Absent secret → always 401 (never an open endpoint).
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const [pendingReminders, activeApplications] = await Promise.all([
    prisma.reminder.findMany({ where: { status: "PENDING" } }),
    prisma.application.findMany({
      where: {
        status: { in: [...ACTIVE_APPLICATION_STATUSES] },
        followUpDate: { not: null },
      },
    }),
  ]);

  const surfaced: DueItem[] = [];

  for (const r of dueReminders(pendingReminders, now)) {
    const item = reminderDueItem(r);
    await prisma.$transaction([
      prisma.notification.create({ data: item }),
      prisma.reminder.update({ where: { id: r.id }, data: { notifiedAt: now } }),
    ]);
    surfaced.push(item);
  }

  for (const a of dueFollowUps(activeApplications, now)) {
    const item = followUpDueItem(a);
    await prisma.$transaction([
      prisma.notification.create({ data: item }),
      prisma.application.update({
        where: { id: a.id },
        data: { followUpNotifiedAt: now },
      }),
    ]);
    surfaced.push(item);
  }

  // Slice 3 (T8): email a per-user digest of `surfaced`.

  return NextResponse.json({
    surfaced: surfaced.length,
    scannedAt: now.toISOString(),
  });
}
