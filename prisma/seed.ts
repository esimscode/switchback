// Seed data for the initial user profile (PRD §6, §11.6, §11.8).
// Idempotent: safe to re-run — everything upserts on stable unique keys.
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";

import { MemoryCategory, ProjectStatus } from "../src/generated/prisma/enums";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const TARGET_ROLES = [
  "Platform Engineer",
  "DevSecOps Engineer",
  "Cloud Engineer",
  "Infrastructure Automation Engineer",
  "Software Engineer, Platform",
  "Site Reliability Engineer",
  "Cloud Security Engineer",
  "AI Automation Engineer",
  "Internal Tools Developer",
  "Solutions Engineer",
  "Technical Consultant",
];

const BRIDGE_ROLES = [
  "Systems Engineer",
  "Linux Systems Administrator",
  "Cloud Support Engineer",
  "Technical Support Engineer II/III",
  "Network Administrator",
  "IT Automation Specialist",
  "Cybersecurity Intern",
  "SOC Analyst",
  "Security Analyst",
  "IT Security Support",
];

const SKILLS = [
  "Enterprise IT support",
  "Linux",
  "Windows",
  "Data center operations",
  "Networking",
  "Mobile device management",
  "Web development",
  "Workflow automation",
  "n8n",
  "Cloud systems",
  "WordPress and cloud hosting",
  "Cybersecurity education",
];

const CREDIBILITY_RULES = [
  "Do not invent experience.",
  "Do not invent metrics.",
  "Do not claim projects are complete when they are not.",
  "Do not claim production usage unless confirmed.",
  "Do not overstate technical depth.",
  "Do not claim Kubernetes, Terraform, CI/CD, production DevOps, enterprise cloud architecture, or security engineering experience unless explicitly confirmed.",
  "Use honest status labels: Planned, In Progress, Prototype, Implemented, Tested, Deployed, Completed.",
  "Prefer truthful, strong language over inflated language.",
  "Do not frame Eric as starting over. Frame him as specializing, compounding, and moving up the value chain.",
];

const RESUME_VERSIONS: { name: string; roleFamily: string }[] = [
  { name: "Master Resume", roleFamily: "Master" },
  { name: "Platform-DevSecOps Resume", roleFamily: "Platform / DevSecOps" },
  { name: "Cloud-Infrastructure Resume", roleFamily: "Cloud / Infrastructure" },
  { name: "Software-AI Automation Resume", roleFamily: "Software / AI Automation" },
  { name: "Cybersecurity Resume", roleFamily: "Cybersecurity" },
];

const PROJECTS: {
  name: string;
  slug: string;
  status: ProjectStatus;
  summary: string;
  stack: string[];
  careerSignal: string;
}[] = [
  {
    name: "Switchback",
    slug: "career-strategist-os",
    status: "IN_PROGRESS",
    summary:
      "A private AI-assisted career operating system (formerly Career Strategist OS): career profile, strategist chat, job analysis, application tracking, project-to-proof pipeline, reflections, and durable career memory.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Neon Postgres", "Prisma", "Eve"],
    careerSignal:
      "Full-stack product development, database modeling, and AI agent architecture in one flagship build.",
  },
  {
    name: "Multi-Agent Agency Operating System",
    slug: "multi-agent-agency-os",
    status: "IN_PROGRESS",
    summary:
      "An operating system for running an agency with coordinated AI agents handling delivery workflows.",
    stack: ["TypeScript", "AI agents"],
    careerSignal: "AI systems design and workflow orchestration.",
  },
  {
    name: "Client Portal / Agency Dashboard",
    slug: "client-portal-agency-dashboard",
    status: "IN_PROGRESS",
    summary:
      "A client-facing portal and internal dashboard for agency project delivery and communication.",
    stack: ["Next.js", "TypeScript"],
    careerSignal: "Product thinking and client-facing software delivery.",
  },
  {
    name: "n8n Automation & Deployment Workflows",
    slug: "n8n-automation-workflows",
    status: "IMPLEMENTED",
    summary:
      "Automation and deployment workflows built on n8n for business and client processes.",
    stack: ["n8n", "APIs", "Webhooks"],
    careerSignal: "Workflow automation and systems integration.",
  },
  {
    name: "WordPress / Cloud Hosting Recovery",
    slug: "wordpress-cloud-hosting-recovery",
    status: "COMPLETED",
    summary:
      "Recovered and stabilized WordPress sites and cloud hosting environments.",
    stack: ["WordPress", "Linux", "Cloud hosting", "DNS"],
    careerSignal: "Infrastructure troubleshooting and operational reliability.",
  },
  {
    name: "Live Cultr Client Work",
    slug: "live-cultr-client-work",
    status: "IN_PROGRESS",
    summary:
      "Ongoing web development, automation, and infrastructure work for Live Cultr clients.",
    stack: ["Web development", "Automation", "Hosting"],
    careerSignal: "Real client delivery across web, automation, and infrastructure.",
  },
];

