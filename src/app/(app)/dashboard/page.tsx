import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Compass,
  FolderKanban,
  MessageSquare,
  NotebookPen,
  Plus,
} from "lucide-react";

import { FitBadge } from "@/components/fit-badge";
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
  APPLICATION_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  REFLECTION_TYPE_LABELS,
  asStringArray,
} from "@/lib/labels";
import { getUser } from "@/lib/user";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

// Brand rule: color is a ground, never tinted text — interactive chips get a
// lime block on hover, matching the focus card and active nav treatment.
const limeHover =
  "hover:bg-block-lime hover:text-black hover:border-transparent dark:hover:bg-block-lime dark:hover:text-black";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const ACTIVE_STATUSES = [
  "SAVED",
  "APPLIED",
  "FOLLOW_UP_NEEDED",
  "INTERVIEWING",
  "OFFER",
] as const;

function suggestNextAction({
  overdueFollowUp,
  stalledSaved,
  projectWithMilestone,
}: {
  overdueFollowUp?: { company: string; roleTitle: string } | null;
  stalledSaved?: { company: string; roleTitle: string } | null;
  projectWithMilestone?: { name: string; nextMilestone: string | null; id: string } | null;
}): { text: string; href: string } {
  if (overdueFollowUp) {
    return {
      text: `Follow up on ${overdueFollowUp.company} · ${overdueFollowUp.roleTitle} — it's due.`,
      href: "/applications",
    };
  }
  if (stalledSaved) {
    return {
      text: `Decide on ${stalledSaved.company} · ${stalledSaved.roleTitle}: apply or pass.`,
      href: "/applications",
    };
  }
  if (projectWithMilestone?.nextMilestone) {
    return {
      text: `Ship the next milestone for ${projectWithMilestone.name}: ${projectWithMilestone.nextMilestone}`,
      href: `/projects/${projectWithMilestone.id}`,
    };
  }
  return {
    text: "Log a weekly check-in — what's the focus this week?",
    href: "/reflections",
  };
}

export default async function DashboardPage() {
  const user = await getUser();
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const [profile, applications, projects, reflections, analysesCount] =
    await Promise.all([
      prisma.careerProfile.findUnique({ where: { userId: user.id } }),
      prisma.application.findMany({
        where: { userId: user.id, status: { in: [...ACTIVE_STATUSES] } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { resumeVersion: { select: { name: true } } },
      }),
      prisma.project.findMany({
        where: { userId: user.id, status: { notIn: ["COMPLETED", "DEPLOYED"] } },
        orderBy: { updatedAt: "asc" },
        take: 3,
      }),
      prisma.careerReflection.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.jobAnalysis.count({ where: { userId: user.id } }),
    ]);

  const overdueFollowUp = applications.find(
    (a) => a.followUpDate && a.followUpDate <= now,
  );
  const stalledSaved = applications.find(
    (a) => a.status === "SAVED" && a.updatedAt <= threeDaysAgo,
  );
  const projectWithMilestone = projects.find((p) => p.nextMilestone);
  const nextAction = suggestNextAction({
    overdueFollowUp,
    stalledSaved,
    projectWithMilestone,
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Dashboard"
        description={`${user.name} · ${analysesCount} ${analysesCount === 1 ? "analysis" : "analyses"} · ${applications.length} active ${applications.length === 1 ? "application" : "applications"}`}
      />
      <div className="space-y-6 p-6">
        {/* The one color block in this viewport (DESIGN.md): current focus. */}
        <section className="rounded-[1.5rem] bg-block-lime p-8 text-black sm:p-12">
          <p className="eyebrow mb-3 opacity-70">Current focus</p>
          <h2 className="max-w-3xl text-2xl font-medium tracking-tight sm:text-3xl">
            {profile?.portfolioTagline ??
              profile?.primaryHeadline ??
              "Set your positioning in the career profile."}
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="max-w-2xl text-base font-medium">
              Next: {nextAction.text}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-black text-white hover:bg-black/80">
              <Link href={nextAction.href}>
                Do it <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-black/20 bg-transparent text-black hover:bg-black/5 hover:text-black dark:bg-transparent dark:text-black dark:hover:bg-black/10 dark:hover:text-black"
            >
              <Link href="/chat">
                <MessageSquare /> Ask the strategist
              </Link>
            </Button>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className={limeHover}>
            <Link href="/jobs/new">
              <Compass /> Analyze a job
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className={limeHover}>
            <Link href="/applications">
              <Plus /> Track an application
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className={limeHover}>
            <Link href="/reflections">
              <NotebookPen /> Log a reflection
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className={limeHover}>
            <Link href="/projects">
              <FolderKanban /> Projects
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active applications</CardTitle>
              <CardDescription>
                <Link href="/applications" className="underline-offset-4 hover:underline">
                  View all →
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="size-4" /> Nothing in flight — analyze a
                  job to get started.
                </p>
              ) : (
                <ul className="space-y-3">
                  {applications.map((app) => (
                    <li key={app.id} className="flex items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium">{app.company}</span>
                        <span className="text-muted-foreground"> · {app.roleTitle}</span>
                      </span>
                      {app.fitClassification ? (
                        <FitBadge fit={app.fitClassification} />
                      ) : null}
                      <Badge variant="outline">
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projects needing momentum</CardTitle>
              <CardDescription>Least recently touched first.</CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All projects are shipped — add the next one.
                </p>
              ) : (
                <ul className="space-y-3">
                  {projects.map((project) => (
                    <li key={project.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="min-w-0 flex-1 truncate font-medium underline-offset-4 hover:underline"
                        >
                          {project.name}
                        </Link>
                        <Badge variant="secondary">
                          {PROJECT_STATUS_LABELS[project.status]}
                        </Badge>
                      </div>
                      {project.nextMilestone ? (
                        <p className="mt-0.5 truncate text-muted-foreground">
                          Next: {project.nextMilestone}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent reflections</CardTitle>
              <CardDescription>
                <Link href="/reflections" className="underline-offset-4 hover:underline">
                  View all →
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reflections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reflections yet — what are you focused on this week?
                </p>
              ) : (
                <ul className="space-y-3">
                  {reflections.map((reflection) => (
                    <li key={reflection.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {reflection.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {dateFormat.format(reflection.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {REFLECTION_TYPE_LABELS[reflection.reflectionType]}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target roles</CardTitle>
              <CardDescription>
                <Link href="/career-profile" className="underline-offset-4 hover:underline">
                  Career profile →
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {asStringArray(profile?.targetRoles).map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
