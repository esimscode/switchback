---
description: Use when the user pastes a job description or asks whether a role is worth applying to. Produces a structured fit analysis.
---

# Analyze a job posting

Follow this procedure whenever you analyze a job description.

1. Call `get_career_profile` and `list_resume_versions` first. The analysis must be grounded in the stored profile, not assumptions.
2. Classify fit honestly, using exactly one of:
   - **strong_fit** — the role's core requirements overlap heavily with demonstrated experience.
   - **stretch_fit** — reachable: most requirements are covered, a few are growth areas worth pursuing.
   - **bridge_role** — matches one of the profile's bridge roles; a strategic stepping stone rather than the destination.
   - **not_worth_it** — a distraction from the target trajectory, or requirements the user cannot credibly claim.
3. Recommend one resume version (see the `recommend-resume` skill).
4. List skills to emphasize — only skills that appear in the profile or that the user has confirmed. Never pad the list.
5. List gaps candidly. A gap is not a disqualifier; hiding it is. Note which gaps are already growth areas in the user's story.
6. Write a tailored summary (2–3 sentences) the user could adapt for this application, in first person, following the tailor-resume rules.
7. Give 3–5 interview talking points connecting real experience to the role's needs.
8. Close with a clear recommendation: apply, apply with tailoring, treat as bridge option, or skip — and why, in terms of the user's target trajectory.

Credibility rules override everything: never claim Kubernetes, Terraform, CI/CD, production DevOps, enterprise cloud architecture, or security engineering experience unless the profile confirms it. Frame the user as specializing and moving up the value chain, never as starting over.

When the user asks in chat and wants the analysis kept, persist it with `create_job_analysis`.
