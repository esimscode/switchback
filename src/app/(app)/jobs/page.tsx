import Link from "next/link";
import { Compass, Plus } from "lucide-react";

import { FitBadge } from "@/components/fit-badge";
import { PageHeader } from "@/components/page-header";
import { clampPage, Pager } from "@/components/pager";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

export const metadata = { title: "Job Analysis" };
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const PAGE_SIZE = 24;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getUser();
  const params = await searchParams;
  const total = await prisma.jobAnalysis.count({ where: { userId: user.id } });
  const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const page = clampPage(params.page, pageCount);
  const analyses = await prisma.jobAnalysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { recommendedResumeVersion: { select: { name: true } } },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Job Analysis"
        description={`Paste a job description, get an honest fit strategy.${total > 0 ? ` · ${total} ${total === 1 ? "analysis" : "analyses"}` : ""}`}
        actions={
          <Button asChild size="sm">
            <Link href="/jobs/new">
              <Plus /> Analyze a job
            </Link>
          </Button>
        }
      />
      <div className="p-6">
        {analyses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
            <Compass className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No analyses yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste a job description and the strategist will classify fit,
              recommend a resume version, and flag gaps — honestly.
            </p>
            <Button asChild size="sm" className="mt-2">
              <Link href="/jobs/new">Analyze your first job</Link>
            </Button>
          </div>
        ) : (
          <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {analyses.map((analysis) => (
              <Link key={analysis.id} href={`/jobs/${analysis.id}`}>
                <Card className="h-full transition-colors hover:bg-secondary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {analysis.roleTitle}
                      </CardTitle>
                      {analysis.fitClassification ? (
                        <FitBadge fit={analysis.fitClassification} />
                      ) : null}
                    </div>
                    <CardDescription>
                      {analysis.company}
                      {analysis.location ? ` · ${analysis.location}` : ""}
                      {" · "}
                      {dateFormat.format(analysis.createdAt)}
                      {analysis.recommendedResumeVersion
                        ? ` · ${analysis.recommendedResumeVersion.name}`
                        : ""}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          <Pager
            page={page}
            pageCount={pageCount}
            hrefFor={(p) => (p === 1 ? "/jobs" : `/jobs?page=${p}`)}
          />
          </>
        )}
      </div>
    </div>
  );
}
