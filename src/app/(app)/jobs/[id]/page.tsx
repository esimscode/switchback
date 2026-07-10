import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarDays,
  ExternalLink,
  FileText,
  MapPin,
} from "lucide-react";

import { CopyButton } from "@/components/copy-button";
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
import { DraftCoverLetterButton } from "./draft-cover-letter-button";

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

  const coverLetter = await prisma.agentOutput.findFirst({
    where: {
      userId: user.id,
      relatedJobAnalysisId: analysis.id,
      outputType: "cover_letter",
    },
    orderBy: { createdAt: "desc" },
  });
  // Content stores letter + approach note; only the letter should be copied.
  const [letterBody, approachNote] = coverLetter
    ? coverLetter.content.split(/\n\n---\nApproach: /, 2)
    : [null, null];

  const hasApplication = analysis.applications.length > 0;
  const convertAction = createApplicationFromAnalysis.bind(null, analysis.id);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        backHref="/jobs"
        backLabel="Back to job analyses"
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
            <p className="max-w-prose whitespace-pre-line">{analysis.recommendation}</p>
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Cover letter</CardTitle>
                <CardDescription>
                  Grounded in the analysis and your resume — copy it out and
                  make it yours.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {letterBody ? (
                  <CopyButton text={letterBody} label="Copy letter" />
                ) : null}
                <DraftCoverLetterButton
                  jobAnalysisId={analysis.id}
                  label={coverLetter ? "Redraft" : "Draft cover letter"}
                />
              </div>
            </div>
          </CardHeader>
          {coverLetter ? (
            <CardContent className="space-y-3 text-sm">
              <p className="max-w-prose whitespace-pre-line">{letterBody}</p>
              {approachNote ? (
                <p className="max-w-prose text-xs text-muted-foreground">
                  <span className="eyebrow">Approach</span> — {approachNote}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Drafted{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(coverLetter.createdAt)}
              </p>
            </CardContent>
          ) : (
            <CardContent className="text-sm text-muted-foreground">
              No draft yet. The strategist writes it from this analysis, your
              profile, and the recommended resume version&apos;s real content —
              honest gaps stay honest.
            </CardContent>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Job description</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 lg:flex-row">
            {/* Reading column stays prose-width; the freed space carries the facts. */}
            <div className="max-h-80 min-w-0 flex-1 overflow-y-auto">
              <p className="max-w-prose whitespace-pre-line text-sm text-muted-foreground">
                {analysis.jobDescription}
              </p>
            </div>
            <aside className="shrink-0 space-y-3 text-sm lg:w-60 lg:border-l lg:pl-6">
              <p className="eyebrow text-muted-foreground">At a glance</p>
              <ul className="space-y-2.5">
                {analysis.salaryRange ? (
                  <li className="flex items-start gap-2">
                    <BadgeDollarSign className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>{analysis.salaryRange}</span>
                  </li>
                ) : null}
                {analysis.location ? (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>{analysis.location}</span>
                  </li>
                ) : null}
                {analysis.recommendedResumeVersion ? (
                  <li className="flex items-start gap-2">
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>Lead with {analysis.recommendedResumeVersion.name}</span>
                  </li>
                ) : null}
                <li className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    Analyzed{" "}
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                      analysis.createdAt,
                    )}
                  </span>
                </li>
                {analysis.sourceUrl ? (
                  <li className="flex items-start gap-2">
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={analysis.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      Original posting
                    </a>
                  </li>
                ) : null}
              </ul>
            </aside>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
