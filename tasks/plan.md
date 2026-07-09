# Implementation Plan: Career Strategist OS (MVP)

> Historical document — the product was renamed **Switchback** after the MVP shipped (2026-07-08).

## Context

Eric is repositioning his career into platform/cloud/security/AI roles and wants Career Strategist OS — a private, AI-assisted career operating system — built as a **flagship portfolio project**. The full spec is `career-strategist-os-prd.md` (PRD v2). The directory is greenfield: only the PRD exists, no git repo yet.

The MVP is a single-user workspace: career profile, Eve-powered strategist chat, job analysis, resume recommendation, application tracker, project→asset pipeline, reflection log, and career memory. Credibility protection (honest status labels, no overclaiming Kubernetes/Terraform/CI-CD/etc.) is a hard product requirement baked into seed data and agent instructions.

**Decisions confirmed with Eric:**
- Model access: **Vercel AI Gateway** (`AI_GATEWAY_API_KEY` or `vercel link` OIDC). Note: Claude Code/Codex subscriptions cannot serve as app API credentials. "Bring your own provider" is a documented future enhancement.
- Database: **create a new Neon project** via the connected Neon MCP during setup.
- Pacing: **checkpoint after every milestone** — stop, demo the running app, get steer before continuing.

## Architecture Decisions

Verified against Eve v0.20.0 bundled docs (downloaded to scratchpad; will re-read from `node_modules/eve/docs/` once installed):

