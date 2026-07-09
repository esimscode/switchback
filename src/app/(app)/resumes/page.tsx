import Link from "next/link";

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
import { CONTENT_STATUS_LABELS, RESUME_VERSION_TYPE_LABELS } from "@/lib/labels";
import { getUser } from "@/lib/user";

export const metadata = { title: "Resumes" };
export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const user = await getUser();
  const resumeVersions = await prisma.resumeVersion.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Resumes"
        description="Targeted versions the strategist recommends per role family."
      />
      <div className="p-6">
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
                <TableCell>{RESUME_VERSION_TYPE_LABELS[rv.type]}</TableCell>
                <TableCell className="text-muted-foreground">
                  {rv.content && rv.content.trim().length > 0
                    ? `${rv.content.trim().split(/\s+/).length} words`
                    : "Empty — add it"}
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
    </div>
  );
}
