# CareerCraft Dependency & Local Setup Checklist (Evidence-Based)

## 1) Repository evidence audited

This checklist is based on concrete files in this repository, including:

- Project readme: [`README.md`](README.md:1)
- Package manifest: [`package.json`](package.json:1)
- Lockfile: [`package-lock.json`](package-lock.json:1)
- Next config: [`next.config.mjs`](next.config.mjs:1)
- PostCSS/Tailwind config: [`postcss.config.mjs`](postcss.config.mjs:1)
- ESLint config: [`eslint.config.mjs`](eslint.config.mjs:1)
- Auth middleware/proxy: [`src/proxy.ts`](src/proxy.ts:1)
- App layout/auth provider wiring: [`src/app/layout.js`](src/app/layout.js:1)
- API/server code paths:
  - [`src/app/api/analyze/route.js`](src/app/api/analyze/route.js:1)
  - [`src/app/api/session/route.js`](src/app/api/session/route.js:1)
  - [`src/app/api/upload/route.js`](src/app/api/upload/route.js:1)
  - [`src/app/api/cover-letter/route.js`](src/app/api/cover-letter/route.js:1)
  - [`src/app/api/optimization/route.js`](src/app/api/optimization/route.js:1)
  - [`src/app/api/career/route.js`](src/app/api/career/route.js:1)
- DB client and schema/migration assets:
  - [`src/lib/db.js`](src/lib/db.js:1)
  - [`src/lib/init-db.js`](src/lib/init-db.js:1)
  - [`SQL.SQL`](SQL.SQL:1)
- AI/file-processing libs:
  - [`src/lib/aiService.js`](src/lib/aiService.js:1)
  - [`src/lib/fileProcessing.js`](src/lib/fileProcessing.js:1)
- Current env file in repo root: [`.env`](.env:1)

---

## 2) Required runtime stack

### 2.1 Node.js version policy (exact evidence)

- `next@16.2.0` requires Node `>=20.9.0` in lockfile metadata: [`package-lock.json`](package-lock.json:5424), [`package-lock.json`](package-lock.json:5440)
- `@clerk/nextjs@7.0.6` also requires Node `>=20.9.0`: [`package-lock.json`](package-lock.json:306), [`package-lock.json`](package-lock.json:318)
- `@clerk/shared@4.3.2` requires Node `>=20.9.0`: [`package-lock.json`](package-lock.json:344), [`package-lock.json`](package-lock.json:357)

**Effective minimum:** **Node.js 20.9.0+** (mandatory for this dependency set).

### 2.2 Package manager and version expectations

- Lockfile is npm lockfile v3: [`package-lock.json`](package-lock.json:4)
- Script examples in readme include multiple managers, but project has committed npm lockfile: [`README.md`](README.md:7), [`README.md`](README.md:8), [`package-lock.json`](package-lock.json:1)

**Practical expectation:** use **npm** to match committed lockfile.

### 2.3 OS/shell assumptions

- No explicit OS constraint is declared in manifest/config files: [`package.json`](package.json:1), [`next.config.mjs`](next.config.mjs:1)
- Build relies on Next prebuilt SWC binaries selected by platform (optional deps listed under `next`): [`package-lock.json`](package-lock.json:5443)

**Conclusion:** no repository-enforced OS/shell requirement beyond a supported Node/npm environment.

---

## 3) JavaScript dependencies (installable)

Source of truth: root package manifest and lockfile root package entry: [`package.json`](package.json:11), [`package-lock.json`](package-lock.json:7)

### 3.1 Production dependencies

