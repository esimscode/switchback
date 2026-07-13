import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageHeader({
  title,
  description,
  actions,
  leading,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  /** Item pages link back to their collection. */
  backHref?: string;
  backLabel?: string;
}) {
  return (
    // flex-wrap + the title block's order-last/w-full: on phones the title
    // and description drop to their own full-width row under the controls
    // instead of being crushed between the sidebar trigger and the actions.
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-6 py-4">
      <SidebarTrigger className="-ml-1" />
      {/* data-vertical:self-center: the base style's data-vertical:self-stretch
          pins a fixed-height vertical separator to the row top instead of
          centering it, and only a same-variant class overrides it. */}
      <Separator orientation="vertical" className="h-5 data-vertical:self-center" />
      {backHref ? (
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="-ml-1 shrink-0 rounded-full text-muted-foreground hover:bg-block-lime hover:text-black dark:hover:bg-block-lime dark:hover:text-black"
        >
          <Link href={backHref} aria-label={backLabel ?? "Back"}>
            <ArrowLeft />
          </Link>
        </Button>
      ) : null}
      {leading}
      <div className="order-last w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <NotificationBell />
      </div>
    </header>
  );
}
