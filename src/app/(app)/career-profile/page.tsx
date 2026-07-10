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
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { CONTENT_STATUS_LABELS, asStringArray } from "@/lib/labels";
import { getUser } from "@/lib/user";

export const metadata = { title: "Career Profile" };
export const dynamic = "force-dynamic";

export default async function CareerProfilePage() {
  const user = await getUser();
  const [profile, resumeVersions, { data: session }] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId: user.id } }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    auth.getSession(),
  ]);
  const headshot = session?.user?.image ?? null;

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

  // Pill treatments per DESIGN.md — color as a soft ground, never tinted
  // text: skills sit on a lime tint, target roles carry a lime outline,
  // bridge roles stay neutral so the hierarchy reads at a glance.
  const badgeSection = (
    title: string,
    items: string[],
    badgeClassName?: string,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge
            key={item}
            variant={badgeClassName ? "outline" : "secondary"}
            className={badgeClassName}
          >
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
        leading={
          headshot ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from Neon Auth, not an optimizable remote asset
            <img
              src={headshot}
              alt={`${user.name}'s headshot`}
              className="size-10 shrink-0 rounded-full border object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-block-lime text-sm font-semibold text-black"
            >
              {user.name
                .split(/\s+/)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </span>
          )
        }
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
            <p className="max-w-prose">{profile.corePositioning}</p>
            <p className="max-w-prose text-muted-foreground">
              {profile.coreStory}
            </p>
            <Separator />
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

        {badgeSection(
          "Target roles",
          asStringArray(profile.targetRoles),
          "border-block-lime/80 dark:border-block-lime/50",
        )}
        {badgeSection("Bridge roles", asStringArray(profile.bridgeRoles))}
        {badgeSection(
          "Skills",
          asStringArray(profile.skills),
          "border-transparent bg-block-lime/45 text-foreground dark:bg-block-lime/20",
        )}

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
