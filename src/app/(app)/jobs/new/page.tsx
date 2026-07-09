import { PageHeader } from "@/components/page-header";

import { AnalyzeJobForm } from "./analyze-job-form";

export const metadata = { title: "Analyze a Job" };

export default function NewJobPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Analyze a Job"
        description="The strategist grades fit against your profile — and won't inflate it."
      />
      <div className="max-w-2xl p-6">
        <AnalyzeJobForm />
      </div>
    </div>
  );
}
