# CareerCraft Presentation Plan (Max 10 Minutes)

## 0) Presentation Goal and Timing

This plan is designed to stay within **10 minutes** and cover all required assessment points.

### Suggested Time Split

- 0:00–0:30 — Intro + team contributions overview
- 0:30–1:30 — Problem Domain
- 1:30–2:45 — User Stories
- 2:45–3:45 — MVP, Stretch Goals Achieved, Future Goals
- 3:45–5:00 — Wireframe + Route Map explanation
- 5:00–7:45 — Live app demo
- 7:45–9:00 — Collaboration and project management
- 9:00–10:00 — Reflection (difficult/fun/educational/frustrating) + close

---

## 1) Team Contributions (All Members)

> Replace placeholders before presenting.

- **Member 1 — [Name]:** [Primary responsibility and key contribution]
- **Member 2 — [Name]:** [Primary responsibility and key contribution]
- **Member 3 — [Name]:** [Primary responsibility and key contribution]
- **Member 4 — [Name]:** [Primary responsibility and key contribution]
- **Member 5 — [Name]:** [Primary responsibility and key contribution]

### Suggested speaking order

- Member 1: Problem Domain + User Stories
- Member 2: MVP/Stretch/Future + Wireframe/Route Map
- Member 3: Demo (Part 1)
- Member 4: Demo (Part 2) + Collaboration/PM
- Member 5: Reflection + Close

---

## 2) Problem Domain (1 min)

CareerCraft sits in the **AI-assisted career and job-application domain**.

Core problem:

- Job seekers often use fragmented tools for analysis, cover letters, interview prep, and tracking.
- CareerCraft unifies these into one authenticated workflow with session history and AI outputs.

Reference source: [`documents/problem-domain.txt`](documents/problem-domain.txt:1)

---

## 3) User Stories (1 min 15 sec)

Show that requirements were user-centered and testable.

Key examples to mention:

- Protected access and user-owned data
- Document upload and extraction reliability
- Analysis output and session continuity
- Error handling and usability flows

Reference source: [`documents/user-stories.md`](documents/user-stories.md:1)

---

## 4) MVP, Stretch Goals, Future Goals (1 min)

### MVP delivered

- Authenticated workflow
- Resume + JD analysis
- AI generation (cover letter, interview prep, optimization, career guidance)
- Dashboard/session tracking

### Stretch goals achieved

- Improved navigation and redirect behavior
- Auth UX consistency improvements
- Expanded documentation artifacts
- Modularized API surface

### Future goals

- Collaboration UI and advanced analytics
- Higher automated test coverage
- Better observability and scalability

Reference source: [`documents/problem-domain.txt`](documents/problem-domain.txt:3)

---

## 5) Wireframe + Route Map Explanation (1 min 15 sec)

### Wireframes

- Base wireframe: [`documents/app-wireframe.png`](documents/app-wireframe.png)
- Colored wireframe: [`documents/app-wireframe-colored.png`](documents/app-wireframe-colored.png)
- Additional copy: [`documents/wireframe.png`](documents/wireframe.png)

### Route map highlights

- Home: [`src/app/page.js`](src/app/page.js)
- Features route: [`src/app/features/page.js`](src/app/features/page.js)
- Auth pages: [`src/app/login/[[...rest]]/page.js`](src/app/login/[[...rest]]/page.js), [`src/app/signup/[[...rest]]/page.js`](src/app/signup/[[...rest]]/page.js)
- Protected app routes: [`src/app/analysis/page.js`](src/app/analysis/page.js), [`src/app/dashboard/page.js`](src/app/dashboard/page.js), [`src/app/sessions/[id]/page.js`](src/app/sessions/[id]/page.js)
- Route protection layer: [`src/proxy.ts`](src/proxy.ts:1)

Reference source: [`documents/problem-domain.txt`](documents/problem-domain.txt:27)

---

## 6) App Demonstration Script (2 min 45 sec)

### Demo flow (safe and quick)

1. Open landing page and describe value proposition.
2. Show auth entry points (`/login` and `/signup`).
3. Enter analysis workspace and submit sample JD + resume text.
4. Show generated sections (overview, cover letter, gaps, optimization, interview, career).
5. Go to dashboard and show saved sessions.
6. Open a specific session detail page and show continuity.

### Suggested pages/components to mention while demoing

- Analysis page: [`src/components/AnalysisPage.jsx`](src/components/AnalysisPage.jsx)
- Tabs: [`src/components/Tabs.jsx`](src/components/Tabs.jsx)
- Header/navigation: [`src/components/AppHeader.jsx`](src/components/AppHeader.jsx)
- Session detail page: [`src/app/sessions/[id]/page.js`](src/app/sessions/[id]/page.js)

---

## 7) Collaboration and Project Management (1 min 15 sec)

### Explain your working method

- How tasks were broken down
- How priorities were decided
- How blockers were handled
- How code/documentation reviews were done

### Evidence options (choose what you used)

- Trello/Jira/Notion/GitHub Projects board screenshots or export
- Communication method (Discord/WhatsApp/Teams/Slack)
- Branching + PR/review workflow summary

### Team responsibility statement template

- “We divided work by feature modules (analysis, dashboard, API, docs), and each member owned delivery + review for their area.”

---

## 8) Reflection Content (1 min)

Use this concise structure:

- **Most difficult:** keeping AI outputs consistent and robust
- **Most educational:** full-stack integration across UI, API, and DB
- **Most fun:** seeing complete user flow from input to actionable output
- **Most frustrating:** dependency/setup drift and naming consistency
- **Most successful:** moving from isolated features to a coherent, documented product

Reference source: [`documents/critical-reflections.md`](documents/critical-reflections.md:1)

---

## 9) Slide-by-Slide Checklist (Quick Build)

1. Title + team members
2. Problem domain
3. User stories
4. MVP + stretch + future
5. Wireframe + route map
6. Architecture snapshot
7. Live demo flow
8. Collaboration/project management
9. Reflection and learnings
10. Closing summary

---

## 10) Closing Script (20–30 sec)

“CareerCraft addresses a real job-application workflow problem by combining AI analysis, content generation, and progress tracking in one secure platform. We delivered core MVP goals, achieved meaningful stretch outcomes, and documented clear next steps for scalability, testing, and collaboration improvements.”
