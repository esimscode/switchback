# Career Strategist OS / Dashboard Agent — PRD v2

## 1. Product Name

**Career Strategist OS**

Working repo name options:

- `career-strategist-os`
- `careergpt-dashboard`
- `career-os`
- `career-command-center`

Recommended repo name: **`career-strategist-os`**

---

## 2. Product Summary

Career Strategist OS is a private, AI-assisted career operating system that helps a technical professional organize their career story, evaluate opportunities, tailor applications, convert projects into proof, and make strategic career decisions with a trusted agent that understands their goals, background, constraints, and long-term direction.

The product is not just a resume generator or job tracker. It is a personal career command center with an embedded strategist.

The system combines:

- A structured Next.js dashboard
- A Neon Postgres source-of-truth database
- An Eve-powered agent layer
- Resume and job-search workflows
- Project-to-portfolio pipelines
- Reflection and decision logs
- Long-term career memory

The product should feel like working with a trusted career strategist: calm, private, personal, honest, and action-oriented.

Important positioning note: The product can feel reflective and supportive, but it should not claim to provide therapy or mental health support. It should be framed as career strategy, career coaching, decision support, and practical planning.

---

## 3. Product Thesis

Technical professionals often have scattered career assets: resumes, LinkedIn copy, GitHub repos, portfolio notes, job applications, project ideas, interview stories, and strategic goals. This fragmentation makes it difficult to tell a consistent story, apply strategically, reuse work, and compound projects into career leverage.

Career Strategist OS solves this by creating a private workspace where a user can:

- Store their career positioning
- Maintain multiple resume versions
- Analyze job opportunities
- Track applications and decisions
- Turn projects into reusable career assets
- Reflect on career direction
- Work with an AI strategist that remembers their context

The goal is to turn career activity into a compounding system.

---

## 4. Target User

### Primary User

A technical professional repositioning into higher-value roles across infrastructure, software, automation, cloud, security, and AI systems.

Initial user/persona:

**Eric Sims** — platform-focused software and infrastructure professional with 9+ years of experience across enterprise IT support, Linux and Windows environments, data center operations, networking, mobile device management, web development, automation, cloud systems, and cybersecurity education.

### Future Users

Potential future audiences:

- IT professionals moving into cloud/platform/security roles
- Developers managing strategic job searches
- Cybersecurity students building portfolio proof
- Career changers with technical backgrounds
- Freelancers/product builders turning projects into career assets
- Bootcamp grads or self-taught developers organizing their job search

### MVP Audience

Single-user, Eric-first.

Do not build SaaS complexity in the MVP. Build the best private career strategist workspace first. Multi-user, billing, and public onboarding can come later.

---

## 5. Core Product Identity

### One-line Description

A private AI career strategist that helps technical professionals turn resumes, applications, projects, and career decisions into a compounding operating system.

### Product Feeling

The product should feel:

- Calm
- Private
- Strategic
- Trusted
- Reflective
- Practical
- Career-aware
- Builder-oriented

### What It Is

- A career command center
- A private strategist workspace
- A resume and application operating system
- A project-to-proof engine
- A career memory layer
- A decision and reflection journal

### What It Is Not

- Not a generic AI chatbot
- Not a therapy product
- Not a mass-market resume generator
- Not a noisy consumer productivity app
- Not a job board
- Not an ATS clone
- Not a replacement for human judgment

---

## 6. Core Career Positioning Seed Data

Use this seed data to initialize the first user profile.

### User

Name: Eric Sims  
Location: Austin, TX  
Email: (set via seed data)

### Core Positioning

Eric Sims is a platform-focused software and infrastructure professional with 9+ years of experience across enterprise IT support, Linux and Windows environments, data center operations, networking, mobile device management, web development, automation, cloud systems, and cybersecurity education.

### Core Story

Eric understands infrastructure, builds software, automates workflows, and is growing into cloud, AI, security, and platform engineering.

### Positioning Rule

