"use server";

import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

export type NotificationItem = {
  id: string;
  title: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export async function fetchNotifications(): Promise<{
  unread: number;
  items: NotificationItem[];
}> {
  const user = await getUser();
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return {
    unread,
    items: items.map((n) => ({
      id: n.id,
      title: n.title,
      href: n.href,
      read: n.readAt !== null,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

export async function markNotificationsRead() {
  const user = await getUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
}
