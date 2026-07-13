import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContentStatus } from "@/generated/prisma/enums";
import { CONTENT_STATUS_LABELS } from "@/lib/labels";

type ResumeVersionRow = {
  id: string;
  name: string;
  roleFamily: string;
  content: string | null;
  status: ContentStatus;
};

function describeContent(content: string | null) {
  return content && content.trim().length > 0
    ? `${content.trim().split(/\s+/).length} words`
    : "Empty — add it";
}

// The resumes page and the career profile render the same versions list:
// a table where it fits, stacked cards on phones.
export function ResumeVersionsList({
  resumeVersions,
}: {
  resumeVersions: ResumeVersionRow[];
}) {
  return (
    <>
      <ul className="grid gap-3 sm:hidden">
        {resumeVersions.map((rv) => (
          <li
            key={rv.id}
            className="rounded-[1.5rem] bg-card p-5 text-sm ring-1 ring-border"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/resumes/${rv.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {rv.name}
                </Link>
                <p className="text-muted-foreground">
                  {rv.roleFamily} · {describeContent(rv.content)}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {CONTENT_STATUS_LABELS[rv.status]}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Focus</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resumeVersions.map((rv) => (
              <TableRow key={rv.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/resumes/${rv.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {rv.name}
                  </Link>
                </TableCell>
                <TableCell>{rv.roleFamily}</TableCell>
                <TableCell className="text-muted-foreground">
                  {describeContent(rv.content)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {CONTENT_STATUS_LABELS[rv.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