Do not frame Eric as starting over. Frame him as specializing, compounding, and moving up the value chain.

### Primary Tagline

Building secure systems through code, cloud, AI, and infrastructure automation.

### Target Roles

Primary target roles:

- Platform Engineer
- DevSecOps Engineer
- Cloud Engineer
- Infrastructure Automation Engineer
- Software Engineer, Platform
- Site Reliability Engineer
- Cloud Security Engineer
- AI Automation Engineer
- Internal Tools Developer
- Solutions Engineer
- Technical Consultant

Bridge roles:

- Systems Engineer
- Linux Systems Administrator
- Cloud Support Engineer
- Technical Support Engineer II/III
- Network Administrator
- IT Automation Specialist
- Cybersecurity Intern
- SOC Analyst
- Security Analyst
- IT Security Support

### Resume Versions

- Master Resume
- Platform-DevSecOps Resume
- Cloud-Infrastructure Resume
- Software-AI Automation Resume
- Cybersecurity Resume

### Credibility Rules

The system must protect credibility. It must not overstate unfinished projects.

Use honest labels:

- Completed
- In Progress
- Planned
- Prototype
- Designed
- Implemented
- Tested
- Deployed

Avoid claiming Kubernetes, Terraform, CI/CD, production DevOps, enterprise cloud architecture, or security engineering experience unless explicitly confirmed.

---

## 7. Technical Architecture

### Architecture Principle

**Next.js owns the product. Neon owns the data. Eve owns the agent layer.**

Do not make Eve responsible for the entire application architecture. Eve should power the agent workflows, tools, skills, and subagents. The app should remain a standard Next.js application with a stable database-backed domain model.

### Stack

Recommended MVP stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Neon Postgres
- Prisma or Drizzle
- Eve for agent runtime
- Vercel AI SDK only if useful for UI streaming/chat primitives
- Clerk optional later; for MVP use single-user local/session-based access or simple auth
- Vercel deployment later

### Database Recommendation

Use **Neon Postgres** as the source-of-truth database.

Reasoning:

- Serverless-friendly Postgres
- Works well with Next.js/Vercel
- Strong fit for structured career data
- Easy migration path with Prisma or Drizzle
- Good for future SaaS evolution

### ORM Recommendation

Use **Prisma** if the priority is readable schema and fast MVP development.

Use **Drizzle** if the priority is tighter TypeScript-first SQL control.

Default recommendation for MVP: **Prisma**, because it is easier to hand to a coding agent and reason about quickly.

---

## 8. High-Level System Diagram

```text
Next.js App Router
│
├── Dashboard UI
├── Career Profile
├── Resume Versions
├── Job Analysis
├── Application Tracker
├── Project Workspace
├── Reflection Log
├── Interview Story Bank
└── Strategist Chat

Neon Postgres
│
├── career_profiles
├── resume_versions
├── job_analyses
├── applications
├── projects
├── case_studies
├── interview_stories
├── career_reflections
├── career_memories
├── strategic_decisions
└── agent_outputs

Eve Agent Layer
│
├── root Career Strategist agent
├── Resume Strategist subagent
├── Job Matcher subagent
├── Portfolio Strategist subagent
├── GitHub / Project Auditor subagent
├── Interview Coach subagent
├── Reflection Coach subagent
├── tools/
├── skills/
└── schedules/
```

---

## 9. Eve Agent Architecture

### Agent Folder Structure

```text
agent/
  instructions.md
  agent.ts
  tools/
    get_career_profile.ts
    update_career_profile.ts
    list_resume_versions.ts
    create_resume_version.ts
    analyze_job_post.ts
    create_job_analysis.ts
    create_application.ts
    update_application_status.ts
    list_projects.ts
    create_project_case_study.ts
    create_reflection.ts
    create_strategic_decision.ts
    retrieve_career_memories.ts
    save_career_memory.ts
  skills/
    analyze-job.md
    recommend-resume.md
    tailor-resume.md
    build-case-study.md
    create-linkedin-post.md
    audit-github-repo.md
    prepare-interview.md
    weekly-review.md
    reflection-checkin.md
  subagents/
    resume-strategist/
      instructions.md
    job-matcher/
      instructions.md
    portfolio-strategist/
      instructions.md
    github-auditor/
      instructions.md
    interview-coach/
      instructions.md
    reflection-coach/
      instructions.md
  schedules/
    weekly-career-review.md
```

