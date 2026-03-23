# CareerCraft Presentation: Structural Choices & Tooling Decisions

## 1) Purpose of This Document

This document explains the **architectural structure** and **tool choices** used in the CareerCraft project, with a focus on clarity for stakeholders (product, engineering, design, operations, and leadership).

It complements the product-level spec in `SPEC.md` and translates implementation decisions into business-relevant rationale: maintainability, delivery speed, reliability, user experience, and future scalability.

---

## 2) Executive Summary

CareerCraft is built as a **full-stack Next.js application** with:

- A unified frontend/backend framework for faster delivery and lower integration overhead
- Server-side API routes to orchestrate AI workflows and persistence
- PostgreSQL for durable session and result storage
- Client-side and server-side processing for resume/job-description ingestion
- Clerk for authentication and user identity lifecycle

The architecture intentionally prioritizes:

1. **Fast iteration** for AI product development
2. **Predictable user flows** in a multi-step analysis experience
3. **Clear separation of concerns** between UI, domain logic, and external integrations
4. **Production readiness foundations** (validation, metadata, error handling, and structured state)

---

## 3) Structural Choices (How the Product Is Organized)

### 3.1 Framework and Application Shape

**Choice:** Next.js App Router as a single application surface for web UI + APIs.

**Evidence in project:**

- `src/app/layout.js` (global app shell, providers, metadata)
- `src/app/page.js` (landing/entry experience)
- `src/app/api/*/route.js` (backend endpoints for feature operations)

**Why this matters:**

- Reduces coordination complexity between separate frontend and backend repos
- Keeps product teams focused on feature delivery rather than integration plumbing
- Enables consistent deployment and runtime model

---

### 3.2 Layered Responsibility Model

The project follows a pragmatic layered model:

1. **Presentation Layer** (`src/app`, `src/components`)
   - User interaction, visual states, feature tabs, and dashboards
2. **Application/Orchestration Layer** (`src/app/api/*/route.js`)
   - Request validation, feature orchestration, error shaping, persistence hooks
3. **Domain/Utility Layer** (`src/lib/*`)
   - AI integration, file parsing, export helpers, DB utilities
4. **State Coordination Layer** (`src/context/AnalysisContext.jsx`)
   - Cross-component state management for analysis lifecycle

**Why this matters:**

- Supports parallel development (UI, API, and data concerns can evolve independently)
- Improves maintainability by avoiding feature logic in purely presentational components

---

### 3.3 State Management Strategy

**Choice:** React Context + `useReducer` for centralized analysis state.

**Evidence:** `src/context/AnalysisContext.jsx`

**What it controls:**

- Input payloads (job description, resume text, role/company metadata)
- Analysis outputs (scoring, gaps, generated assets)
- UI loading/error state
- Session linkage across user actions

**Why this matters:**

- Predictable transitions via explicit reducer actions
- Avoids deep prop drilling in a multi-feature interface
- Easier debugging due to action-driven state updates

---

### 3.4 API-First Feature Execution

**Choice:** Feature actions are mediated through API routes rather than direct client-side model calls.

**Evidence:**

- `src/app/api/analyze/route.js`
- `src/app/api/cover-letter/route.js`
- `src/app/api/optimization/route.js`
- `src/app/api/interview/route.js`
- `src/app/api/career/route.js`
- `src/app/api/session/route.js`
- `src/app/api/analysis-results/route.js`

**Why this matters:**

- Keeps API secrets on the server
- Enables consistent validation and error responses
- Allows persistence and analytics controls to be applied uniformly

---

### 3.5 AI Integration Design

**Choice:** Centralized AI service abstraction with guarded JSON parsing.

**Evidence:** `src/lib/aiService.js`

**Notable implementation decisions:**

- Centralized LLM call helper (`callOpenRouter`) to reduce duplication
- Schema-shaped prompts for deterministic output structures
- Recovery parser (`parseJsonWithRecovery`) to handle common model formatting errors

**Why this matters:**

- Improves reliability of downstream UI rendering
- Reduces hard failures from malformed model responses
- Simplifies future model/provider switching

---

### 3.6 File Ingestion and Normalization Pipeline

**Choice:** Multi-format text extraction utility with validation and normalization.

**Evidence:** `src/lib/fileProcessing.js`, `src/components/FileUploader.jsx`

**Supported formats:** PDF, DOCX, TXT

**Design highlights:**

- Type and size validation before heavy processing
- Format-specific extraction path per file type
- Normalization (`cleanText`) to standardize whitespace/newlines

**Why this matters:**

- Improves AI prompt quality from user-uploaded files
- Reduces user-facing failures from unsupported/corrupt data

---

### 3.7 Authentication and Identity

**Choice:** Clerk-based authentication and identity management.

**Evidence:**

- Dependency in `package.json`
- Provider wiring in `src/app/layout.js`
- user record helper in `src/lib/ensureUserRecord.js`

**Why this matters:**

- Offloads auth complexity (sessions, sign-in/sign-up, security controls)
- Speeds up delivery while maintaining robust identity handling

---

### 3.8 Persistence and Data Layer

