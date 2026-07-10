import Link from "next/link";
import { Briefcase } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { clampPage, Pager } from "@/components/pager";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { FIT_CLASSIFICATION_LABELS } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { NewApplicationDialog } from "./new-application-dialog";
import { StatusSelect } from "./status-select";

export const metadata = { title: "Applications" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// The pipeline's working set vs its record: closing an application (rejected,
// passed, accepted) moves it to the Closed view automatically — the archive
// is the status, no separate flag needed.
const ACTIVE_STATUSES = [
  "SAVED",
  "APPLIED",
  "FOLLOW_UP_NEEDED",
  "INTERVIEWING",
  "OFFER",
] as const;
const CLOSED_STATUSES = ["ACCEPTED", "REJECTED", "PASSED"] as const;

const PAGE_SIZE = 25;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string }>;
}) {
  const user = await getUser();
  const params = await searchParams;
  const view = params.view === "closed" ? "closed" : "active";
  const statuses = view === "closed" ? [...CLOSED_STATUSES] : [...ACTIVE_STATUSES];

  const [activeCount, closedCount, resumeVersions] = await Promise.all([
    prisma.application.count({
      where: { userId: user.id, status: { in: [...ACTIVE_STATUSES] } },
    }),
    prisma.application.count({
      where: { userId: user.id, status: { in: [...CLOSED_STATUSES] } },
    }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const total = view === "closed" ? closedCount : activeCount;
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const page = clampPage(params.page, pageCount);
  const applications = await prisma.application.findMany({
    where: { userId: user.id, status: { in: statuses } },
    include: { resumeVersion: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const hrefFor = (p: number) => {
    const query = new URLSearchParams();
    if (view === "closed") query.set("view", "closed");
    if (p > 1) query.set("page", String(p));
    const qs = query.toString();
    return qs ? `/applications?${qs}` : "/applications";
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Applications"
        description="Track applications, statuses, and decisions."
        actions={<NewApplicationDialog resumeVersions={resumeVersions} />}
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "active", label: "Active", count: activeCount, href: "/applications" },
              {
                key: "closed",
                label: "Closed",
                count: closedCount,
                href: "/applications?view=closed",
              },
            ] as const
          ).map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                tab.key === view
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-transparent hover:bg-block-lime hover:text-black",
              )}
            >
              {tab.label}
              <Badge
                variant={tab.key === view ? "secondary" : "outline"}
                className={cn(
                  "px-1.5 py-0 text-xs",
                  tab.key !== view && "group-hover:border-black/30 group-hover:text-black",
                )}
              >
                {tab.count}
              </Badge>
            </Link>
          ))}
        </div>
        {applications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
            <Briefcase className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {view === "closed" ? "Nothing closed yet" : "No active applications"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {view === "closed"
                ? "Applications land here once they're accepted, rejected, or passed on."
                : "Add one manually, or paste a job description into Job Analysis and convert it into a tracked application."}
            </p>
          </div>
        ) : (
          <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fit</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {app.link ? (
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {app.company}
                      </a>
                    ) : (
                      app.company
                    )}
                  </TableCell>
                  <TableCell>{app.roleTitle}</TableCell>
                  <TableCell>
                    <StatusSelect applicationId={app.id} status={app.status} />
                  </TableCell>
                  <TableCell>
                    {app.fitClassification ? (
                      <Badge variant="outline">
                        {FIT_CLASSIFICATION_LABELS[app.fitClassification]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.resumeVersion?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.dateApplied ? dateFormat.format(app.dateApplied) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.followUpDate
                      ? dateFormat.format(app.followUpDate)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager page={page} pageCount={pageCount} hrefFor={hrefFor} />
          </>
        )}
      </div>
    </div>
  );
}