### Root Agent Role

The root Eve agent is the trusted Career Strategist.

It should:

- Understand Eric’s career direction
- Protect credibility
- Recommend practical next steps
- Read and write structured career data
- Convert career activity into reusable assets
- Coordinate specialized subagents
- Ask clarifying questions only when necessary
- Prefer concrete outputs over generic advice

### Root Agent Instruction Draft

```text
You are a trusted career strategist, not a generic assistant.

You help the user make practical career progress while protecting credibility.

You are strategic, calm, direct, supportive, and honest.

You remember the user's positioning, target roles, resume versions, projects, constraints, and long-term goals.

You do not exaggerate experience.

You help turn scattered career activity into reusable assets: resume bullets, portfolio case studies, GitHub READMEs, LinkedIn posts, interview stories, and application strategy.

When the user feels uncertain, help them clarify the next useful step.

Do not provide therapy or mental health advice. You may offer reflective career coaching, decision support, and practical planning.

Always protect credibility. Truthful positioning beats exaggerated positioning.
```

---

## 10. MVP Scope

### MVP Name

**Private Career Strategist Workspace**

### MVP Goal

Build a functional single-user dashboard where Eric can manage his career profile, analyze jobs, track applications, work with a strategist chat, log reflections, and turn projects into career assets.

### MVP Modules

1. Career Profile
2. Strategist Chat
3. Job Analysis
4. Resume Recommendation
5. Application Tracker
6. Project Asset Pipeline
7. Reflection Log
8. Career Memory

---

## 11. MVP Feature Requirements

### 11.1 Career Profile

The Career Profile stores the user’s positioning, target roles, skills, resume versions, credibility rules, and project themes.

#### Required Fields

- Name
- Location
- Email
- Primary headline
- Core positioning
- Core story
- Target roles
- Bridge roles
- Skills
- Resume versions
- Project themes
- Credibility rules
- LinkedIn headline
- Portfolio tagline

#### User Stories

- As Eric, I want to view my career positioning in one place.
- As Eric, I want the agent to use this profile when analyzing jobs or tailoring resumes.
- As Eric, I want to update my target roles and positioning over time.

#### Acceptance Criteria

- Career profile can be viewed on a dedicated page.
- Career profile can be edited.
- Agent can retrieve career profile through an Eve tool.
- Career profile seed data is loaded on initial setup.

---

### 11.2 Strategist Chat

A conversational interface powered by Eve.

#### Purpose

The chat should feel like working with a trusted career strategist who knows Eric’s context and can perform structured actions.

#### Required Capabilities

- Read career profile
- Retrieve resume versions
- Analyze a job post
- Create application tracker entries
- Create reflections
- Create project case study drafts
- Save useful career memories
- Recommend next actions

#### User Stories

- As Eric, I want to ask what career asset to work on next.
- As Eric, I want to paste a job description and get a strategy.
- As Eric, I want to talk through a career decision and save the reasoning.
- As Eric, I want the agent to remember useful context for later.

#### Acceptance Criteria

- Chat UI exists.
- Chat can call at least 3 Eve tools in MVP.
- Chat responses reference stored career profile data.
- Chat can save a reflection or strategic decision.
- Chat avoids unsupported claims and protects credibility.

---

### 11.3 Job Analysis

The user can paste a job description and receive a structured analysis.

#### Input

- Company
- Role title
- Job description
- Source URL optional
- Salary range optional
- Location optional

#### Output