- `@clerk/nextjs` `^7.0.6` — auth provider/middleware hooks used in app and API/auth routes: [`package.json`](package.json:12), [`src/app/layout.js`](src/app/layout.js:4), [`src/proxy.ts`](src/proxy.ts:1)
- `@radix-ui/react-icons` `^1.3.2`: [`package.json`](package.json:13)
- `framer-motion` `^12.38.0` — used in login/signup UI: [`package.json`](package.json:14), [`src/app/login/page.js`](src/app/login/page.js:7)
- `jspdf` `^4.2.1` — PDF export utility: [`package.json`](package.json:15), [`src/lib/export.js`](src/lib/export.js:1)
- `lucide-react` `^0.577.0` — icon set used in UI components/pages: [`package.json`](package.json:16), [`src/app/features/page.js`](src/app/features/page.js:6)
- `mammoth` `^1.12.0` — DOCX parsing: [`package.json`](package.json:17), [`src/lib/fileProcessing.js`](src/lib/fileProcessing.js:1)
- `next` `16.2.0` — framework runtime/build: [`package.json`](package.json:18)
- `pdf-parse` `1.1.1` — PDF parsing in file pipeline: [`package.json`](package.json:19), [`src/lib/fileProcessing.js`](src/lib/fileProcessing.js:61)
- `pg` `^8.20.0` — PostgreSQL client used by API routes/libs: [`package.json`](package.json:20), [`src/lib/db.js`](src/lib/db.js:1)
- `react` `19.2.4`: [`package.json`](package.json:21)
- `react-dom` `19.2.4`: [`package.json`](package.json:22)

### 3.2 Development dependencies

- `@tailwindcss/postcss` `^4`: [`package.json`](package.json:25), [`postcss.config.mjs`](postcss.config.mjs:3)
- `eslint` `^9`: [`package.json`](package.json:26)
- `eslint-config-next` `16.2.0`: [`package.json`](package.json:27), [`eslint.config.mjs`](eslint.config.mjs:2)
- `tailwindcss` `^4`: [`package.json`](package.json:28)

---

## 4) System-level / native prerequisites

### 4.1 Mandatory

1. **Node.js 20.9.0+** (see section 2): [`package-lock.json`](package-lock.json:5440)
2. **npm** (lockfile-backed install flow): [`package-lock.json`](package-lock.json:4)
3. **PostgreSQL-compatible database endpoint** reachable via connection string
   - DB pool consumes `DATABASE_URL`: [`src/lib/db.js`](src/lib/db.js:4)
   - API write/read paths depend on DB availability (example): [`src/app/api/analyze/route.js`](src/app/api/analyze/route.js:3), [`src/app/api/session/route.js`](src/app/api/session/route.js:2)

### 4.2 Native/runtime notes

- Next may use optional `sharp` and SWC platform packages; they are declared as optional dependencies under `next`: [`package-lock.json`](package-lock.json:5443)
- No custom native build step is defined in scripts: [`package.json`](package.json:5)

---

## 5) External services and required environment variables

### 5.1 Environment variable matrix (code-path mapped)

| Variable                            | Required?                            | Why / code path                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                      | Mandatory                            | Used by PostgreSQL pool for all DB-backed APIs: [`src/lib/db.js`](src/lib/db.js:4), [`src/app/api/session/route.js`](src/app/api/session/route.js:2)                                       |
| `OPENROUTER_API_KEY`                | Mandatory for AI features            | Checked before OpenRouter calls; throws if absent: [`src/lib/aiService.js`](src/lib/aiService.js:1), [`src/lib/aiService.js`](src/lib/aiService.js:9)                                      |
| `NEXT_PUBLIC_APP_URL`               | Optional (fallback exists)           | Used as OpenRouter `HTTP-Referer`, falls back to localhost: [`src/lib/aiService.js`](src/lib/aiService.js:18), [`src/lib/aiService.js`](src/lib/aiService.js:19)                           |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Mandatory for Clerk auth integration | Clerk provider/middleware/auth hooks are used globally; env key present in repo env sample: [`src/app/layout.js`](src/app/layout.js:4), [`src/proxy.ts`](src/proxy.ts:1), [`.env`](.env:8) |
| `CLERK_SECRET_KEY`                  | Mandatory for server-side Clerk auth | Server routes call Clerk `auth()` and middleware protects routes: [`src/app/api/analyze/route.js`](src/app/api/analyze/route.js:4), [`src/proxy.ts`](src/proxy.ts:25), [`.env`](.env:9)    |

### 5.2 External services inferred from code

