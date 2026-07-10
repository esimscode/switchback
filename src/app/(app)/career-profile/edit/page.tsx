import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { asStringArray } from "@/lib/labels";
import { getUser } from "@/lib/user";

import { updateCareerProfile } from "../actions";

export const metadata = { title: "Edit Career Profile" };
export const dynamic = "force-dynamic";

function ListField({
  name,
  label,
  hint,
  defaultItems,
  rows = 6,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultItems: string[];
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultItems.join("\n")}
      />
      <p className="text-xs text-muted-foreground">
        {hint ?? "One item per line."}
      </p>
    </div>
  );
}

export default async function EditCareerProfilePage() {
  const user = await getUser();
  const profile = await prisma.careerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Edit Career Profile" />
        <p className="p-6 text-sm text-muted-foreground">
          No career profile yet. Run <code>npx prisma db seed</code> first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        backHref="/career-profile"
        backLabel="Back to career profile"
        title="Edit Career Profile"
        description="Positioning, roles, skills, and credibility rules."
      />
      <form action={updateCareerProfile} className="grid gap-4 p-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Positioning</CardTitle>
            <CardDescription>
              How your story is told everywhere else in the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="primaryHeadline">Primary headline</Label>
              <Input
                id="primaryHeadline"
                name="primaryHeadline"
                defaultValue={profile.primaryHeadline}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="corePositioning">Core positioning</Label>
              <Textarea
                id="corePositioning"
                name="corePositioning"
                rows={4}
                defaultValue={profile.corePositioning}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coreStory">Core story</Label>
              <Textarea
                id="coreStory"
                name="coreStory"
                rows={3}
                defaultValue={profile.coreStory}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="portfolioTagline">Portfolio tagline</Label>
                <Input
                  id="portfolioTagline"
                  name="portfolioTagline"
                  defaultValue={profile.portfolioTagline ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedinHeadline">LinkedIn headline</Label>
                <Input
                  id="linkedinHeadline"
                  name="linkedinHeadline"
                  defaultValue={profile.linkedinHeadline ?? ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ListField
              name="targetRoles"
              label="Target roles"
              defaultItems={asStringArray(profile.targetRoles)}
            />
            <ListField
              name="bridgeRoles"
              label="Bridge roles"
              defaultItems={asStringArray(profile.bridgeRoles)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills & rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ListField
              name="skills"
              label="Skills"
              defaultItems={asStringArray(profile.skills)}
            />
            <ListField
              name="credibilityRules"
              label="Credibility rules"
              hint="One rule per line. The strategist treats these as hard limits."
              defaultItems={asStringArray(profile.credibilityRules)}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2 lg:col-span-2">
          <Button type="submit">Save profile</Button>
          <Button asChild variant="outline">
            <Link href="/career-profile">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