- Fit classification:
  - Strong fit
  - Stretch fit
  - Bridge role
  - Not worth it
- Best resume version
- Skills to emphasize
- Gaps
- Tailored summary
- Interview talking points
- Application tracker recommendation
- Decision recommendation

#### User Stories

- As Eric, I want to know if a job is worth applying to.
- As Eric, I want to know which resume version to use.
- As Eric, I want to understand whether a role is strategic or a distraction.

#### Acceptance Criteria

- User can create a job analysis from pasted text.
- Agent returns a structured analysis.
- Analysis is saved to database.
- User can convert analysis into an application entry.

---

### 11.4 Resume Recommendation

The agent recommends the best resume version for a job.

#### Resume Versions

- Master Resume
- Platform-DevSecOps Resume
- Cloud-Infrastructure Resume
- Software-AI Automation Resume
- Cybersecurity Resume

#### Required Output

- Recommended resume version
- Why that resume fits
- What to emphasize
- What not to overclaim
- Suggested tailored summary
- Suggested tailored bullets

#### Acceptance Criteria

- Resume recommendation appears inside job analysis.
- Recommendation follows credibility rules.
- Recommendation does not invent experience.

---

### 11.5 Application Tracker

Tracks applications and decisions.

#### Fields

- Company
- Role title
- Role family
- Resume version used
- Date applied
- Source
- Contact
- Status
- Follow-up date
- Salary range
- Link
- Notes
- Fit classification
- Decision reasoning

#### Status Options

- Saved
- Applied
- Follow-up needed
- Interviewing
- Rejected
- Offer
- Accepted
- Passed

#### Acceptance Criteria

- User can create application manually.
- User can create application from job analysis.
- User can update application status.
- User can view applications in a table.

---

### 11.6 Project Asset Pipeline

Turns projects into career assets.

#### Project Status Labels

- Planned
- In Progress
- Prototype
- Implemented
- Tested
- Deployed
- Completed

#### Project Assets

For each project, the system can generate:

- Resume bullets
- Portfolio case study
- GitHub README draft
- LinkedIn post
- Interview story
- Next milestone

#### Initial Project Seeds

1. CareerGPT Dashboard / Career Strategist OS
2. Multi-Agent Agency Operating System
3. Client Portal / Agency Dashboard
4. n8n Automation and Deployment Workflows
5. WordPress / Cloud Hosting Recovery
6. Live Cultr Client Work

#### Acceptance Criteria

- User can create and edit projects.
- Each project has a status label.
- Agent can generate at least one case study draft.
- Agent can identify the smallest useful next milestone.

---

### 11.7 Reflection Log

This is the feature that makes the product feel personal and trusted.

#### Purpose

Capture career thoughts, decisions, uncertainty, blockers, tradeoffs, and weekly priorities.

#### Reflection Types

- Weekly check-in
- Career decision
- Blocker
- Opportunity
- Project note
- Interview reflection
- Application reflection

#### Example Prompts

- What are you focused on this week?
- What feels unclear right now?
- What opportunity are you considering?
- What project needs momentum?
- What career asset should we improve next?
- What did you learn from this application or interview?

#### Acceptance Criteria

- User can create a reflection manually.
- Agent can create a reflection from chat.
- Reflections can be linked to applications or projects.
- Reflections are viewable in chronological order.

---

### 11.8 Career Memory

Stores durable facts, preferences, constraints, and strategic rules.

#### Memory Categories

- Positioning
- Preference
- Constraint
- Project
- Resume rule
- Job search rule
- Portfolio rule
- Interview rule

#### Example Memories

- Eric does not want to be framed as starting over.
- Eric is targeting platform/cloud/automation/security roles.
- Eric prefers practical progress over generic advice.
- Eric should not overclaim Kubernetes, Terraform, CI/CD, or production DevOps unless confirmed.
- Eric wants the product to feel like a trusted career strategist, not a generic consumer app.

#### Acceptance Criteria

