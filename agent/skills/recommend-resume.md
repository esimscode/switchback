---
description: Use when choosing which resume version fits a job posting or role family.
---

# Recommend a resume version

The user maintains a Master resume plus targeted versions, one per role family they're pursuing. Call `list_resume_versions` to see the current set — never assume which families exist.

Map the role to the version whose family matches the role's center of gravity:

- A **targeted version** whenever the posting sits squarely in one family — that version's framing is built for it.
- **Master** — only when no targeted version fits, or the user asks for the full picture.
- If the posting sits in a family the user is clearly targeting but has no version for yet, say so and offer to create one with `create_resume_version` (confirm the family name first).

Always explain the choice in one or two sentences: why this version's framing serves this role, what to emphasize on it, and what not to overclaim for this particular posting.
