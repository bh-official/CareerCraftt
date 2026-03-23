# CareerCraft Product Specification

## 1. Purpose and Scope

CareerCraft is a full-stack web application that helps authenticated users evaluate job-fit, generate application assets, and manage an application pipeline over time.

This specification reflects the **current implemented system** and reconciles requirements with:

- current API behavior and route boundaries,
- implemented upload and extraction pipeline,
- persistence model and lifecycle events,
- current user-facing outcomes,
- the user-story baseline in `docs/user-stories.md`.

This document is implementation-aware but avoids low-level code details where possible.

---

## 2. Product Overview

### 2.1 Core User Outcomes

Users can:

1. Provide resume and job description content (manual text and file upload).
2. Run AI-assisted role fit analysis and receive structured results with weighted scoring.
3. Generate follow-on artifacts (cover letter, optimization, interview prep, career development).
4. Persist and manage opportunities as application sessions.
5. Track lifecycle changes in a history timeline.

### 2.2 Primary Personas

- Job seekers (primary)
- Career changers
- Career coaches supporting individual users

---

## 3. System Context

### 3.1 Platform

- Next.js app router web application
- React frontend with context-based state management
- Next.js API routes for backend operations
- PostgreSQL persistence
- Clerk authentication and route protection

### 3.2 Data and Control Flow

1. User submits text and/or uploaded files.
2. Upload API validates file and extracts normalized text.
3. Analysis API validates auth and input, runs AI analysis, computes weighted score, persists session and analysis.
4. Additional generation APIs persist/retrieve session-linked artifacts.
5. Dashboard APIs provide CRUD lifecycle management and history retrieval, scoped per user.

---

## 4. Functional Requirements

## 4.1 Authentication and Access Boundaries

### FR-AUTH-1 Route protection

- Public routes include landing/marketing/auth entry points and upload endpoint.
- Analysis, dashboard, sessions, and core persistence APIs require authentication.
- Unauthorized access to protected APIs returns an explicit unauthorized response.

### FR-AUTH-2 User-scoped data access

- Session/application read-write operations are scoped to authenticated user ownership.
- Unauthorized ownership attempts are rejected.

### FR-AUTH-3 User provisioning for persistence

- User records are ensured before creating dependent session data when needed.

---

## 4.2 Upload and Text Extraction

### FR-UP-1 Supported file types

The upload pipeline supports:

- PDF (`.pdf`)
- DOCX (`.docx`)
- TXT (`.txt`)

### FR-UP-2 Validation behavior

- Missing file: rejected with client error.
- Unsupported extension/type: rejected with explicit supported-format message.
- Oversized file (>5MB): rejected with explicit size message.

### FR-UP-3 Extraction behavior

- PDF: extracted using `pdf-parse` parser function import path that avoids package entrypoint side effects.
- DOCX: extracted using `mammoth` raw text extraction.
- TXT: extracted from UTF-8 content.

### FR-UP-4 Text normalization

Extraction output is normalized by:

- trimming excess newlines,
- collapsing repeated spaces/tabs,
- normalizing line endings,
- trimming per-line and global text.

### FR-UP-5 Upload API outcomes

- Success returns: `success`, extracted `text`, optional `metadata`/`warnings`, and file name.
- Validation/extraction business failures return controlled non-2xx responses.
- Unhandled failures return controlled server error response.

### FR-UP-6 Validated PDF side-effect fix

The PDF pathway must continue using a side-effect-safe import path (`pdf-parse/lib/pdf-parse.js`) so that package entrypoint test/demo behavior cannot trigger ENOENT test-file failures in runtime environments.

---

## 4.3 Analysis Experience

### FR-AN-1 Input requirements

Analysis requires:

- job description text,
- resume text.

Missing required fields return validation errors.

### FR-AN-2 Scoring model

The overall score is weighted from five dimensions:

- Skills (30%)
- Experience (35%)
- Education (15%)
- Keywords (10%)
- Additional factors (10%)

### FR-AN-3 Persistence behavior

- If no session ID is supplied, analysis creates a new user-scoped session.
- If a session ID is supplied, analysis updates that owned session.
- Analysis results persist as one row per session (upsert semantics).

### FR-AN-4 Response contract

Successful analysis returns:

- `success` flag,
- `sessionId`,
- structured analysis payload with overall score and component sections.

### FR-AN-5 Client UX behavior

- UI tracks loading/generating states.
- API errors are surfaced to users.
- Non-JSON/invalid responses are handled gracefully with fallback messaging.

---

## 4.4 Generated Artifact Flows

### FR-GEN-1 Artifact families