- Agent can retrieve career memories.
- Agent can save a new memory with user confirmation or clear context.
- Memories can be viewed in settings/admin page.

---

## 12. Database Model Draft

Use Prisma or Drizzle to create the equivalent of these models.

### User

```text
users
- id
- name
- email
- location
- created_at
- updated_at
```

### Career Profile

```text
career_profiles
- id
- user_id
- primary_headline
- core_positioning
- core_story
- portfolio_tagline
- linkedin_headline
- target_roles json
- bridge_roles json
- skills json
- credibility_rules json
- created_at
- updated_at
```

### Resume Version

```text
resume_versions
- id
- user_id
- name
- type: master | platform_devsecops | cloud_infrastructure | software_ai | cybersecurity
- content
- status
- source_url
- created_at
- updated_at
```

### Job Analysis

```text
job_analyses
- id
- user_id
- company
- role_title
- job_description
- source_url
- fit_classification
- recommended_resume_version_id
- skills_to_emphasize json
- gaps json
- tailored_summary
- interview_talking_points json
- recommendation
- created_at
- updated_at
```

### Application

```text
applications
- id
- user_id
- company
- role_title
- role_family
- resume_version_id
- job_analysis_id
- date_applied
- source
- contact
- status
- follow_up_date
- salary_range
- link
- notes
- fit_classification
- decision_reasoning
- created_at
- updated_at
```

### Project

```text
projects
- id
- user_id
- name
- slug
- status
- summary
- problem
- solution
- stack json
- role
- career_signal
- github_url
- portfolio_url
- next_milestone
- created_at
- updated_at
```

### Case Study

```text
case_studies
- id
- user_id
- project_id
- title
- status
- problem
- solution
- stack
- architecture
- challenges
- outcome
- next_steps
- career_signal
- created_at
- updated_at
```

### Interview Story

```text
interview_stories
- id
- user_id
- project_id
- application_id
- title
- situation
- task
- action
- result
- skills_demonstrated json
- created_at
- updated_at
```

### Career Reflection

```text
career_reflections
- id
- user_id
- reflection_type: weekly_checkin | decision | blocker | opportunity | project_note | interview_reflection | application_reflection
- title
- body
- mood_optional
- related_project_id
- related_application_id
- created_at
```

### Career Memory

```text
career_memories
- id
- user_id
- key
- value
- category: positioning | preference | constraint | project | resume_rule | job_search_rule | portfolio_rule | interview_rule
- source
- confidence
- created_at
- updated_at
```

### Strategic Decision

```text
strategic_decisions
- id
- user_id
- decision_type: apply | pass | tailor_resume | prioritize_project | accept_offer | reject_offer | project_focus
- context
- options_considered json
- decision
- reasoning
- tradeoffs
- next_action
- created_at
```

### Agent Output

```text
agent_outputs
- id
- user_id
- output_type
- title
- content
- related_project_id
- related_application_id
- related_job_analysis_id
- created_at
```

---

## 13. UI / Page Requirements

### MVP Pages

```text
/
/dashboard
/career-profile
/chat
/jobs/new
/jobs/[id]
/applications
/projects
/projects/[id]
/reflections
/memories
/settings
```

### Dashboard

Show:

- Current career focus
- Target roles
- Active applications
- Projects needing momentum
- Recent reflections
- Suggested next action
- Quick action buttons

### Career Profile Page

Show and edit:

- Core positioning
- Target roles
- Skills
- Resume versions
- Credibility rules
- Portfolio tagline
- LinkedIn headline

### Chat Page

Show:

- Eve-powered strategist chat
- Suggested prompts
- Tool/action result cards
- Ability to save outputs

Suggested prompts:

- Analyze a job description
- What should I work on next?
- Turn this project into a case study
- Help me decide if this role is worth applying to
- Create a LinkedIn post from this project
- Create a weekly career review

### Jobs Page

- Form to paste job description
- Saved job analyses list
- Fit classification badges

