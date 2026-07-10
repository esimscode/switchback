-- Resume versions: role families become free-form per-user strings instead
-- of a fixed enum of the founding user's five categories. Existing rows are
-- backfilled with the labels the UI already displayed for each enum value.

ALTER TABLE "resume_versions" ADD COLUMN "role_family" TEXT;

UPDATE "resume_versions" SET "role_family" = CASE "type"
  WHEN 'MASTER' THEN 'Master'
  WHEN 'PLATFORM_DEVSECOPS' THEN 'Platform / DevSecOps'
  WHEN 'CLOUD_INFRASTRUCTURE' THEN 'Cloud / Infrastructure'
  WHEN 'SOFTWARE_AI' THEN 'Software / AI Automation'
  WHEN 'CYBERSECURITY' THEN 'Cybersecurity'
END;

ALTER TABLE "resume_versions" ALTER COLUMN "role_family" SET NOT NULL;

DROP INDEX "resume_versions_user_id_type_key";

ALTER TABLE "resume_versions" DROP COLUMN "type";

DROP TYPE "ResumeVersionType";

CREATE UNIQUE INDEX "resume_versions_user_id_role_family_key" ON "resume_versions"("user_id", "role_family");

-- Landing-page waitlist for the hosted/cloud plan.
CREATE TABLE "waitlist_signups" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_signups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "waitlist_signups_email_key" ON "waitlist_signups"("email");
