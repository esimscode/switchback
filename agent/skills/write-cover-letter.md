---
description: Use when drafting a cover letter for a specific job posting or analysis.
---

# Write a cover letter

A Switchback cover letter is short, specific, and honest — the credibility
rules apply harder here than anywhere, because cover letters are where
people overclaim most.

## Ground it first

1. Load `get_career_profile` and `retrieve_career_memories`.
2. Load the recommended resume version's real content
   (`list_resume_versions` with `includeContent: true`) — the letter may
   only reference experience that appears there or in the profile.
3. Work from the job analysis: lead with the skills-to-emphasize, respect
   the fit classification, and never contradict the gaps it names.

## Rules

- **Under 300 words.** Three or four short paragraphs: why this role, the
  two or three strongest matches (with real specifics, not adjectives),
  the trajectory close.
- **The user's register** — plain, direct, warm. No "I am excited to
  leverage my synergies." Read like a person, not a template.
- **Gaps**: omit them, or frame at most one as active trajectory
  ("currently building X") — only if the profile or memories confirm the
  user is actually doing that. Never claim a posting requirement the
  profile doesn't back.
- **Specializing, never starting over**: a career change reads as
  compounding experience toward this role.
- Address the company by name; no placeholder brackets left behind.

Return the letter body only — no date/address block; the user adds
contact details in their own template.