### Applications Page

- Table view
- Status filters
- Follow-up dates
- Resume version used
- Fit classification

### Projects Page

- Project cards
- Status labels
- Career signal
- Next milestone

### Reflections Page

- Chronological log
- Filter by reflection type
- Linked applications/projects

### Memories Page

- View stored career memories
- Edit/delete memories
- Category filters

---

## 14. Agent Skills

### analyze-job.md

Purpose: Analyze a job description and classify fit.

Inputs:

- Career profile
- Resume versions
- Job description

Outputs:

- Fit classification
- Best resume version
- Skills to emphasize
- Gaps
- Suggested strategy
- Application recommendation

### recommend-resume.md

Purpose: Choose the best resume version for a job or role family.

### tailor-resume.md

Purpose: Generate honest tailored summary and bullet recommendations.

### build-case-study.md

Purpose: Turn project data into a portfolio case study.

### create-linkedin-post.md

Purpose: Turn project/career activity into a LinkedIn post in Eric’s voice.

### audit-github-repo.md

Purpose: Review repo readiness for portfolio use.

### prepare-interview.md

Purpose: Generate interview stories and talking points.

### reflection-checkin.md

Purpose: Help the user reflect on career direction and save useful notes.

### weekly-review.md

Purpose: Summarize the week and recommend next actions.

---

## 15. Eve Tools

### Required MVP Tools

- `get_career_profile`
- `update_career_profile`
- `list_resume_versions`
- `analyze_job_post`
- `create_job_analysis`
- `create_application`
- `update_application_status`
- `list_projects`
- `create_project_case_study`
- `create_reflection`
- `retrieve_career_memories`
- `save_career_memory`

### Tool Design Rules

- Tools should be typed.
- Tools should validate inputs.
- Tools should return structured JSON.
- Tools should not make unsupported claims.
- Tools should not overwrite major user data without confirmation.
- Agent outputs should be saved separately from source data.

---

## 16. Safety and Credibility Requirements

The product must protect user credibility.

### Rules

- Do not invent experience.
- Do not invent metrics.
- Do not claim projects are complete when they are not.
- Do not claim production usage unless confirmed.
- Do not overstate technical depth.
- Do not claim Kubernetes, Terraform, CI/CD, production DevOps, enterprise cloud architecture, or security engineering experience unless confirmed.
- Use honest status labels.
- Prefer truthful, strong language over inflated language.

### Product Safety Boundary

The product may provide:

- Career coaching
- Reflection prompts
- Decision support
- Strategic planning
- Practical job-search guidance

The product must not present itself as:

- Therapy
- Mental health treatment
- Legal advice
- Financial advice
- Guaranteed job placement

---

## 17. Implementation Milestones

### Milestone 0 — Project Setup

- Create Next.js app
- Add TypeScript
- Add Tailwind
- Add shadcn/ui
- Add Neon database
- Add Prisma or Drizzle
- Add Eve
- Confirm Eve works inside Next.js
- Create base app shell

### Milestone 1 — Data Foundation

- Create database schema
- Add seed data for Eric
- Build career profile page
- Build resume versions table
- Build projects table
- Build application tracker table

### Milestone 2 — Eve Agent Spike

Goal: Prove Eve can read/write app data.

Build:

- `agent/instructions.md`
- `get_career_profile` tool
- `list_resume_versions` tool
- `create_reflection` tool
- Basic strategist chat page

Acceptance:

- User can ask chat about career profile.
- Agent can retrieve profile.
- Agent can save a reflection.

### Milestone 3 — Job Analysis Workflow

Build:

- Job description input page
- Eve `analyze_job_post` tool/skill
- Save job analysis
- Recommend resume version
- Convert analysis into application entry

Acceptance:

- User can paste job.
- Agent classifies fit.
- Analysis saves to database.
- Application entry can be created.

### Milestone 4 — Project Asset Pipeline

Build:

