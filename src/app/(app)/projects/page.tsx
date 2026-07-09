import Link from "next/link";
import { ExternalLink, FolderGit2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { PROJECT_STATUS_LABELS, asStringArray } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { NewProjectDialog } from "./new-project-dialog";

export const metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Projects"
        description="Turn projects into career proof — honestly labeled."
        actions={<NewProjectDialog />}
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="relative flex flex-col transition-colors hover:bg-secondary/30">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  <Link
                    href={`/projects/${project.id}`}
                    className="after:absolute after:inset-0"
                  >
                    {project.name}
                  </Link>
                </CardTitle>
                <Badge
                  variant={
                    project.status === "COMPLETED" ||
                    project.status === "DEPLOYED"
                      ? "default"
                      : "secondary"
                  }
                >
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
              </div>
              <CardDescription>{project.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
              {project.careerSignal ? (
                <div>
                  <p className="eyebrow text-muted-foreground">
                    Career signal
                  </p>
                  <p>{project.careerSignal}</p>
                </div>
              ) : null}
              {project.nextMilestone ? (
                <div>
                  <p className="eyebrow text-muted-foreground">
                    Next milestone
                  </p>
                  <p>{project.nextMilestone}</p>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-1">
                {asStringArray(project.stack).map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
            {(project.githubUrl || project.portfolioUrl) && (
              <CardFooter className="relative z-10 gap-3 text-sm">
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline"
                  >
                    <FolderGit2 className="size-3.5" /> GitHub
                  </a>
                ) : null}
                {project.portfolioUrl ? (
                  <a
                    href={project.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline"
                  >
                    <ExternalLink className="size-3.5" /> Portfolio
                  </a>
                ) : null}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
