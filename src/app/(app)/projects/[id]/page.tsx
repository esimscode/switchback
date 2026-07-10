import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FolderGit2, Pencil } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import {
  CONTENT_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  asStringArray,
} from "@/lib/labels";
import { getUser } from "@/lib/user";

import { GenerateButtons } from "./generate-buttons";

export const metadata = { title: "Project" };
export const dynamic = "force-dynamic";

function Section({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="whitespace-pre-line text-sm">{text}</p>
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const project = await prisma.project.findUnique({
    where: { id, userId: user.id },
    include: {
      caseStudies: { orderBy: { createdAt: "desc" } },
      agentOutputs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!project) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        backHref="/projects"
        backLabel="Back to projects"
        title={project.name}
        description={project.summary ?? undefined}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{PROJECT_STATUS_LABELS[project.status]}</Badge>
              {asStringArray(project.stack).map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
              <span className="ml-auto flex items-center gap-3">
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    <FolderGit2 className="size-3.5" /> GitHub
                  </a>
                ) : null}
                {project.portfolioUrl ? (
                  <a
                    href={project.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    <ExternalLink className="size-3.5" /> Portfolio
                  </a>
                ) : null}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Section label="Problem" text={project.problem} />
            <Section label="Solution" text={project.solution} />
            <Section label="Career signal" text={project.careerSignal} />
            <Section label="Next milestone" text={project.nextMilestone} />
            <div className="border-t pt-4">
              <p className="eyebrow mb-2 text-muted-foreground">
                Generate career assets
              </p>
              <GenerateButtons projectId={project.id} />
            </div>
          </CardContent>
        </Card>

        {project.caseStudies.map((cs) => (
          <Card key={cs.id} className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{cs.title}</CardTitle>
                <Badge variant="secondary">
                  {CONTENT_STATUS_LABELS[cs.status]}
                </Badge>
              </div>
              <CardDescription>
                Case study ·{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(cs.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Section label="Problem" text={cs.problem} />
              <Section label="Solution" text={cs.solution} />
              <Section label="Stack" text={cs.stack} />
              <Section label="Architecture" text={cs.architecture} />
              <Section label="Challenges" text={cs.challenges} />
              <Section label="Outcome" text={cs.outcome} />
              <Section label="Next steps" text={cs.nextSteps} />
              <Section label="Career signal" text={cs.careerSignal} />
            </CardContent>
          </Card>
        ))}

        {project.agentOutputs.map((output) => (
          <Card key={output.id}>
            <CardHeader>
              <CardTitle className="text-base">{output.title}</CardTitle>
              <CardDescription>
                {output.outputType.replace(/_/g, " ")} ·{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(output.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">{output.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
