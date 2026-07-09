import type {
  ApplicationStatus,
  ContentStatus,
  FitClassification,
  MemoryCategory,
  ProjectStatus,
  ReflectionType,
  ResumeVersionType,
} from "@/generated/prisma/enums";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  PROTOTYPE: "Prototype",
  IMPLEMENTED: "Implemented",
  TESTED: "Tested",
  DEPLOYED: "Deployed",
  COMPLETED: "Completed",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  FOLLOW_UP_NEEDED: "Follow-up needed",
  INTERVIEWING: "Interviewing",
  REJECTED: "Rejected",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  PASSED: "Passed",
};

export const FIT_CLASSIFICATION_LABELS: Record<FitClassification, string> = {
  STRONG_FIT: "Strong fit",
  STRETCH_FIT: "Stretch fit",
  BRIDGE_ROLE: "Bridge role",
  NOT_WORTH_IT: "Not worth it",
};

export const RESUME_VERSION_TYPE_LABELS: Record<ResumeVersionType, string> = {
  MASTER: "Master",
  PLATFORM_DEVSECOPS: "Platform / DevSecOps",
  CLOUD_INFRASTRUCTURE: "Cloud / Infrastructure",
  SOFTWARE_AI: "Software / AI Automation",
  CYBERSECURITY: "Cybersecurity",
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  READY: "Ready",
  PUBLISHED: "Published",
};

export const REFLECTION_TYPE_LABELS: Record<ReflectionType, string> = {
  WEEKLY_CHECKIN: "Weekly check-in",
  DECISION: "Decision",
  BLOCKER: "Blocker",
  OPPORTUNITY: "Opportunity",
  PROJECT_NOTE: "Project note",
  INTERVIEW_REFLECTION: "Interview reflection",
  APPLICATION_REFLECTION: "Application reflection",
};

export const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  POSITIONING: "Positioning",
  PREFERENCE: "Preference",
  CONSTRAINT: "Constraint",
  PROJECT: "Project",
  RESUME_RULE: "Resume rule",
  JOB_SEARCH_RULE: "Job search rule",
  PORTFOLIO_RULE: "Portfolio rule",
  INTERVIEW_RULE: "Interview rule",
};

// Prisma Json columns hold string arrays for roles/skills/rules.
export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
