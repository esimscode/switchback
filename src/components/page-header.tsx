import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <header className="flex flex-col gap-2 border-b px-6 py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
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
        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
