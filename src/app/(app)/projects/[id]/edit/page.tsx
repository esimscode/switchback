import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { PROJECT_STATUS_LABELS, asStringArray } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { updateProject } from "../../actions";

export const metadata = { title: "Edit Project" };
export const dynamic = "force-dynamic";

function Field({
  name,
  label,
  defaultValue,
  textarea,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {textarea ? (
        <Textarea id={name} name={name} rows={3} defaultValue={defaultValue} />
      ) : (
        <Input id={name} name={name} defaultValue={defaultValue} />
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const project = await prisma.project.findUnique({
    where: { id, userId: user.id },
  });
  if (!project) notFound();

  const action = updateProject.bind(null, project.id);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={`Edit: ${project.name}`}
        description="Honest status labels keep the strategist's outputs credible."
      />
      <form action={action} className="max-w-2xl space-y-4 p-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Name" defaultValue={project.name} />
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={project.status}
                  className="border-input h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Field
              name="summary"
              label="Summary"
              defaultValue={project.summary ?? ""}
              textarea
            />
            <Field
              name="problem"
              label="Problem"
              defaultValue={project.problem ?? ""}
              textarea
            />
            <Field
              name="solution"
              label="Solution"
              defaultValue={project.solution ?? ""}
              textarea
            />
            <Field
              name="stack"
              label="Stack"
              defaultValue={asStringArray(project.stack).join(", ")}
              hint="Comma-separated."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="role"
                label="Your role"
                defaultValue={project.role ?? ""}
              />
              <Field
                name="nextMilestone"
                label="Next milestone"
                defaultValue={project.nextMilestone ?? ""}
              />
              <Field
                name="githubUrl"
                label="GitHub URL"
                defaultValue={project.githubUrl ?? ""}
              />
              <Field
                name="portfolioUrl"
                label="Portfolio URL"
                defaultValue={project.portfolioUrl ?? ""}
              />
            </div>
            <Field
              name="careerSignal"
              label="Career signal"
              defaultValue={project.careerSignal ?? ""}
              textarea
            />
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="submit">Save project</Button>
          <Button asChild variant="outline">
            <Link href={`/projects/${project.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
