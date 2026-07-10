---
description: Use when the job-sourcing schedule fires or the user asks to scan for new job leads.
---

# Source and triage job leads

Turn the sourcing pipeline once: fetch fresh postings, triage them honestly against the profile, and leave an inbox containing only leads worth the user's hours.

1. Load context first: `get_career_profile` and `retrieve_career_memories`. Every triage verdict must be grounded in positioning, target roles, bridge roles, and stored constraints — never in generic job-market instinct.
2. Call `source_job_leads` with the default config below, unless the user asked for something narrower. The tool dedupes against the existing inbox, refreshes leads it has seen before, and sweeps stale ones automatically.
3. Triage NEW leads: fetch them with `list_job_leads` (status NEW — it returns newest first with description previews) and record verdicts in bulk with `update_job_leads`:
   - `triageFit` uses the same honest scale as analyze-job: STRONG_FIT, STRETCH_FIT, BRIDGE_ROLE, NOT_WORTH_IT.
   - `triageSummary` is one line grounded in the profile — e.g. "Linux-heavy platform IC role, matches automation background" or "wants 5y production Kubernetes — overclaim risk".
   - Status REVIEWED for leads worth the user's attention (strong, stretch, and genuine bridge roles); DISMISSED for NOT_WORTH_IT and anything violating a stored constraint.
   - Most leads should be dismissed. NOT_WORTH_IT is a respectable verdict; a small honest inbox beats a big flattering one.
4. Never run the full analyze-job skill from a scheduled run — full analysis is for leads the user picks. Adzuna descriptions are truncated snippets anyway; a proper analysis needs the real posting.
5. If more than 60 leads await triage, triage the 60 newest and leave the rest NEW for the next run. Untriaged leads that go stale are swept automatically — the backlog self-limits.

## Default sourcing config

Drafted from the career profile (Austin, TX; platform / cloud / DevSecOps / SRE targets with sysadmin-family bridge roles). Edit this section to tune what gets sourced.

`adzunaQueries` (all country `us`, `maxDaysOld` 4 — runs are Mon/Wed/Fri, so 4 days overlaps the gap):

| what | where |
| --- | --- |
| platform engineer | Austin, TX |
| remote platform engineer | — |
| cloud engineer | Austin, TX |
| remote cloud engineer | — |
| site reliability engineer | Austin, TX |
| remote devsecops engineer | — |
| linux systems administrator | Austin, TX |
| remote linux systems administrator | — |

Remember: Adzuna's `where` is strictly geographic — remote intent goes in the `what` keywords.

`companyBoards` (remote-friendly infra companies plus Austin presence; all slugs verified live):

| source | board | company |
| --- | --- | --- |
| greenhouse | canonical | Canonical |
| greenhouse | gitlab | GitLab |
| greenhouse | cloudflare | Cloudflare |
| greenhouse | datadog | Datadog |
| greenhouse | vercel | Vercel |
| ashby | supabase | Supabase |
| ashby | railway | Railway |

`titleIncludes` (keeps big boards to relevant roles): platform, infrastructure, cloud, reliability, sre, devops, devsecops, security, systems engineer, support engineer, solutions engineer, automation, internal tools, linux
