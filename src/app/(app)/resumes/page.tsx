import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/user";

import { NewResumeDialog } from "./new-resume-dialog";
import { ResumeVersionsList } from "./resume-versions-list";

export const metadata = { title: "Resumes" };
export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const user = await getUser();
  const resumeVersions = await prisma.resumeVersion.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Resumes"
        description="Targeted versions the strategist recommends per role family."
        actions={<NewResumeDialog />}
      />
      <div className="p-6">
        <ResumeVersionsList resumeVersions={resumeVersions} />
      </div>
    </div>
  );
}
