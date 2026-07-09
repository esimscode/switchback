import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";

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
import { asStringArray } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { createApplicationFromAnalysis } from "../actions";

export const metadata = { title: "Job Analysis" };
export const dynamic = "force-dynamic";

export default async function JobAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const analysis = await prisma.jobAnalysis.findUnique({
    where: { id, userId: user.id },
    include: {
      recommendedResumeVersion: { select: { name: true } },
      applications: { select: { id: true } },
    },
  });
  if (!analysis) notFound();

  const hasApplication = analysis.applications.length > 0;
  const convertAction = createApplicationFromAnalysis.bind(null, analysis.id);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={`${analysis.roleTitle} · ${analysis.company}`}
        description={[
          analysis.location,
          analysis.salaryRange,
          new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
            analysis.createdAt,
          ),
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          hasApplication ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/applications">
                In tracker <ArrowRight />
              </Link>
            </Button>
          ) : (
            <form action={convertAction}>
              <Button type="submit" size="sm">
                Add to applications <ArrowRight />
              </Button>
            </form>
          )
        }
      />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              {analysis.fitClassification ? (
                <FitBadge fit={analysis.fitClassification} />
              ) : null}
              {analysis.recommendedResumeVersion ? (
                <Badge variant="outline">
                  Lead with: {analysis.recommendedResumeVersion.name}
                </Badge>
              ) : null}
              {analysis.sourceUrl ? (
                <a
                  href={analysis.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  <ExternalLink className="size-3.5" /> Posting
                </a>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="eyebrow text-muted-foreground">Recommendation</p>
            <p className="whitespace-pre-line">{analysis.recommendation}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills to emphasize</CardTitle>
            <CardDescription>All grounded in your profile.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {asStringArray(analysis.skillsToEmphasize).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gaps</CardTitle>
            <CardDescription>
              Named candidly — hiding them costs more than having them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {asStringArray(analysis.gaps).map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tailored summary</CardTitle>
            <CardDescription>Adapt this for the application.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="whitespace-pre-line">{analysis.tailoredSummary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview talking points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {asStringArray(analysis.interviewTalkingPoints).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Job description</CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto text-sm text-muted-foreground">
            <p className="whitespace-pre-line">{analysis.jobDescription}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
