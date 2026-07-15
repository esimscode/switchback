# Tasks: Reminder & Proactive Notification Layer

Ordered by dependency. Each task ≤ ~5 files, with acceptance + verification.
Spec: [`reminder-notification-layer.md`](./reminder-notification-layer.md) ·
Plan: [`reminder-notification-layer.plan.md`](./reminder-notification-layer.plan.md)

## Slice 1 — Reminders exist

- [ ] **T1 — Schema + migration**
  - Acceptance: `Reminder` model + `ReminderStatus` enum; `Application.followUpNotifiedAt`;
    `Notification` type values documented. Migration created and applied on the **dev**
    Neon branch; `prisma generate` run.
  - Verify: `npx prisma migrate dev --name reminders` succeeds on the dev branch;
    `npx tsc --noEmit` sees `prisma.reminder`.
  - Files: `prisma/schema.prisma` (+ generated client, migration SQL).
  - Note: before any prod deploy of later slices, run `npx prisma migrate deploy` on prod.

- [ ] **T2 — Agent tools + instructions**
  - Acceptance: `set_reminder`, `list_reminders`, `update_reminder`, `complete_reminder`
    tools per the `save_career_memory.ts` pattern (zod, `getUser()`); `instructions.md`
    teaches when to set/surface reminders.
  - Verify: `npx tsc --noEmit`; drive-through in strategist chat (set → list → update →
    complete) or a direct tool invocation.
  - Files: `agent/tools/{set,list,update,complete}_reminder.ts`, `agent/instructions.md`.

- [ ] **T3 — `/reminders` page + actions + nav**
  - Acceptance: page lists PENDING reminders (text, due date+time, link) with **Mark
    done** + **Snooze**; a collapsed **Done** section with **Clear completed** (deletes
    DONE/CANCELLED); nav entry under Workspace.
  - Verify: dev server — create a reminder (via T2 or seed), see it, mark done, snooze
    (reschedule), clear completed; responsive check.
  - Files: `src/app/(app)/reminders/page.tsx`, `.../reminders/actions.ts`,
    `src/components/app-sidebar.tsx`.

  **✅ Slice 1 checkpoint:** create → see → manage a reminder end-to-end. `tsc` + `lint` green.

## Slice 2 — In-app nudges (the scan)

- [ ] **T4 — Pure scan logic + tests + test runner**
  - Acceptance: `src/lib/reminders.ts` exports pure functions that, given reminders /
    applications + an injected `now`, return the due sets and the notification payloads,
    honoring `notifiedAt` / `followUpNotifiedAt` dedup. Minimal test runner added
    (`node:test` via `tsx`, `pnpm test`).
  - Verify: `pnpm test` — cases for due, not-yet-due, and already-notified (no re-emit).
  - Files: `src/lib/reminders.ts`, `src/lib/reminders.test.ts`, `package.json`.

- [ ] **T5 — Cron scan route**
  - Acceptance: `GET /api/cron/reminders` validates `Authorization: Bearer $CRON_SECRET`
    (401 otherwise); uses T4 logic to create notifications + set markers inside a
    transaction; returns a JSON summary of what was surfaced.
  - Verify: local `curl` with the secret against dev data → notifications created once;
    second run → none; missing/wrong secret → 401.
  - Files: `src/app/api/cron/reminders/route.ts`.

- [ ] **T6 — Cron schedule + secret**
  - Acceptance: `vercel.json` cron `0 14 * * *` → `/api/cron/reminders`; `CRON_SECRET`
    generated and set on **production + preview**.
  - Verify: `vercel.json` valid; `vercel env ls` shows `CRON_SECRET`; preview build green.
  - Files: `vercel.json` (+ Vercel env, outside the repo).

  **✅ Slice 2 checkpoint:** due reminders + follow-ups surface in the bell exactly once; route secured.

## Slice 3 — Out-of-app email digest

- [ ] **T7 — Resend client + digest builder + test**
  - Acceptance: `src/lib/email/resend.ts` sends via `RESEND_API_KEY`, **no-ops (logs)
    when unset**; `reminder-digest` builds subject + body (reminders + follow-ups with
    links) from due items; builder unit-tested.
  - Verify: `pnpm test` for the builder; a unit check that the client no-ops without a key.
  - Files: `src/lib/email/resend.ts`, `src/lib/email/reminder-digest.tsx`,
    `src/lib/email/reminder-digest.test.ts`.

- [ ] **T8 — Wire the digest into the scan**
  - Acceptance: after creating notifications, if ≥1 item is newly due **and** email is
    configured, send **one** digest to `user.email`; send failures are caught and logged
    (never break the scan); no email when nothing is newly due.
  - Verify: `curl` the route with due items → exactly one email to the owner; nothing
    due → none; `RESEND_API_KEY` unset → no-op.
  - Files: `src/app/api/cron/reminders/route.ts` (edit).

  **✅ Slice 3 checkpoint:** the full loop — agent sets a reminder → scan → bell + one email → `/reminders` shows/cleans.

## Done criteria (whole feature)

All spec Success Criteria pass; `tsc` + `lint` + `pnpm test` green; preview build green;
one end-to-end scan verification; `prisma migrate deploy` run on prod before merge deploy.
