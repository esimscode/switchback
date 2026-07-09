# Switchback — Build Checklist

> Built under the working title "Career Strategist OS"; renamed to **Switchback** post-MVP (2026-07-08). Historical references below are unedited.

See `tasks/plan.md` for full context, acceptance criteria, and risks.

## Milestone 0 — Scaffold & Plumbing
- [x] git init + create-next-app (TS, Tailwind, App Router, src dir)
- [x] shadcn/ui init + base components (radix base, nova preset, 17 components)
- [x] Prisma 7 installed; Neon project `career-strategist-os` created (org: Eric Sims); DATABASE_URL + DIRECT_URL wired; `select 1` verified
- [x] Eve 0.20 installed; withEve() in next.config.ts; minimal agent/ compiles clean (`eve info`: 0 diagnostics)
- [x] AI_GATEWAY_API_KEY configured; live model reply verified via POST /eve/v1/session
- [x] App shell: sidebar layout, stubbed routes (/dashboard /career-profile /chat /jobs /applications /projects /reflections /memories /settings)
- [x] Verify: pnpm build clean; Eve session routing works end-to-end
- [x] Dark mode: next-themes + toggle in sidebar footer (browser-verified both themes)
- [x] Font fix: --font-sans now maps to Geist (was circular var → serif fallback)

## Milestone 1 — Data Foundation
- [x] Prisma schema (12 models incl. users, 8 enums) migrated to Neon
- [x] Idempotent seed: Eric profile, 5 resume versions, 6 projects, 5 memories, credibility rules (verified re-runnable)
- [x] Career Profile page (view + edit form via server actions)
- [x] Applications table (create dialog, inline status select) + Projects cards + resume versions on profile
- [x] DESIGN.md applied at theme layer: black/white editorial core, hairline borders, pastel block tokens, pill buttons, 24px cards, mono eyebrow utility
- [ ] Project statuses in seed are my conservative guesses — Eric to review/correct in UI

## Milestone 2 — Eve Agent Spike
- [x] Strategist instructions.md (persona, credibility rules, boundaries, tool guidance)
- [x] Tools: get_career_profile, list_resume_versions, create_reflection (Prisma via agent/lib/db.ts, relative imports — no tsconfig alias)
- [x] Chat page: useEveAgent, tool chips, markdown replies, suggested prompts, localStorage session persistence
- [x] Verified in browser: profile answer grounded in DB data, credibility framing honored, reflection persisted to Neon, chat survives reload

## Milestone 3 — Job Analysis Workflow
- [x] /jobs/new form (pending state), /jobs list with fit cards, /jobs/[id] detail (pastel fit badge per DESIGN.md)
- [x] Form path: server action → eve client SDK session with zod outputSchema → typed analysis persisted (analysis logic stays in the agent)
- [x] Chat path tools: create_job_analysis, create_application
- [x] Skills: analyze-job, recommend-resume, tailor-resume (load-on-demand)
- [x] Resume recommendation with reasoning inside analysis; one-click analysis → application conversion
- [x] Adversarial credibility test passed: K8s/Terraform/CI-CD posting → stretch fit, requirements flagged as gaps, explicit "do not add to resume" guidance

## Milestone 4 — Project Asset Pipeline
- [x] /projects/[id] detail page (status, stack, sections, case studies, agent outputs) + /projects/[id]/edit + New Project dialog; cards link to detail
- [x] Tools: list_projects, create_project_case_study; skills: build-case-study, create-linkedin-post
- [x] Generate buttons → eve sessions with output schemas: case study draft (persisted DRAFT), next milestone (updates project + logs agent_output), LinkedIn post (agent_outputs)
- [x] Bonus: /jobs/new can now fetch a posting from a URL via the agent's web tools (pasting stays primary)
- [x] Verified: case study outcome capped at "In Progress" status; milestone suggestion = publish repo + README (matches M6 plan)
- [ ] Perf note for M6: generation actions serialize per page and can take minutes — consider streaming status or a faster model for structured drafts

## Milestone 5 — Reflection + Memory
- [x] /reflections: chronological log, type filter pills, project/application links, create dialog
- [x] /memories: cards with mono keys + category badges, filters, add/edit dialogs, two-step delete
- [x] Tools: retrieve_career_memories, save_career_memory, create_strategic_decision, update_application_status (id or company match), update_career_profile (partial, confirm-first); create_reflection now links entities
- [x] Memory-aware instructions: retrieve at conversation start, save with confirmation, stable kebab keys
- [x] Verified: "remember this" → 3 well-keyed memories saved; fresh session then rejected a Denver role on salary floor + no-relocation + remote preference (test memories cleaned after)

## Milestone 6 — Dashboard & Portfolio Polish
- [x] /dashboard: lime focus block (DESIGN.md), heuristic suggested-next-action, quick actions, active applications, projects needing momentum, recent reflections, target roles
- [x] Settings page: environment status, workspace data counts, memory admin pointer
- [x] Remaining PRD skills: prepare-interview, weekly-review, reflection-checkin, audit-github-repo (9 total)
- [x] schedules/weekly-career-review.md — Monday 9am cron via eve schedule
- [x] Empty states on all list pages + root loading skeleton
- [x] README: screenshots, module table, credibility story, architecture summary
- [x] docs/architecture.md: mermaid diagram, two agent paths, credibility layers, known limitations
- [x] Self-referential case study exists (drafted by the agent in M4)
- [x] Retina screenshots via Playwright in docs/screenshots/

## Milestone 7 — Animated Conversational Onboarding
- [x] Route-group refactor: workspace pages under (app)/ with sidebar layout + first-run redirect; / routes by user count
- [x] /welcome three acts: mark draws itself (motion pathLength) → strategist interview → lime "Bearings set." arrival → dashboard
- [x] Agent: onboarding skill (5-7 turn interview, honest composition, confirm-before-save) + create_career_profile tool (user + profile + 5 resume versions + constraint memories; refuses if a user exists)
- [x] Interview/arrival animations are CSS-driven (tw-animate-css) — rAF/motion animations freeze in background tabs (this also hung AnimatePresence exit; removed)
- [x] E2E on a disposable Neon branch (br-crimson-frog-adbt786j, auto-expires 2026-07-10): fictional user onboarded end-to-end — profile, Spark/Kafka credibility rule, remote-only memory, 5 resume versions all persisted; production env restored after
