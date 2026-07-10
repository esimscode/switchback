"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import {
  clearNotifications,
  fetchNotifications,
  markNotificationsRead,
  type NotificationItem,
} from "@/app/(app)/notification-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const POLL_MS = 30_000;

const timeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// Surfaces background work (sourcing triage, completed analyses) without the
// user having to sit on any one page.
export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await fetchNotifications();
        if (cancelled) return;
        setUnread(data.unread);
        setItems(data.items);
      } catch {
        // Polling failure is non-fatal; the next tick retries.
      }
    };
    const initial = setTimeout(() => void tick(), 0);
    const id = setInterval(() => void tick(), POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unread > 0) {
          setUnread(0);
          void markNotificationsRead();
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-full text-muted-foreground"
          aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        >
          <Bell />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-block-lime px-1 text-[10px] font-semibold leading-4 text-black">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {items.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs font-normal text-muted-foreground"
              onClick={() => {
                setItems([]);
                setUnread(0);
                void clearNotifications();
              }}
            >
              Clear all
            </Button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            Nothing yet — sourcing runs and background analyses land here.
          </p>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              asChild={Boolean(item.href)}
              className={cn("flex flex-col items-start gap-0.5", item.read && "opacity-60")}
            >
              {item.href ? (
                <Link href={item.href}>
                  <span className="text-sm">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {timeFormat.format(new Date(item.createdAt))}
                  </span>
                </Link>
              ) : (
                <>
                  <span className="text-sm">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {timeFormat.format(new Date(item.createdAt))}
                  </span>
                </>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
