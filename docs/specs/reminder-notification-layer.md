# Spec: Reminder & Proactive Notification Layer

Status: **REVIEW — decisions resolved** · Owner: Eric · Date: 2026-07-15

## Objective

Give the Switchback strategist the ability to remember and act **across time**. Today
the agent only responds when asked or on fixed schedules (`job-sourcing`,
`weekly-career-review`); there is no way for it — or the user — to say "poke me
about this later." This layer adds:

- **Ad-hoc reminders** the agent can set from chat ("check the LinkedIn post in 3
  days", "follow up with that recruiter Friday", "prep before Thursday's interview").
- **Follow-up surfacing** for applications whose `followUpDate` has arrived (stored
  today, nudged by nothing).
- **Out-of-app reach** via a daily email digest, because in-app-only can't reach the
  user when they're not in the app — the actual gap the strategist flagged.

Single user today (Eric). **Success:** the agent can create/list/update/complete
reminders; due reminders and due follow-ups reliably surface in the existing
notification bell **and** a daily email digest, each **exactly once**; completed
reminders don't clutter the workspace; nothing breaks the core strategy flow, and a
self-hoster without email still gets in-app nudges.

**Non-goals (v1):** agent-triggered *actions* on the due date (reminders nudge the
user only — decided); minute-precise firing (see Timing decision); calendar/ICS/Google
integration; multi-tenant delivery; social/traffic metrics; SMS/push.

## Tech Stack

- Next.js 16 App Router, TypeScript, Prisma + Neon Postgres.
- eve agent (`agent/tools/*`, `agent/instructions.md`), Sonnet.
- Vercel Cron (deterministic daily scan) on Fluid Compute.
- **Resend** for transactional email — wired via the Vercel integration:
  `RESEND_API_KEY` + `RESEND_EMAIL_DOMAIN` (= `switchback.careers`, DNS verified) are
  already in Production/Preview/Development.
- Reuses the existing `Notification` model + polling bell
  (`notification-bell.tsx`, `notification-actions.ts`).

## Resolved Decisions (from review)

1. **Email:** Resend via the Vercel integration; from-address
   `Switchback <notify@${RESEND_EMAIL_DOMAIN}>` (switchback.careers, no subdomain for now).
2. **In-app surface:** a dedicated `/reminders` page. **Cleanup is a requirement:**
   the page shows PENDING by default; completed/cancelled reminders are tucked into a
   collapsed "Done" section with a **Clear completed** action so old ones never
   clutter the space.
3. **Digest time:** **9:00 AM America/Chicago** → cron `0 14 * * *` (14:00 UTC during
   CDT). Note the DST caveat: Vercel crons run in fixed UTC, so this lands at 8am
   during CST (winter) — acceptable; documented, revisit only if it matters.
4. **Editing:** include an `update_reminder` tool (reschedule / snooze / edit text),
   usable by the agent or surfaced as a "snooze" on the page.
5. **Timing:** `dueDate` stores **full date + time** (so "interview at 2pm" is captured
   and displayed), but v1 **nudges at the daily 9am scan on the due date** — a
   morning-of prep nudge, not last-minute. Minute-precise firing (frequent cron on
   Pro, or Vercel Queues/Workflow) is a documented future upgrade if ever needed.

## Data Model (Prisma)

```prisma
enum ReminderStatus {
  PENDING
  DONE
  CANCELLED
}

model Reminder {
  id         String         @id @default(cuid())
  userId     String         @map("user_id")
  text       String
  dueDate    DateTime       @map("due_date")   // full date + time
  link       String?
  status     ReminderStatus @default(PENDING)
  source     String?        // "strategist chat" | "user"
  notifiedAt DateTime?      @map("notified_at") // set when surfaced → dedup
  createdAt  DateTime       @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, dueDate])
  @@map("reminders")
}
```

Changes to existing models:
- `Application` gains `followUpNotifiedAt DateTime? @map("follow_up_notified_at")` so a
  due follow-up nudges once; **reset to null** whenever the agent changes `followUpDate`
  (so a rescheduled follow-up nudges again on the new date).
- `Notification.type` gains string values `"reminder_due"` and `"followup_due"` (the
  column is a free-form `String` today — no enum migration).

## The Scan (deterministic, no LLM)

A single daily Vercel Cron hits `GET /api/cron/reminders`, guarded by a `CRON_SECRET`
bearer token. It calls pure logic in `src/lib/reminders.ts`:

1. **Reminders:** `status = PENDING AND dueDate <= now AND notifiedAt IS NULL`
   → create a `Notification` (`type: "reminder_due"`, `title: reminder.text`,
   `href: reminder.link`) and set `reminder.notifiedAt = now`.
2. **Follow-ups:** active `Application` with `followUpDate <= now AND
   followUpNotifiedAt IS NULL` → `Notification` (`type: "followup_due"`,
   `title: "Follow up: {company} — {roleTitle}"`, `href: "/applications"`) and set
   `followUpNotifiedAt = now`.
3. **Digest:** if step 1/2 surfaced ≥1 *new* item **and** email is configured, send
   **one** Resend digest listing them. Only newly-surfaced items are included, so a
   re-run the same day sends nothing further (idempotent).

Schedule: `0 14 * * *` (9am America/Chicago in summer). The `notifiedAt` /
`followUpNotifiedAt` markers guarantee each item nudges **exactly once**.

## Email (Resend)

- Uses `RESEND_API_KEY` + `RESEND_EMAIL_DOMAIN` (already provisioned). Recipient =
  `user.email` (single user; `ALERT_EMAIL` env override reserved for later).
- **One digest email** when there are newly-due items — subject e.g. "Your Switchback
  nudges", body lists reminders + follow-ups with links. Plain, on-brand, no marketing.
  **No email when nothing is due.**
- **Graceful degradation:** if `RESEND_API_KEY` is unset (self-host), the scan skips
  email and in-app nudges still work — no thrown error. Email failures are logged,
  never block the scan or the chat flow.

## Agent Surface

New tools (follow `agent/tools/save_career_memory.ts` — `defineTool`, zod, `getUser()`):
- `set_reminder(text, dueDate: ISO datetime, link?)` — create; confirm the date/time
  unless the user explicitly asked to be reminded.
- `list_reminders(status?)` — read pending/all.
- `update_reminder(id, dueDate?, text?, link?)` — reschedule / snooze / edit.
- `complete_reminder(id)` — mark `DONE` (also cancels).

`agent/instructions.md`: set a reminder on "remind me / follow up / check back / in N
days / before <event>"; when listing applications, proactively call out follow-ups
already due.

Example (matches existing tool style):

```ts
export default defineTool({
  description:
    "Set a reminder to nudge the user on a future date/time. Confirm the timing unless the user explicitly asked to be reminded.",
  inputSchema: z.object({
    text: z.string().min(1).max(280),
    dueDate: z.string().describe("ISO date or datetime, e.g. 2026-07-18 or 2026-07-18T14:00"),
    link: z.string().url().optional(),
  }),
  async execute({ text, dueDate, link }) {
    const user = await getUser();
    await prisma.reminder.create({
      data: { userId: user.id, text, dueDate: new Date(dueDate), link, source: "strategist chat" },
    });
    return { saved: true, dueDate, viewAt: "/reminders" };
  },
});
```

## In-app Surface (`/reminders`)

- The **notification bell** needs no change — new types render identically.
- A `/reminders` page: **Pending** reminders listed (text, due date/time, link),
  each with **Mark done** and **Snooze** (reschedule). Completed/cancelled reminders
  live in a collapsed **Done** section with a **Clear completed** action (deletes
  `DONE`/`CANCELLED`) — cleanup so the space stays uncluttered.
- Server actions in `notification-actions.ts` style; a nav entry under Workspace.

## Project Structure (new / changed)

```
prisma/schema.prisma                         # Reminder model, ReminderStatus, Application.followUpNotifiedAt
agent/tools/set_reminder.ts                  # agent: create
agent/tools/list_reminders.ts                # agent: read
agent/tools/update_reminder.ts               # agent: reschedule/snooze/edit
agent/tools/complete_reminder.ts             # agent: complete/cancel
agent/instructions.md                        # when to set reminders
src/lib/reminders.ts                         # pure scan logic (due set + dedup) — testable
src/lib/reminders.test.ts                    # unit tests for the scan
src/lib/email/resend.ts                      # Resend client (no-op if unconfigured)
src/lib/email/reminder-digest.tsx            # digest template + builder
src/app/api/cron/reminders/route.ts          # CRON_SECRET-guarded scan endpoint
vercel.ts                                    # cron: 0 14 * * * → /api/cron/reminders
src/app/(app)/reminders/page.tsx             # in-app list + actions
src/app/(app)/reminders/actions.ts           # complete / snooze / clear-completed
```

## Code Style

Matches the codebase: `defineTool` + zod for agent tools; `@map(snake_case)` DB
columns; `getUser()` for the current user; server actions in `notification-actions.ts`
style; pure logic in `src/lib/*`, unit-tested separately from I/O.

## Testing Strategy

The app has **no test runner today**; this feature establishes a minimal one
(`node:test` via `tsx`, mirroring `video/`), scoped to pure logic:
- `src/lib/reminders.ts` — given fixture reminders/applications + an injected `now`,
  returns the correct due set and respects `notifiedAt` / `followUpNotifiedAt` dedup.
- Digest builder — given due items, produces the expected subject/line items.
- **Manual/integration:** run the cron route locally against dev-branch seed data;
  assert notifications created once, a second run creates none, exactly one email
  sends; drive the agent tools through a strategist chat (set → list → snooze →
  complete → clear).

## Boundaries

- **Always:** migrate on the dev Neon branch first, then `prisma migrate deploy` on
  prod before pushing schema-dependent code; typecheck + lint + unit tests before
  commit; `CRON_SECRET`-guard the route; degrade gracefully when email is unconfigured;
  scan + notifications idempotent (never double-nudge).
- **Ask first:** enabling the cron on prod; any change to the `Notification` model
  *shape* (adding string types is fine); confirming `CRON_SECRET` is set in Vercel.
- **Never:** commit `RESEND_API_KEY` / `CRON_SECRET`; email anyone but the account
  owner; re-notify an already-notified item; let an email failure break the scan or
  chat; run the scan through the LLM.

## Success Criteria

1. Agent `set_reminder` persists a reminder with date+time; it appears on `/reminders`.
2. A reminder with `dueDate <= now` surfaces in the bell **exactly once**; a second
   scan the same day creates no duplicate.
3. An application with `followUpDate <= now` surfaces **exactly once**; changing
   `followUpDate` later lets it nudge again on the new date.
4. When ≥1 item is newly due and email is configured, **exactly one** digest email
   reaches the owner with correct links; when nothing is due, **no** email is sent.
5. With `RESEND_API_KEY` unset, in-app nudges still work and no error is thrown.
6. The cron route rejects any request without the correct `CRON_SECRET`.
7. `/reminders` lists pending by default; **Clear completed** removes done/cancelled.
8. `npx tsc --noEmit`, `pnpm lint`, and `pnpm test` all pass.

## Future (documented, out of v1 scope)

- **Minute-precise firing** for time-of-day reminders: switch the scan to a frequent
  cron (Vercel Pro) or delay-schedule each reminder via Vercel Queues/Workflow.
- Agent-triggered *actions* on the due date (re-check GitHub stats, draft the
  follow-up) rather than only nudging the user.
- Calendar (ICS export / Google) and multi-tenant delivery.
