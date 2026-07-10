import { Briefcase } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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

export default async function ApplicationsPage() {
  const user = await getUser();
  const [applications, resumeVersions] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      include: { resumeVersion: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Applications"
        description="Track applications, statuses, and decisions."
        actions={<NewApplicationDialog resumeVersions={resumeVersions} />}
      />
      <div className="p-6">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
            <Briefcase className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No applications yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add one manually, or paste a job description into Job Analysis
              and convert it into a tracked application.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