**Choice:** PostgreSQL through the `pg` driver, with SQL-first operational visibility.

**Evidence:** `src/lib/db.js`, `src/lib/init-db.js`, `SQL.SQL`

**Why this matters:**

- Strong relational model for session history and analysis records
- Familiar ecosystem and operational maturity
- Clear migration path to managed Postgres or horizontal scaling patterns

---

### 3.9 UX, Accessibility, and Presentation Reliability

**Choices reflected in implementation:**

- Global metadata/SEO/social tags in `src/app/layout.js`
- Accessibility affordance (skip link) in app shell
- Motion-led intro/transition layer in `src/app/page.js` (Framer Motion)

**Why this matters:**

- Improves discoverability and shareability of the product
- Supports inclusive navigation patterns
- Delivers polished first-impression quality for demos/stakeholder reviews

---

## 4) Tool Choices (What Was Chosen and Why)

### 4.1 Core Runtime and Framework

| Tool       | Role                         | Decision Rationale                                                |
| ---------- | ---------------------------- | ----------------------------------------------------------------- |
| Next.js 16 | Full-stack web framework     | Unified architecture, App Router conventions, built-in API routes |
| React 19   | UI rendering and interaction | Mature component model, ecosystem fit, predictable state patterns |

---

### 4.2 Styling and Frontend UX

| Tool                 | Role                  | Decision Rationale                                    |
| -------------------- | --------------------- | ----------------------------------------------------- |
| Tailwind CSS 4       | Utility-first styling | Rapid UI implementation with consistent design tokens |
| Framer Motion        | Animated interactions | Smooth transitions for onboarding/presentation polish |
| Lucide + Radix Icons | Iconography           | Clean, modern icon set and ecosystem compatibility    |

---

### 4.3 AI and Content Intelligence

| Tool                  | Role                        | Decision Rationale                                              |
| --------------------- | --------------------------- | --------------------------------------------------------------- |
| OpenRouter API        | LLM provider gateway        | Model flexibility and provider abstraction                      |
| Prompted JSON outputs | Deterministic API contracts | Keeps generated results consumable by UI and persistence layers |

---

### 4.4 File Processing and Document Support

| Tool                        | Role                | Decision Rationale                            |
| --------------------------- | ------------------- | --------------------------------------------- |
| `pdf-parse`                 | PDF text extraction | Practical parser for resume/job doc ingestion |
| `mammoth`                   | DOCX extraction     | Reliable text extraction from Word documents  |
| Native buffer/text handling | TXT support         | Minimal overhead for plain text uploads       |

---

### 4.5 Data and Identity

| Tool              | Role                             | Decision Rationale                                            |
| ----------------- | -------------------------------- | ------------------------------------------------------------- |
| PostgreSQL + `pg` | Persistent storage               | Strong relational integrity and proven production reliability |
| Clerk             | Authentication and user sessions | Reduces custom security surface and implementation time       |

---

### 4.6 Developer Experience and Quality

| Tool                          | Role                         | Decision Rationale                                 |
| ----------------------------- | ---------------------------- | -------------------------------------------------- |
| ESLint + `eslint-config-next` | Code quality and consistency | Standardized linting and Next.js-aware rules       |
| Next metadata API             | SEO/social robustness        | Single source for titles, OG, and crawler metadata |

---

## 5) Trade-offs and Risk Posture

### What this structure does well

- Enables rapid feature shipping for an AI-heavy workflow
- Keeps backend orchestration close to frontend experience logic
- Supports iterative prompt and schema evolution

### Trade-offs acknowledged

- Tight coupling to framework conventions (benefit now, migration cost later)
- LLM output variability requires continuous schema hardening
- Monolithic deployment model can become noisy under heavy scaling unless split strategically

### Current mitigation patterns

- Centralized service wrappers (`src/lib/*`)
- Defensive parsing and explicit error paths
- Separated API routes per capability for clearer monitoring and ownership

---

## 6) Why These Choices Fit the Project Presentation

For stakeholder-facing demonstrations and product reviews, this structure is effective because it provides:

1. **Narrative clarity**: upload → analyze → recommendations → generated assets
2. **Technical credibility**: real persistence, auth, and API orchestration (not only static UI)
3. **Operational realism**: explicit handling for malformed AI responses, file validation, and session continuity
4. **Roadmap readiness**: clear seams for scaling into microservices or specialized workers when needed

---

## 7) Recommended Next Documentation Additions

To further improve stakeholder readiness, add:

1. **Architecture Decision Records (ADRs)** for major tool selections
2. **Data model diagram** mapped to `SQL.SQL`
3. **Service-level error taxonomy** per API endpoint
4. **Performance envelope** (latency budgets and expected throughput)
5. **Security controls summary** (PII handling, retention, access boundaries)

---

## 8) Reference Files in This Repository

- `SPEC.md`
- `package.json`
- `src/app/layout.js`
- `src/app/page.js`
- `src/context/AnalysisContext.jsx`
- `src/lib/aiService.js`
- `src/lib/fileProcessing.js`
- `src/lib/db.js`
- `src/lib/init-db.js`
- `SQL.SQL`
