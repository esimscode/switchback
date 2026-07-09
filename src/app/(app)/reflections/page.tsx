import Link from "next/link";
import { NotebookPen } from "lucide-react";

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
import type { ReflectionType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { REFLECTION_TYPE_LABELS } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { NewReflectionDialog } from "./new-reflection-dialog";

export const metadata = { title: "Reflections" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ReflectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType =
    type && type in REFLECTION_TYPE_LABELS ? (type as ReflectionType) : undefined;

  const user = await getUser();
  const [reflections, projects, applications] = await Promise.all([
    prisma.careerReflection.findMany({
      where: { userId: user.id, ...(activeType && { reflectionType: activeType }) },
      orderBy: { createdAt: "desc" },
      include: {
        relatedProject: { select: { id: true, name: true } },
        relatedApplication: { select: { id: true, company: true, roleTitle: true } },
      },
    }),
    prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.application.findMany({
      where: { userId: user.id },
      select: { id: true, company: true, roleTitle: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Reflections"
        description="Career thoughts, decisions, and weekly check-ins — in order."
        actions={
          <NewReflectionDialog
            projects={projects}
            applications={applications.map((a) => ({
              id: a.id,
              label: `${a.company} · ${a.roleTitle}`,
            }))}
          />
        }
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            size="xs"
            variant={activeType ? "outline" : "secondary"}
          >
            <Link href="/reflections">All</Link>
          </Button>
          {Object.entries(REFLECTION_TYPE_LABELS).map(([value, label]) => (
            <Button
              key={value}
              asChild
              size="xs"
              variant={activeType === value ? "secondary" : "outline"}
            >
              <Link href={`/reflections?type=${value}`}>{label}</Link>
            </Button>
          ))}
        </div>

        {reflections.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
            <NotebookPen className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No reflections yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Log one here, or talk something through in Strategist Chat and
              ask to save it.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {reflections.map((reflection) => (
              <Card key={reflection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{reflection.title}</CardTitle>
                    <Badge variant="secondary">
                      {REFLECTION_TYPE_LABELS[reflection.reflectionType]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {dateFormat.format(reflection.createdAt)}
                    {reflection.mood ? ` · feeling ${reflection.mood}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-line text-sm">{reflection.body}</p>
                  {(reflection.relatedProject || reflection.relatedApplication) && (
                    <div className="flex flex-wrap gap-2">
                      {reflection.relatedProject ? (
                        <Button asChild size="xs" variant="outline">
                          <Link href={`/projects/${reflection.relatedProject.id}`}>
                            {reflection.relatedProject.name}
                          </Link>
                        </Button>
                      ) : null}
                      {reflection.relatedApplication ? (
                        <Button asChild size="xs" variant="outline">
                          <Link href="/applications">
                            {reflection.relatedApplication.company} ·{" "}
                            {reflection.relatedApplication.roleTitle}
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