- **One project, one deploy**: Next.js App Router (TypeScript, Tailwind, shadcn/ui) with Eve mounted via `withEve()` in `next.config.ts`. Agent lives in `agent/` at the project root. `npm run dev` boots both; browser talks only to the Next.js origin — no CORS, no URL env vars.
- **Prisma + Neon** (PRD's default recommendation). Schema = the 11 models in PRD §12. Idempotent seed script loads Eric's positioning data from PRD §6.
- **Eve authored surface** (per PRD §9, adapted to Eve's real layout):
  - `agent/instructions.md` — strategist persona from PRD §9 draft (credibility rules, no-therapy boundary)
  - `agent/agent.ts` — `defineAgent({ model: "anthropic/claude-sonnet-5" })` via Gateway
  - `agent/tools/*.ts` — `defineTool` + Zod, snake_case filenames become tool names; tools run in the app runtime with `process.env`, so they call Prisma directly
  - `agent/skills/*.md` — analyze-job, recommend-resume, tailor-resume, build-case-study, etc.
  - Subagents and schedules are **post-MVP polish** (Milestone 6+); a strong root agent with skills covers MVP acceptance criteria without over-engineering
- **Chat UI**: `useEveAgent` from `eve/react`; persist stream events + session cursor (per Eve's resumable-sessions pattern) so conversations survive reload — via `agent_outputs`-adjacent table or localStorage first, DB later.
- **DB access from tools**: shared Prisma client in `lib/db.ts` at project root, imported by both Next.js server code and agent tools. Risk: Eve's bundler may want agent imports under `agent/lib/` — verify at Milestone 2 spike with `eve info`; fallback is a thin re-export at `agent/lib/db.ts`.
- **Auth**: none in MVP. Eve's default channel is fail-closed (`vercelOidc()` + `localDev()`), which is exactly right for a single-user local app. PRD §20 non-goals respected throughout.
- **Tooling**: pnpm, Node 24 (installed: 24.11.0). Git init at Milestone 0; commit at each milestone checkpoint; push to GitHub only when Eric asks.

## Milestones

Vertical slices; each ends with the app in a working, demoable state. First implementation act of M0: copy this plan into the repo as `tasks/plan.md` + checklist `tasks/todo.md` (also good portfolio hygiene).

### Milestone 0 — Scaffold & Plumbing
1. `git init`; `create-next-app` (App Router, TS, Tailwind, src dir); add shadcn/ui; commit baseline.
2. Add Prisma; create Neon project **career-strategist-os** via Neon MCP; wire `DATABASE_URL` into `.env` (gitignored) + `.env.example`.
3. Add Eve: `pnpm add eve@latest ai zod`; `withEve()` in `next.config.ts`; minimal `agent/instructions.md` + `agent/agent.ts`; set up `AI_GATEWAY_API_KEY` (pause for Eric to paste key or `vercel link`).
4. Base app shell: sidebar layout with the PRD §13 routes stubbed (`/dashboard`, `/career-profile`, `/chat`, `/jobs`, `/applications`, `/projects`, `/reflections`, `/memories`, `/settings`).

**Acceptance:** `pnpm dev` serves shell + boots Eve; smoke-test agent via `POST /eve/v1/session` returns a reply; `pnpm build` clean.

### Milestone 1 — Data Foundation
1. Prisma schema: all 11 PRD §12 models with enums for statuses/types/categories; migrate to Neon.
2. Seed script: Eric's user + career profile (PRD §6), 5 resume version stubs, 6 project seeds (PRD §11.6), credibility rules; idempotent (upsert).
3. Career Profile page: view + edit form (server actions).
4. Applications page: table with status badges + manual create/edit. Projects page: cards with status labels. Resume versions list (on profile or settings).

**Acceptance:** PRD §11.1 criteria — profile viewable/editable, seed data loads; applications and projects CRUD works against Neon.

### Milestone 2 — Eve Agent Spike (prove agent ↔ DB)
1. Full strategist `instructions.md` (persona, credibility rules, boundaries).
2. Tools: `get_career_profile`, `list_resume_versions`, `create_reflection` — Prisma-backed, Zod-validated.
3. Chat page: `useEveAgent`, message list, tool-call result rendering, suggested prompts, session persistence across reload.

**Acceptance:** PRD Milestone 2 criteria — chat answers questions about the profile using the tool, and can save a reflection that appears on `/reflections`. This milestone de-risks the whole agent layer; verify `eve info` discovery + shared Prisma import here.

### Milestone 3 — Job Analysis Workflow
1. `/jobs/new` paste form; `/jobs` list; `/jobs/[id]` detail with fit-classification badge.
2. Tools: `analyze_job_post` (returns structured analysis), `create_job_analysis` (persists), `create_application` (convert analysis → application). Skills: `analyze-job.md`, `recommend-resume.md`, `tailor-resume.md`.
3. Resume recommendation rendered inside the analysis (PRD §11.4: version, why, emphasize, don't-overclaim, tailored summary/bullets).

**Acceptance:** PRD §11.3 criteria — paste job → structured saved analysis → one-click application entry; recommendation never invents experience.

### Milestone 4 — Project Asset Pipeline
1. `/projects/[id]` detail: status, career signal, next milestone, linked assets.
2. Tools: `list_projects`, `create_project_case_study`; skill `build-case-study.md`; agent identifies smallest useful next milestone; LinkedIn-post draft via `create-linkedin-post.md` skill saved to `agent_outputs`.

**Acceptance:** PRD §11.6 criteria — open project → agent drafts case study + next milestone, both persisted and visible.

### Milestone 5 — Reflection + Memory Layer
1. `/reflections`: chronological log, type filter, links to applications/projects; manual create.
2. `/memories`: view/edit/delete with category filters.
3. Tools: `retrieve_career_memories`, `save_career_memory` (agent confirms before saving), `create_strategic_decision`, `update_application_status`, `update_career_profile`. Seed example memories from PRD §11.8. Agent retrieves memories at conversation start (instructions-driven).

**Acceptance:** PRD §11.7–11.8 criteria — agent references durable memory in chat; reflections link to entities.

### Milestone 6 — Dashboard, Polish & Portfolio Readiness
1. `/dashboard`: current focus, target roles, active applications, projects needing momentum, recent reflections, suggested next action, quick actions.
2. Empty states, loading states, consistent badges, calm visual identity (PRD §5 product feeling) — use `frontend-design` skill.
3. README (PRD §19 draft + real screenshots), architecture notes/diagram, `.env.example`, self-referential case study seeded (project #1 *is* this app).
4. Optional stretch if time: `weekly-review` skill + `schedules/weekly-career-review.md`, subagent split.

**Acceptance:** PRD §21 success criteria pass end-to-end; repo is presentable as a portfolio piece.

## Verification (every milestone)

- `pnpm build` + `tsc --noEmit` clean.
- Eve smoke: `npx eve dev --no-ui`, then session create/stream/follow-up over HTTP for new tools.
- Browser walkthrough of the milestone's user story via Claude-in-Chrome (screenshots at M6).
- Seed re-run is idempotent; Prisma migrations apply cleanly to Neon.
- Milestone git commit + demo checkpoint with Eric before proceeding.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Eve is in preview (v0.20); APIs may differ from assumptions | High | Docs bundled in package match installed version exactly; pin version; M2 spike de-risks agent↔DB early |
| Shared Prisma import from agent tools may hit Eve bundling limits | Med | Verify at M2 with `eve info`; fallback re-export under `agent/lib/` |
| `AI_GATEWAY_API_KEY` not yet provisioned | Med | M0 pauses at a clear step for Eric; everything else proceeds without it |
| Agent overclaims experience despite instructions | Med | Credibility rules in instructions + seed data + tool descriptions; test with adversarial prompts at M3 |
| Scope creep vs PRD §20 non-goals | Low | Milestone checkpoints; subagents/schedules deferred to M6 stretch |

## Future Enhancements (explicitly not MVP)
- Pluggable model providers so users pick what's affordable (Eric's idea — document in README roadmap)
- Vercel deploy, auth (Clerk), multi-user — PRD §20