The product supports generation/persistence of:

- Cover letter
- Application optimization
- Interview preparation
- Career development guidance

### FR-GEN-2 Session linkage

Generated artifacts are associated with a session when provided.

### FR-GEN-3 Reliability in persistence

- Persistence behavior must remain robust across schema drift scenarios.
- Cover-letter persistence supports update/insert behavior compatible with existing database states.

---

## 4.5 Application Lifecycle Management

### FR-LC-1 Application list/detail

Users can list and retrieve application/session data with:

- pagination,
- search,
- status filtering,
- current score summary fields.

### FR-LC-2 Application updates

Users can update owned application fields and status (validated against allowed statuses).

### FR-LC-3 Application deletion

Users can delete owned applications; missing records return not-found.

### FR-LC-4 Dashboard interaction quality

- Responsive list views (table/cards)
- Edit and delete flows
- Optimistic updates with rollback on failure
- Loading, empty, and error states

---

## 4.6 Timeline and History

### FR-EVT-1 Event recording

The system records lifecycle events for relevant actions, including create/analyze/edit/status-change/delete pathways.

### FR-EVT-2 Event retrieval

Users can retrieve their own event timeline with pagination, newest-first ordering.

### FR-EVT-3 Timeline UX

Dashboard history presents event type/label/timestamp and contextual metadata.

---

## 5. API Behavior Standards

## 5.1 Response consistency

- Success responses use stable JSON payload structures with clear `success` indicators where applicable.
- Errors return explicit messages and appropriate status classes:
  - Unauthorized
  - Validation/client errors
  - Not found/forbidden where applicable
  - Server failures

## 5.2 Upload status semantics

- Missing/invalid file input: client error.
- Extraction business failure (e.g., no text): unprocessable-style failure.
- Unhandled exception: server error.

## 5.3 Protected API semantics

- Protected API routes enforce authentication and ownership checks.
- Unauthorized or cross-owner operations are rejected.

---

## 6. Persistence Model (Current)

## 6.1 Canonical entities

Core persisted entities include:

- `users`
- `sessions`
- `analysis_results`
- `cover_letters`
- `application_optimizations`
- `interview_prep`
- `career_development`
- `application_events`
- plus utility/support tables retained in schema.

## 6.2 Key relationships

- Session belongs to one user.
- Analysis/artifact records are session-linked.
- Event records are user-scoped and optionally session-linked.

## 6.3 Data integrity expectations

- One-row-per-session constraints/indices for analysis and generated artifacts.
- Cover-letter uniqueness behavior aligned to current migration hardening.
- Migration pathways normalize legacy schema states.

## 6.4 Security posture in data layer

- User-scoped data access is enforced in application queries.
- Database schema includes row-level security hardening policies for canonical tables.

---

## 7. Non-Functional Requirements

## 7.1 Reliability

- Upload and analysis pipelines fail gracefully with controlled errors.
- Known regression classes (PDF parser import side effects, schema drift upsert issues, chunk/cache instability) are addressed with resilient patterns and recovery guidance.

## 7.2 Observability

- Server-side logging exists for critical failure paths and diagnostics.
- Error logs include sufficient context for route-level triage.

## 7.3 Performance and scale constraints

- Upload validation limits request size for parser stability.
- List/history APIs support pagination and bounded limits.

---

## 8. User-Facing Outcomes and UX Contracts

Users should reliably experience:

1. Clear guidance on supported upload formats and validation errors.
2. Stable analysis flow from input to scored output.
3. Persistent session continuity across analysis and generated artifacts.
4. Practical dashboard management for application lifecycle.
5. Transparent history of major lifecycle events.

---

## 9. Explicitly Out of Scope (Current Product State)

The current system does **not** require:

- multi-file comparison workflows in a single upload transaction,
- candidate-to-candidate recruiter evaluation workspace,
- external ATS direct sync integrations,
- background queue orchestration for asynchronous processing,
- broad public API platform commitments.

---

## 10. Consistency Notes Across Project Docs

- This specification aligns with current behavior described in `docs/user-stories.md`.
- This specification supersedes stale assumptions in older specs where they conflict with current routes, APIs, or persistence.
- `README.md` remains a minimal project bootstrap document; product requirements are defined here and in user stories.

---

## 11. Acceptance of This Specification Revision

This revision is accepted when:

1. No requirement contradicts current implemented behavior.
2. Upload/extraction requirements explicitly include the validated PDF side-effect-safe import fix.
3. Auth boundaries, API semantics, persistence model, and user outcomes are internally consistent.
4. Stale or contradictory requirements from prior spec versions are removed or updated.
