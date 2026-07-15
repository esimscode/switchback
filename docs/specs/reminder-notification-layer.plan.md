# Plan: Reminder & Proactive Notification Layer

Spec: [`reminder-notification-layer.md`](./reminder-notification-layer.md) ·
Tasks: [`reminder-notification-layer.tasks.md`](./reminder-notification-layer.tasks.md) ·
Branch: `feat/reminder-notification-layer`

> Plan + tasks live here (not `tasks/plan.md` / `tasks/todo.md`) because those are the
> project's original build log and must not be clobbered.

## Approach

Three **vertical slices**, each independently valuable and verifiable, as ordered
commits on one branch → a single PR once all three are green (or merge per-slice if
preferred). Build in dependency order; stop at each slice's checkpoint before moving on.

## Component dependency graph

```
Schema (Reminder, ReminderStatus, Application.followUpNotifiedAt, Notification types)
  │  (foundation — everything depends on it)
  ├── Agent tools (set/list/update/complete)      ── Slice 1
  ├── /reminders page + actions                    ── Slice 1
  ├── Pure scan logic (src/lib/reminders.ts) ─┐
  │                                            ├── Cron route ── Slice 2
  │   Email module (resend + digest) ──────────┘        │
  └── ...                                       Cron config + CRON_SECRET ── Slice 2/3
```

Scan logic and the email module are leaf modules (pure, testable). The cron route is
the single integration point that composes schema + scan + email.

## Slices (ordered)

**Slice 1 — Reminders exist (create / see / manage).**
Schema + migration → agent tools → `/reminders` page. Delivers: the user can set a
reminder in chat and see/complete/clear it in-app. No auto-nudge yet.
*Checkpoint:* set a reminder via the strategist, see it on `/reminders`, mark done,
clear completed. `tsc` + `lint` green.

**Slice 2 — In-app nudges (the scan).**
Pure scan logic + unit tests → cron route (`CRON_SECRET`-guarded) → `vercel.json` cron
+ secret. Delivers: due reminders and due follow-ups surface in the bell, once each.
*Checkpoint:* `curl` the route against dev-branch data → items appear in the bell
exactly once; a second run creates none; a bad/absent secret → 401. `pnpm test` green.

**Slice 3 — Out-of-app email digest.**
Resend client (no-op-safe) + digest builder + builder test → wire the digest into the
cron. Delivers: one daily email when items are newly due.
*Checkpoint:* `curl` with due items → exactly one digest email to the owner; nothing
due → no email; `RESEND_API_KEY` unset → no-op, no error.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Double-nudge / spammy repeats | Set `notifiedAt` / `followUpNotifiedAt` atomically with notification creation; digest includes only *newly-surfaced* items; unit-test the dedup. |
| Prod migration ordering | Run `prisma migrate deploy` on **prod** before deploying schema-dependent code (per the dev-branch DB workflow); the schema task calls this out. |
| Email failure breaks the scan | Wrap the Resend send in try/catch, log and continue; scan never depends on email success; graceful no-op when `RESEND_API_KEY` is absent. |
| Cron auth | Vercel injects `Authorization: Bearer $CRON_SECRET` on cron requests when `CRON_SECRET` is set; the route validates it. Generate + set `CRON_SECRET` (prod + preview) before relying on it. |
| DST drift (`0 14 * * *` = 9am CDT / 8am CST) | Documented in the spec; accepted. |
| eve tool auto-discovery | New `agent/tools/*.ts` are convention-registered; verify the agent picks them up at the Slice 1 checkpoint. |
| Config format | Use `vercel.json` for the single cron (zero new deps) rather than `vercel.ts` + `@vercel/config`. |

## Verification checkpoints

Per-slice checkpoints above, plus a final end-to-end: agent sets a reminder → daily
scan surfaces it → bell + one email → `/reminders` shows and then clears it. `tsc`,
`lint`, and `pnpm test` stay green throughout; each slice's PR gets a Vercel preview
build + one `curl` scan verification.

## PR strategy

One branch (`feat/reminder-notification-layer`), per-slice commits, **single PR** when
all slices are verified (spec + plan + tasks + code together). Stop for review now (end
of Phase 2) and again before merge. Per-slice PRs available if you'd rather review
incrementally.
