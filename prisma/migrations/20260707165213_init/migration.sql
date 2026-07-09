-- CreateEnum
CREATE TYPE "ResumeVersionType" AS ENUM ('MASTER', 'PLATFORM_DEVSECOPS', 'CLOUD_INFRASTRUCTURE', 'SOFTWARE_AI', 'CYBERSECURITY');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "FitClassification" AS ENUM ('STRONG_FIT', 'STRETCH_FIT', 'BRIDGE_ROLE', 'NOT_WORTH_IT');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'FOLLOW_UP_NEEDED', 'INTERVIEWING', 'REJECTED', 'OFFER', 'ACCEPTED', 'PASSED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'PROTOTYPE', 'IMPLEMENTED', 'TESTED', 'DEPLOYED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReflectionType" AS ENUM ('WEEKLY_CHECKIN', 'DECISION', 'BLOCKER', 'OPPORTUNITY', 'PROJECT_NOTE', 'INTERVIEW_REFLECTION', 'APPLICATION_REFLECTION');

-- CreateEnum
CREATE TYPE "MemoryCategory" AS ENUM ('POSITIONING', 'PREFERENCE', 'CONSTRAINT', 'PROJECT', 'RESUME_RULE', 'JOB_SEARCH_RULE', 'PORTFOLIO_RULE', 'INTERVIEW_RULE');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('APPLY', 'PASS', 'TAILOR_RESUME', 'PRIORITIZE_PROJECT', 'ACCEPT_OFFER', 'REJECT_OFFER', 'PROJECT_FOCUS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "primary_headline" TEXT NOT NULL,
    "core_positioning" TEXT NOT NULL,
    "core_story" TEXT NOT NULL,
    "portfolio_tagline" TEXT,
    "linkedin_headline" TEXT,
    "target_roles" JSONB NOT NULL DEFAULT '[]',
    "bridge_roles" JSONB NOT NULL DEFAULT '[]',
    "skills" JSONB NOT NULL DEFAULT '[]',
    "credibility_rules" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_versions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResumeVersionType" NOT NULL,
    "content" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_analyses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role_title" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "source_url" TEXT,
    "salary_range" TEXT,
    "location" TEXT,
    "fit_classification" "FitClassification",
    "recommended_resume_version_id" TEXT,
    "skills_to_emphasize" JSONB NOT NULL DEFAULT '[]',
    "gaps" JSONB NOT NULL DEFAULT '[]',
    "tailored_summary" TEXT,
    "interview_talking_points" JSONB NOT NULL DEFAULT '[]',
    "recommendation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role_title" TEXT NOT NULL,
    "role_family" TEXT,
    "resume_version_id" TEXT,
    "job_analysis_id" TEXT,
    "date_applied" TIMESTAMP(3),
    "source" TEXT,
    "contact" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "follow_up_date" TIMESTAMP(3),
    "salary_range" TEXT,
    "link" TEXT,
    "notes" TEXT,
    "fit_classification" "FitClassification",
    "decision_reasoning" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "summary" TEXT,
    "problem" TEXT,
    "solution" TEXT,
    "stack" JSONB NOT NULL DEFAULT '[]',
    "role" TEXT,
    "career_signal" TEXT,
    "github_url" TEXT,
    "portfolio_url" TEXT,
    "next_milestone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "problem" TEXT,
    "solution" TEXT,
    "stack" TEXT,
    "architecture" TEXT,
    "challenges" TEXT,
    "outcome" TEXT,
    "next_steps" TEXT,
    "career_signal" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_stories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "application_id" TEXT,
    "title" TEXT NOT NULL,
    "situation" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "skills_demonstrated" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_reflections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reflection_type" "ReflectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mood" TEXT,
    "related_project_id" TEXT,
    "related_application_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_memories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" "MemoryCategory" NOT NULL,
    "source" TEXT,
    "confidence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_decisions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "decision_type" "DecisionType" NOT NULL,
    "context" TEXT NOT NULL,
    "options_considered" JSONB NOT NULL DEFAULT '[]',
    "decision" TEXT NOT NULL,
    "reasoning" TEXT,
    "tradeoffs" TEXT,
    "next_action" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategic_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_outputs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "output_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "related_project_id" TEXT,
    "related_application_id" TEXT,
    "related_job_analysis_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "career_profiles_user_id_key" ON "career_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "career_memories_user_id_key_key" ON "career_memories"("user_id", "key");

-- AddForeignKey
ALTER TABLE "career_profiles" ADD CONSTRAINT "career_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_analyses" ADD CONSTRAINT "job_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_analyses" ADD CONSTRAINT "job_analyses_recommended_resume_version_id_fkey" FOREIGN KEY ("recommended_resume_version_id") REFERENCES "resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resume_version_id_fkey" FOREIGN KEY ("resume_version_id") REFERENCES "resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_analysis_id_fkey" FOREIGN KEY ("job_analysis_id") REFERENCES "job_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_stories" ADD CONSTRAINT "interview_stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_stories" ADD CONSTRAINT "interview_stories_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_stories" ADD CONSTRAINT "interview_stories_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_reflections" ADD CONSTRAINT "career_reflections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_reflections" ADD CONSTRAINT "career_reflections_related_project_id_fkey" FOREIGN KEY ("related_project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_reflections" ADD CONSTRAINT "career_reflections_related_application_id_fkey" FOREIGN KEY ("related_application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_memories" ADD CONSTRAINT "career_memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_decisions" ADD CONSTRAINT "strategic_decisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_related_project_id_fkey" FOREIGN KEY ("related_project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_related_application_id_fkey" FOREIGN KEY ("related_application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_related_job_analysis_id_fkey" FOREIGN KEY ("related_job_analysis_id") REFERENCES "job_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