- Project pages
- Case study generation
- Next milestone generation
- LinkedIn post draft generation

Acceptance:

- User can open a project.
- Agent creates a case study draft.
- Agent identifies next useful milestone.

### Milestone 5 — Reflection + Memory Layer

Build:

- Reflection log
- Career memory page
- Agent memory retrieval
- Agent memory save flow

Acceptance:

- Agent references durable career memory.
- User can view/edit memories.
- Reflections are linked to applications/projects.

### Milestone 6 — Polish and Portfolio Readiness

Build:

- Clean dashboard UI
- Empty states
- Status badges
- README
- Screenshots
- Architecture notes
- Portfolio case study

---

## 18. First Coding Agent Task

Use this as the first prompt for the coding agent.

```text
We are building Career Strategist OS, a private AI-assisted career operating system.

Architecture:
- Next.js App Router for the app
- TypeScript
- Tailwind + shadcn/ui
- Neon Postgres for the database
- Prisma preferred for ORM unless there is a strong reason to use Drizzle
- Eve for the agent layer

Important architecture rule:
Next.js owns the product, Neon owns the data, Eve owns the agent workflows.
Do not make Eve responsible for the entire app architecture.

MVP goal:
Build a single-user private Career Strategist Workspace with:
1. Career Profile
2. Strategist Chat powered by Eve
3. Job Analysis
4. Resume Recommendation
5. Application Tracker
6. Project Asset Pipeline
7. Reflection Log
8. Career Memory

Start with Milestone 0 and Milestone 1 only:
- Create the app structure
- Add the database schema
- Add seed data for Eric Sims
- Build the dashboard shell
- Build career profile page
- Build application tracker table
- Build projects table
- Add placeholder strategist chat route/page
- Add initial Eve folder structure but do not overbuild agent workflows yet

Use honest career positioning. Do not overclaim experience. Preserve credibility rules in seed data.
```

---

## 19. README Positioning Draft

```md
# Career Strategist OS

A private AI-assisted career operating system for technical professionals.

Career Strategist OS helps organize career positioning, resume versions, applications, projects, portfolio assets, interview stories, and strategic decisions in one place. It combines a structured Next.js dashboard with an Eve-powered career strategist agent and a Neon Postgres source-of-truth database.

The goal is to turn scattered career activity into a compounding system.

## Status

In Progress / Personal MVP

## Core Features

- Career profile and positioning workspace
- Resume version management
- Job description analysis
- Resume recommendation
- Application tracker
- Project-to-case-study pipeline
- Reflection log
- Career memory
- Eve-powered strategist chat

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Neon Postgres
- Prisma
- Eve

## Product Philosophy

This is not just a resume tool. It is a trusted career strategist workspace that helps users make practical progress while protecting credibility.
```

---

## 20. Non-Goals for MVP

Do not build these yet:

- Multi-user SaaS
- Billing
- Public templates marketplace
- Job board scraping
- Browser extension
- Full Google Drive sync
- Full GitHub app integration
- AI-generated resume PDF export
- Complex onboarding
- Mobile app
- Team features

Keep the MVP personal, focused, and useful.

---

## 21. Success Criteria

The MVP is successful if Eric can:

- Open a private dashboard
- View and edit his career profile
- Chat with a strategist agent that knows his context
- Paste a job description and get a useful fit analysis
- Get the best resume version recommendation
- Save an application entry
- Track application status
- Create project case study drafts
- Log career reflections and decisions
- See stored career memories
- Use the app as a real weekly career operating system

---

## 22. Strategic Note

This project should become a flagship portfolio asset.

It should prove:

- Full-stack application development
- Product thinking
- Database modeling
- AI agent architecture
- Workflow automation
- Career strategy systems
- Personal productivity infrastructure
- Honest technical positioning

The strongest portfolio angle:

**I built a private AI career operating system that turns resumes, projects, applications, reflections, and job-search strategy into a structured, agent-powered dashboard.**
