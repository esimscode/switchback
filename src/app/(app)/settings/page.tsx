import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getUser();
  const [counts, hasGatewayKey] = await Promise.all([
    Promise.all([
      prisma.jobAnalysis.count({ where: { userId: user.id } }),
      prisma.application.count({ where: { userId: user.id } }),
      prisma.project.count({ where: { userId: user.id } }),
      prisma.caseStudy.count({ where: { userId: user.id } }),
      prisma.careerReflection.count({ where: { userId: user.id } }),
      prisma.careerMemory.count({ where: { userId: user.id } }),
      prisma.agentOutput.count({ where: { userId: user.id } }),
    ]),
    Promise.resolve(Boolean(process.env.AI_GATEWAY_API_KEY)),
  ]);

  const [analyses, applications, projects, caseStudies, reflections, memories, outputs] =
    counts;

  const rows: [string, number, string][] = [
    ["Job analyses", analyses, "/jobs"],
    ["Applications", applications, "/applications"],
    ["Projects", projects, "/projects"],
    ["Case studies", caseStudies, "/projects"],
    ["Reflections", reflections, "/reflections"],
    ["Memories", memories, "/memories"],
    ["Agent outputs", outputs, "/projects"],
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Settings"
        description="Workspace status and administration."
      />
      <div className="grid max-w-3xl gap-4 p-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Environment</CardTitle>
            <CardDescription>Single-user workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center justify-between">
              Workspace user
              <span className="text-muted-foreground">{user.email}</span>
            </p>
            <p className="flex items-center justify-between">
              Database
              <Badge variant="secondary">Neon Postgres</Badge>
            </p>
            <p className="flex items-center justify-between">
              Agent model access
              <Badge variant={hasGatewayKey ? "secondary" : "destructive"}>
                {hasGatewayKey ? "AI Gateway configured" : "AI_GATEWAY_API_KEY missing"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace data</CardTitle>
            <CardDescription>
              Everything lives in your database — nothing is shared.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {rows.map(([label, count, href]) => (
                <li key={label} className="flex items-center justify-between">
                  <Link href={href} className="underline-offset-4 hover:underline">
                    {label}
                  </Link>
                  <span className="text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Memory administration</CardTitle>
            <CardDescription>
              The strategist reads memories at the start of every conversation.
              Review what it knows and correct anything stale on the{" "}
              <Link href="/memories" className="underline underline-offset-4">
                memories page
              </Link>
              .
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
