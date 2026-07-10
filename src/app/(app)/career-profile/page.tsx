import Link from "next/link";
import { Pencil } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db";
import {
  CONTENT_STATUS_LABELS,

  asStringArray,
} from "@/lib/labels";
import { getUser } from "@/lib/user";

export const metadata = { title: "Career Profile" };
export const dynamic = "force-dynamic";

export default async function CareerProfilePage() {
  const user = await getUser();
  const [profile, resumeVersions] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId: user.id } }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Career Profile" />
        <p className="p-6 text-sm text-muted-foreground">
          No career profile yet. Run <code>npx prisma db seed</code> to load
          your starting profile.
        </p>
      </div>
    );
  }

  const badgeSection = (title: string, items: string[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Career Profile"
        description={`${user.name} · ${user.location ?? ""} · ${user.email}`}
        actions={
          <Button asChild size="sm">
            <Link href="/career-profile/edit">
              <Pencil /> Edit profile
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Positioning</CardTitle>
            <CardDescription>{profile.primaryHeadline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>{profile.corePositioning}</p>
            <p className="text-muted-foreground">{profile.coreStory}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="eyebrow text-muted-foreground">
                  Portfolio tagline
                </p>
                <p>{profile.portfolioTagline}</p>
              </div>
              <div>
                <p className="eyebrow text-muted-foreground">
                  LinkedIn headline
                </p>
                <p>{profile.linkedinHeadline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {badgeSection("Target roles", asStringArray(profile.targetRoles))}
        {badgeSection("Bridge roles", asStringArray(profile.bridgeRoles))}
        {badgeSection("Skills", asStringArray(profile.skills))}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credibility rules</CardTitle>
            <CardDescription>
              The strategist never crosses these lines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {asStringArray(profile.credibilityRules).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resume versions</CardTitle>
            <CardDescription>
              Targeted versions the strategist recommends per role family.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumeVersions.map((rv) => (
                  <TableRow key={rv.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/resumes/${rv.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {rv.name}
                      </Link>
                    </TableCell>
                    <TableCell>{rv.roleFamily}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {rv.content && rv.content.trim().length > 0
                        ? `${rv.content.trim().split(/\s+/).length} words`
                        : "Empty — add it"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CONTENT_STATUS_LABELS[rv.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
