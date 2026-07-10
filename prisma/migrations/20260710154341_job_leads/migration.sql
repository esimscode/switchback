-- CreateEnum
CREATE TYPE "JobLeadStatus" AS ENUM ('NEW', 'REVIEWED', 'DISMISSED', 'PROMOTED');

-- CreateTable
CREATE TABLE "job_leads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "external_id" TEXT,
    "dedupe_key" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role_title" TEXT NOT NULL,
    "location" TEXT,
    "salary_range" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "status" "JobLeadStatus" NOT NULL DEFAULT 'NEW',
    "triage_fit" "FitClassification",
    "triage_summary" TEXT,
    "posted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "promoted_job_analysis_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_leads_promoted_job_analysis_id_key" ON "job_leads"("promoted_job_analysis_id");

-- CreateIndex
CREATE INDEX "job_leads_user_id_status_idx" ON "job_leads"("user_id", "status");

-- CreateIndex
CREATE INDEX "job_leads_user_id_last_seen_at_idx" ON "job_leads"("user_id", "last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "job_leads_user_id_dedupe_key_key" ON "job_leads"("user_id", "dedupe_key");

-- AddForeignKey
ALTER TABLE "job_leads" ADD CONSTRAINT "job_leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_leads" ADD CONSTRAINT "job_leads_promoted_job_analysis_id_fkey" FOREIGN KEY ("promoted_job_analysis_id") REFERENCES "job_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
