import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";
import { CONTENT_STATUS_LABELS, RESUME_VERSION_TYPE_LABELS } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { updateResumeVersion } from "../actions";
import { ResumeContentEditor } from "./resume-content-editor";

export const metadata = { title: "Resume Version" };
export const dynamic = "force-dynamic";

export default async function ResumeVersionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const resume = await prisma.resumeVersion.findUnique({
    where: { id, userId: user.id },
  });
  if (!resume) notFound();

  const action = updateResumeVersion.bind(null, resume.id);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={resume.name}
        description={`${RESUME_VERSION_TYPE_LABELS[resume.type]} focus`}
        actions={
          <CopyButton text={resume.content ?? ""} label="Copy content" />
        }
      />
      <form action={action} className="max-w-3xl space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content</CardTitle>
            <CardDescription>
              Markdown, and it&apos;s the source of truth — the strategist
              reads this version when tailoring for a role. Paste your current
              resume here to start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResumeContentEditor
              defaultValue={resume.content ?? ""}
              placeholder={`# ${user.name}\n\n## Experience\n\n### Role · Company · Dates\n- What you actually did…`}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={resume.status}
                  className="border-input h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {Object.entries(CONTENT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <Badge variant="outline">
                Updated{" "}
                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                  resume.updatedAt,
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="submit">Save version</Button>
          <Button asChild variant="outline">
            <Link href="/career-profile">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