- **OpenRouter API** (`https://openrouter.ai/api/v1`) for AI generation: [`src/lib/aiService.js`](src/lib/aiService.js:2), [`src/lib/aiService.js`](src/lib/aiService.js:13)
- **Clerk** for authentication/session/route protection: [`src/app/layout.js`](src/app/layout.js:4), [`src/proxy.ts`](src/proxy.ts:1), [`src/app/api/session/route.js`](src/app/api/session/route.js:3)
- **PostgreSQL/Supabase-style DB endpoint** for persistence: [`src/lib/db.js`](src/lib/db.js:4), [`.env`](.env:5)

---

## 6) Database setup requirements

### 6.1 Schema source options present in repo

- Programmatic bootstrap helper exists but is not wired to npm scripts: [`src/lib/init-db.js`](src/lib/init-db.js:145), [`package.json`](package.json:5)
- Canonical SQL migration/schema file exists with extensive DDL/RLS: [`SQL.SQL`](SQL.SQL:1), [`SQL.SQL`](SQL.SQL:18), [`SQL.SQL`](SQL.SQL:294)

### 6.2 Practical requirement

Before first successful app run involving DB-backed routes, tables/constraints must exist for:

- `users`, `sessions`, `analysis_results`, `cover_letters`, `application_optimizations`, `interview_prep`, `career_development`, `application_events` (all referenced by API routes): [`src/app/api/session/route.js`](src/app/api/session/route.js:89), [`src/app/api/analyze/route.js`](src/app/api/analyze/route.js:95), [`src/lib/applicationEvents.js`](src/lib/applicationEvents.js:24)

---

## 7) Clean-machine setup command sequence (clone → first run)

> Commands below are evidence-aligned; where repository automation is missing, manual steps are called out explicitly.

### 7.1 Install

```bash
git clone <repo-url>
cd CareerCrafttemp
node -v
npm -v
npm ci
```

Why npm + lockfile-backed install: [`package-lock.json`](package-lock.json:1), [`package-lock.json`](package-lock.json:4)

### 7.2 Create environment file

No `.env.example` is present in repo evidence; create `.env` manually with required keys.

```bash
cat > .env <<'EOF'
OPENROUTER_API_KEY=<your_openrouter_api_key>
DATABASE_URL=<your_postgres_connection_string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
# Optional but recommended
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

Evidence for required vars: [`src/lib/aiService.js`](src/lib/aiService.js:1), [`src/lib/db.js`](src/lib/db.js:4), [`src/app/layout.js`](src/app/layout.js:4), [`src/proxy.ts`](src/proxy.ts:1)

### 7.3 Initialize database schema

Use the canonical SQL file (manual step; no npm migration script exists).

```bash
psql "$DATABASE_URL" -f SQL.SQL
```

Evidence: [`SQL.SQL`](SQL.SQL:1), [`package.json`](package.json:5)

### 7.4 Run app locally

```bash
npm run dev
```

Evidence: [`package.json`](package.json:6), [`README.md`](README.md:5)

### 7.5 Verify startup and critical paths

1. Open `http://localhost:3000` and verify app shell loads: [`README.md`](README.md:17)
2. Hit auth pages `/login` and `/signup` (Clerk components render): [`src/app/login/page.js`](src/app/login/page.js:62), [`src/app/signup/page.js`](src/app/signup/page.js:62)
3. Test file upload endpoint with PDF/DOCX/TXT: [`src/app/api/upload/route.js`](src/app/api/upload/route.js:6), [`src/lib/fileProcessing.js`](src/lib/fileProcessing.js:30)
4. Test analysis flow on authenticated route `/analysis` (requires Clerk + DB + OpenRouter): [`src/proxy.ts`](src/proxy.ts:12), [`src/app/api/analyze/route.js`](src/app/api/analyze/route.js:8), [`src/lib/aiService.js`](src/lib/aiService.js:13)

### 7.6 Production-like verification

```bash
npm run build
npm run start
```

Evidence: [`package.json`](package.json:7), [`package.json`](package.json:8)

---

## 8) Mandatory vs optional / feature-gated classification

### 8.1 Mandatory to boot app and core authenticated analysis workflow