const MEMORIES: { key: string; value: string; category: MemoryCategory }[] = [
  {
    key: "positioning-not-starting-over",
    value:
      "Eric does not want to be framed as starting over. Frame him as specializing, compounding, and moving up the value chain.",
    category: "POSITIONING",
  },
  {
    key: "target-role-families",
    value:
      "Eric is targeting platform, cloud, automation, and security roles.",
    category: "JOB_SEARCH_RULE",
  },
  {
    key: "prefers-practical-progress",
    value: "Eric prefers practical progress over generic advice.",
    category: "PREFERENCE",
  },
  {
    key: "no-overclaiming-rule",
    value:
      "Eric should not overclaim Kubernetes, Terraform, CI/CD, or production DevOps experience unless explicitly confirmed.",
    category: "RESUME_RULE",
  },
  {
    key: "product-feel",
    value:
      "Eric wants the product to feel like a trusted career strategist, not a generic consumer app.",
    category: "PREFERENCE",
  },
];

// Demo seed identity. Override with SEED_EMAIL / SEED_NAME / SEED_LOCATION —
// the intended first-run path for a fresh workspace is the onboarding
// conversation at /welcome, not this seed.
const SEED_EMAIL = process.env.SEED_EMAIL ?? "user@example.com";
const SEED_NAME = process.env.SEED_NAME ?? "Eric Sims";
const SEED_LOCATION = process.env.SEED_LOCATION ?? "Austin, TX";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: { name: SEED_NAME, location: SEED_LOCATION },
    create: {
      name: SEED_NAME,
      email: SEED_EMAIL,
      location: SEED_LOCATION,
    },
  });

  const profileData = {
    primaryHeadline:
      "Platform-focused software and infrastructure professional",
    corePositioning:
      "Eric Sims is a platform-focused software and infrastructure professional with 9+ years of experience across enterprise IT support, Linux and Windows environments, data center operations, networking, mobile device management, web development, automation, cloud systems, and cybersecurity education.",
    coreStory:
      "Eric understands infrastructure, builds software, automates workflows, and is growing into cloud, AI, security, and platform engineering.",
    portfolioTagline:
      "Building secure systems through code, cloud, AI, and infrastructure automation.",
    linkedinHeadline:
      "Building secure systems through code, cloud, AI, and infrastructure automation.",
    targetRoles: TARGET_ROLES,
    bridgeRoles: BRIDGE_ROLES,
    skills: SKILLS,
    credibilityRules: CREDIBILITY_RULES,
  };

  await prisma.careerProfile.upsert({
    where: { userId: user.id },
    update: profileData,
    create: { userId: user.id, ...profileData },
  });

  for (const rv of RESUME_VERSIONS) {
    await prisma.resumeVersion.upsert({
      where: {
        userId_roleFamily: { userId: user.id, roleFamily: rv.roleFamily },
      },
      update: { name: rv.name },
      create: { userId: user.id, name: rv.name, roleFamily: rv.roleFamily },
    });
  }

  for (const project of PROJECTS) {
    const { slug, ...data } = project;
    await prisma.project.upsert({
      where: { slug },
      update: data,
      create: { userId: user.id, slug, ...data },
    });
  }

  for (const memory of MEMORIES) {
    await prisma.careerMemory.upsert({
      where: { userId_key: { userId: user.id, key: memory.key } },
      update: { value: memory.value, category: memory.category },
      create: {
        userId: user.id,
        ...memory,
        source: "PRD seed data",
        confidence: "high",
      },
    });
  }

  console.log("Seed complete:", {
    user: user.email,
    resumeVersions: RESUME_VERSIONS.length,
    projects: PROJECTS.length,
    memories: MEMORIES.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