- `next`, `react`, `react-dom`: framework/runtime: [`package.json`](package.json:18)
- `@clerk/nextjs`: auth provider + middleware + server auth usage: [`src/app/layout.js`](src/app/layout.js:4), [`src/proxy.ts`](src/proxy.ts:1), [`src/app/api/session/route.js`](src/app/api/session/route.js:3)
- `pg`: all persistence routes rely on DB query layer: [`src/lib/db.js`](src/lib/db.js:1), [`src/app/api/session/route.js`](src/app/api/session/route.js:2)
- `OPENROUTER_API_KEY` + OpenRouter reachability: AI route handlers call AI service and fail without key: [`src/lib/aiService.js`](src/lib/aiService.js:9)

### 8.2 Feature-gated / optional at runtime

- `NEXT_PUBLIC_APP_URL`: optional due to localhost fallback in AI header: [`src/lib/aiService.js`](src/lib/aiService.js:19)
- `jspdf`: only needed for PDF export feature: [`src/lib/export.js`](src/lib/export.js:1)
- `mammoth` and `pdf-parse`: only needed for DOCX/PDF upload parsing: [`src/lib/fileProcessing.js`](src/lib/fileProcessing.js:1), [`src/lib/fileProcessing.js`](src/lib/fileProcessing.js:61)
- `framer-motion`, `lucide-react`, `@radix-ui/react-icons`: UI/UX and iconography dependencies, not DB/AI backend-critical: [`src/app/login/page.js`](src/app/login/page.js:7), [`src/app/features/page.js`](src/app/features/page.js:6), [`package.json`](package.json:13)

---

## 9) Startup blockers and assumptions (strictly evidence-based)

1. **No committed `.env.example`**
   - Required keys must be inferred from code and existing local `.env`: [`.env`](.env:1), [`src/lib/db.js`](src/lib/db.js:4), [`src/lib/aiService.js`](src/lib/aiService.js:1)

2. **No automated DB migration/init script in npm scripts**
   - `package.json` has only dev/build/start/lint: [`package.json`](package.json:5)
   - Schema exists in SQL file and helper function, but execution path is not wired: [`SQL.SQL`](SQL.SQL:1), [`src/lib/init-db.js`](src/lib/init-db.js:145)

3. **Node version not declared in root manifest `engines`**
   - Required version is inferred from transitive package constraints (`next`/`clerk`), not from root policy: [`package.json`](package.json:1), [`package-lock.json`](package-lock.json:5440), [`package-lock.json`](package-lock.json:318)

4. **Potential schema drift risk between helper schema and canonical SQL**
   - Helper creates legacy `"user"` table: [`src/lib/init-db.js`](src/lib/init-db.js:8)
   - Canonical SQL defines `users` and migrates/drops legacy table: [`SQL.SQL`](SQL.SQL:18), [`SQL.SQL`](SQL.SQL:272)

5. **Repository currently contains real-looking secrets in tracked `.env`**
   - This is a security and reproducibility blocker for clean setup guidance; replace with local secrets and rotate leaked credentials: [`.env`](.env:2), [`.env`](.env:5), [`.env`](.env:9)

6. **`scripts/` automation expected by some docs/context is absent in current tree**
   - Current repository snapshot does not include runnable migration/setup scripts under `scripts/`; setup must use manual SQL path evidenced above.

---

## 10) Quick go/no-go checklist

- [ ] Node.js `>=20.9.0` installed: [`package-lock.json`](package-lock.json:5440)
- [ ] `npm ci` completed successfully: [`package-lock.json`](package-lock.json:4)
- [ ] `.env` created with required values: [`src/lib/db.js`](src/lib/db.js:4), [`src/lib/aiService.js`](src/lib/aiService.js:1)
- [ ] Database schema applied from [`SQL.SQL`](SQL.SQL:1)
- [ ] Clerk keys valid and auth routes accessible: [`src/proxy.ts`](src/proxy.ts:25), [`src/app/login/page.js`](src/app/login/page.js:62)
- [ ] `npm run dev` serves app locally: [`package.json`](package.json:6)
- [ ] `npm run build` passes: [`package.json`](package.json:7)
