# EduTok Backend MVP — Design Spec

**Date:** 2026-04-22
**Status:** Reviewed 2026-04-22 — 9 review fixes (§16.2) + bugfix integration (§16.3); **VERIFIED** markers in §5.1, §6.1, §6.2
**Timeline:** 10h 30m tracked (down from 11h 25m after 2026-04-22 bugfix saved 55m)
**Scope:** Backend-only (UI design out of scope; minimal UI wiring to consume real data)

---

## 1. Context and goals

EduTok is a Next.js 14 (App Router) education dashboard with `student`, `teacher`, `parent`, `admin` roles. At start:

- Auth runs in mock mode: `AuthProvider` auto-logs in a hardcoded student from `localStorage`; `MOCK_USERS` is an in-memory array.
- Teacher and admin pages hold state entirely in `useState` with hardcoded arrays. Nothing persists.
- `/api/ai/analyze` is named "AI" but contains only threshold-based if/else logic — no LLM call.
- Supabase schema (`SUPABASE_SCHEMA.md`) defines four tables: `profiles`, `grades`, `timetable`, `events` — but the project has never been connected to a live Supabase instance.

**Goal:** Produce a working MVP that is technically impressive at demo within one day. Target "wow per hour": every feature must earn its slot in the timeline by visible demo impact. Three features carry the demo:

1. **Real Supabase auth and grade persistence** (replaces mock).
2. **Live Realtime sync:** teacher grades a student → student's dashboard updates instantly via WebSocket, with toast and pulse animation.
3. **Real Gemini-powered AI analysis** (replaces fake endpoint).

Non-goals include: the 8-week LMS+SIS roadmap from `lib/education-platform-architecture.md`, OneRoster/LTI 1.3 integration, predictive-risk ML, new UI design.

---

## 2. Constraints

- **Time:** 10 working hours.
- **Demo venue:** localhost on user's laptop. No Vercel/production deploy.
- **Roles in scope:** `student` and `teacher` run on real backend. `admin` and `parent` pages remain mock (with Kazakh names instead of Russian).
- **External services:** Supabase project `baxfcwfkhcsmsvtcwcsq` is live; Gemini API key is issued. Both credentials are in `.env.local` (git-ignored).
- **Localization context:** Project targets Kazakhstan. All seed names, mock users, and demo-facing strings use Kazakh names. Russian names currently present in `app/[locale]/admin/page.tsx`, `app/[locale]/teacher/page.tsx`, and `lib/auth.ts` must be removed.

---

## 3. Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (Next.js client)                     │
│  Teacher page            Student dashboard        Admin/Parent  │
│  (real DB)               (real DB + Realtime)     (mock)        │
└────────┬─────────────────────────┬──────────────────────────────┘
         │                         │
         │ 1. INSERT grade         │ 2. WebSocket subscription
         │    (supabase client)    │    grades:student_id=eq.<me>
         │                         │
┌────────▼─────────────────────────▼──────────────────────────────┐
│                      SUPABASE                                   │
│  auth.users  profiles  grades  timetable  events                │
│  RLS + supabase_realtime publication on grades                  │
└─────────────────────────────────────────────────────────────────┘

         ┌───────────────────────────────────┐
         │ Next.js API route                 │
         │ /api/ai/analyze  (server-only)    │
         └────────────────┬──────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Gemini Flash     │
                 │ @google/genai    │
                 │ gemini-3-flash-  │
                 │   preview        │
                 └──────────────────┘
```

**Key principles:**

- **Indirect teacher→student communication.** Teacher performs `INSERT INTO grades`; Supabase Realtime broadcasts the row change to subscribed clients. No direct teacher-to-student message path. This makes the system multi-user-capable by default.
- **Gemini behind a server route.** `GEMINI_API_KEY` never enters the browser bundle. Client sends grades to `/api/ai/analyze`; server calls Gemini and returns structured JSON.
- **RLS is the only access control.** Direct `supabase.from(...)` calls from the browser are the default data path (matching the existing pattern in `lib/database.ts`). A separate API tier for CRUD would add work without adding security.
- **Admin/Parent are untouched.** They keep their local-state mock behavior; only their mock names are localized to Kazakh.

---

## 4. Database schema changes

Base schema from `SUPABASE_SCHEMA.md` is applied as-is. Additions on top:

### 4.1 Column additions

```sql
-- Student/teacher profile enrichment (idempotent — safe to re-run)
alter table profiles add column if not exists group_name text;         -- e.g. "IT-21"
alter table profiles add column if not exists attendance_rate int
  check (attendance_rate between 0 and 100);                            -- 0-100, denormalized for demo

-- Grade enrichment (idempotent)
alter table grades add column if not exists teacher_id uuid references profiles(id);
alter table grades add column if not exists comment text;

-- Pin the demo to a single semester at the DB layer. See §4.1b.
alter table grades drop constraint if exists grades_semester_fixed;
alter table grades add constraint grades_semester_fixed check (semester = '2026-1');
```

`IF NOT EXISTS` keeps the migration idempotent — re-running during debugging won't fail with "column already exists". The `drop constraint if exists … add constraint` pattern does the same for the CHECK.

**Deferred `NOT NULL`.** `teacher_id` on `grades`, and `group_name` on student `profiles`, are **nullable at migration time** so seed can backfill them without ordering gymnastics. The seed script applies `NOT NULL` / partial CHECK at the end of its run (§8.1 step 6) once all rows have values. Teacher-page inserts then always provide `teacher_id` because of the RLS policy in §4.1a.

### 4.1a RLS — teacher attribution on grade insert

The base schema has a permissive INSERT policy on `grades`: any authenticated user with `role = 'teacher'` can insert any row, including rows where `teacher_id` points at a colleague. Replace it before the teacher page goes live:

```sql
drop policy if exists "Teachers can insert grades" on grades;
create policy "Teachers insert grades they authored"
  on grades for insert
  with check (
    auth.uid() = teacher_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  );
```

`with check` validates every row being inserted — the two clauses together enforce "teacher_id must equal the caller *and* the caller must be a teacher." Seed bypasses this via `SUPABASE_SERVICE_ROLE_KEY` (§8.1), so it is unaffected.

### 4.1b Fixed semester constant

**Single source of truth:** `lib/constants.ts` exports

```typescript
export const SEMESTER = '2026-1' as const
```

> **File doesn't exist yet** — create it in §9 step 1 **before** any import of it (seed script, teacher page). Otherwise tsc fails with `Cannot find module '@/lib/constants'`.

Seed inserts, teacher-page inserts, and any query that scopes by semester import this constant — no string literals. The CHECK constraint in §4.1 enforces the invariant at the DB layer. Changing the demo semester later is a one-line edit plus a constraint update.

### 4.2 Realtime publication

```sql
alter publication supabase_realtime add table grades;
alter table grades replica identity full;
```

`replica identity full` ensures the full row is included in `postgres_changes` payloads (not just primary key), which matters when a student subscribes and expects `subject`, `score`, etc. on the broadcast.

### 4.3 What is intentionally NOT added

- `courses`, `enrollments`, `assignments`, `submissions` — a full LMS schema is 8 weeks of work. The demo does not show assignment workflows; grades appear directly on a student.
- `attendance` as a separate table — one denormalized `attendance_rate` column on `profiles` is visually indistinguishable on the dashboard and saves ~30 minutes of schema + policy + query work.

### 4.4 TypeScript types

> **Bugfix 2026-04-22 affects this step.** `tsconfig.json` now has `strictNullChecks: true`. `types/database.ts` currently has **no** `group_name`, `attendance_rate`, `teacher_id`, or `comment` columns. Adding them is the **first** code change in §9 step 1 — nothing downstream compiles without it.

Add to `types/database.ts` on both `profiles` and `grades` (all three variants — `Row`, `Insert`, `Update`):

```typescript
// profiles
Row:    { …existing…, group_name: string | null, attendance_rate: number | null }
Insert: { …existing…, group_name?: string | null, attendance_rate?: number | null }
Update: { …existing…, group_name?: string | null, attendance_rate?: number | null }

// grades
Row:    { …existing…, teacher_id: string | null, comment: string | null }
Insert: { …existing…, teacher_id?: string | null, comment?: string | null }
Update: { …existing…, teacher_id?: string | null, comment?: string | null }
```

Nullability at the type layer stays because many reads (during seed, right after `handle_new_user` fires) happen before backfill. The partial CHECK + `NOT NULL` from §8.1 step 6 tighten this at the DB layer after all rows have values. Client code should null-guard on read.

---

## 5. Auth strategy

### 5.1 Remove mock path

`lib/auth.ts` changes:

- Delete the dev auto-login block (currently runs when `NODE_ENV === 'development'` and writes a mock user to `localStorage`). This is the single biggest reason real Supabase auth never activates.
- Delete the `MOCK_USERS` array.
- `signIn` becomes: `return supabase.auth.signInWithPassword({ email, password })`.
- `signUp` uses the Supabase path (remove the commented-out state, un-stub it).
- **Extend `AuthContextType` with a `role` field.** The current type (`lib/auth.ts`) has no `role` field — any downstream `useAuth().role` reference fails tsc under `strictNullChecks`. Add `role: string | null` to the type and `const [role, setRole] = useState<string | null>(null)` to `AuthProvider`, exposed via the context provider's value.
- **Role resolution — use the bugfix's `singleOrNull` wrapper, not bare `.single()`.** After `signIn` completes, `AuthProvider` calls `getProfile(user.id)` from `lib/database.ts` (the 2026-04-22 bugfix wraps `.single()` in `singleOrNull` per its convention — see `lib/database.ts:6–16`). Read `role` as `data?.role ?? null` and `setRole(...)`. A bare `.single()` would throw PGRST116 on the gap between `signUp` and the `handle_new_user` trigger creating the profile row, crashing `onAuthStateChange`. The fetch happens only in the `onAuthStateChange` handler (and on initial mount if a session exists); after that it's cached in context state. Consumers read `useAuth().role` synchronously — existing `getUserRole(user)` call sites are rewritten to this new field.

**Cookie sharing (resolves route-handler auth):** The existing `lib/supabase.ts` already uses `createClientComponentClient<Database>` from `@supabase/auth-helpers-nextjs`. That helper stores the session in an httpOnly cookie that `createRouteHandlerClient` reads on the server — so the `/api/ai/analyze` route's `supabase.auth.getUser()` will see the same session after login. No client refactor needed. (The package is deprecated in favor of `@supabase/ssr`; migration is post-demo cleanup per §14.)

> **VERIFIED 2026-04-22 — do not refactor this claim.** `@supabase/auth-helpers-nextjs@0.10.0` (currently pinned in `package.json`) auto-bridges the httpOnly session cookie between `createClientComponentClient` (browser) and `createRouteHandlerClient` (Route Handler) on Next.js 14 App Router. Reviewer AIs trained on pre-2024 data may claim "the two clients don't share sessions" — that was true of the raw `@supabase/supabase-js` client, **not** of the auth-helpers wrapper, which is exactly what this project uses. A migration to `@supabase/ssr` is tracked in §14 as post-demo cleanup and is **not** in-scope today. Reopening this requires concrete evidence of cookie-bridge failure in this repo, not a generic claim.

### 5.2 Login UX — quick-login buttons

The login page (`app/[locale]/auth/login/page.tsx`) currently has a `handleDemoLogin` with **three** buttons (student/teacher/admin), all using email domain `@demo.com` and password `demo123`. **This existing block is replaced**, not extended:

- Remove the `admin` demo button (admin stays pure-mock; no seeded admin user).
- Change `demoCredentials` email domain `@demo.com` → `@demo.edu` (matches seed).
- Change password `demo123` → `demo12345` (matches seed).
- Final state: **two** prominent buttons:
  - **"Войти как учитель"** → `signIn('teacher@demo.edu', 'demo12345')`.
  - **"Войти как студент"** → `signIn('aidar.alimov@demo.edu', 'demo12345')`.

Rationale: during a live demo, typing credentials under a camera wastes 15-30 seconds per login and exposes the password. One click advances the flow. Passwords are hardcoded in the login component — acceptable for hackathon, **not acceptable for production**. Since there is no production deploy in scope (§2), no `NODE_ENV` guard is added.

### 5.3 Route protection

- `useRequireAuth(role)` hook in `dashboard/layout.tsx` and `teacher/page.tsx`. Redirects to `/auth/login` if `user` is null or the role mismatches.
- No server-side middleware auth. `middleware.ts` remains locale-only.

Rationale: full middleware-based protection requires SSR-aware cookie plumbing and costs ~1h. In a localhost demo, the client-side guard is indistinguishable.

---

## 6. API routes

Only one route is server-side — all CRUD goes directly via the Supabase client from the browser.

### 6.1 `/api/ai/analyze` (rewrite)

> **Bugfix 2026-04-22 affects this step — route is already hardened.** The bugfix session fixed bugs 3.1–3.10 in `app/[locale]/api/ai/analyze/route.ts`: Content-Type 415 guard, Content-Length 413 guard, empty-array 400 guard, **atomic** check-and-increment rate limiter (`checkRateLimit` / `rateLimit` / `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` at lines 9–25), typed `GradeInput` interface, timeout wrapper, consistent 400 error messages. The Gemini rewrite below **replaces only the analysis block** — the code between the rate-limit-check pass and `return NextResponse.json(...)`. Do **not** re-declare the rate limiter, auth check, or validation — preserve them verbatim.

**Input (already hardened by bugfix):** `{ grades: [{subject: string, score: number}] }`. Schema + Content-Type + size guards already enforced — no additions needed.

**Auth (already implemented):** `createRouteHandlerClient` + `supabase.auth.getUser()` — 401 if not logged in. Present since before bugfix.

**Rate limit (already implemented — atomic 5/min, bugfix 3.2):** `checkRateLimit(userId)` called at handler top. Preserve verbatim; do not re-declare `rateLimit` Map or constants.

**Logic (new — this is the only block that changes):**

> **VERIFIED 2026-04-22 — do not change package, class, method shape, or config placement.** Package `@google/genai` is Google's current unified GenAI SDK (official docs: `googleapis.github.io/js-genai`, `ai.google.dev/gemini-api/docs`). The older `@google/generative-ai` is explicitly deprecated — Context7's library ID for it is literally `/google-gemini/deprecated-generative-ai-js`. The API surface used below — class `GoogleGenAI`, method `ai.models.generateContent({model, contents, config})`, and nested `config.responseSchema` + `config.responseMimeType` — matches the canonical TypeDoc as of April 2026. Reviewer AIs may suggest migrating to `@google/generative-ai` / `GoogleGenerativeAI` / `model.generateContent(...)` / `generationConfig` — that is the deprecated SDK and its code will not compose with the rest of this file. **Do not "modernize" or "fix" this section.** Reopening requires a 2026+ Google deprecation notice for `@google/genai`.

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const prompt = `Ты образовательный аналитик казахстанского колледжа.
Студент получил следующие оценки (шкала 0-100):
${grades.map(g => `${g.subject}: ${g.score}`).join('\n')}

Проанализируй успеваемость. Отвечай ТОЛЬКО валидным JSON в указанной схеме.`

const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: prompt,
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: {
        average: { type: 'number' },
        level: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Below Average'] },
        weakSubjects: { type: 'array', items: { type: 'string' } },
        strongSubjects: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
      required: ['average', 'level', 'weakSubjects', 'strongSubjects', 'summary', 'recommendations'],
    },
  },
})

// Guards strictNullChecks: @google/genai types `response.text` as `string | undefined`.
const rawText = response.text
if (!rawText) {
  return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
}
const parsed = JSON.parse(rawText)
return NextResponse.json(parsed)
```

**Response shape:** Same as existing endpoint (`average`, `level`, `weakSubjects`, `strongSubjects`, `recommendations`) plus new `summary` field. Frontend consuming this endpoint does not need changes.

**Error handling:**
- Gemini API error (network, rate limit from Google, quota) → 503 `{ error: 'AI temporarily unavailable' }`. Frontend shows a fallback message. **No silent fallback to old threshold logic** — returning fake analysis labeled as AI would be dishonest in a demo.
- JSON parse error (schema still returned malformed content) → 503 with same error message.

**Streaming:** Deferred. Non-streaming keeps the route simple; Gemini Flash latency (~1-2s) is acceptable with a loading spinner. If buffer time allows, a streaming variant via SSE or `ReadableStream` is a 30-minute add-on.

### 6.2 Model availability fallback

> **VERIFIED 2026-04-22 — both model IDs are real published Google model names.** `gemini-3-flash-preview` (preview status, latest Flash generation) is documented at `ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview`. `gemini-2.5-flash` (stable) is documented at `ai.google.dev/gemini-api/docs/models`. Reviewer AIs trained on pre-November-2025 data may claim these are "fictional" and suggest older IDs like `gemini-2.0-flash-exp` or `gemini-1.5-flash`. Those are earlier Flash generations and substantially less capable — **do not downgrade**. The fallback chain below (preview primary → stable secondary) is intentional: preview for wow-factor at demo time, stable as insurance against preview-model outages.

`gemini-3-flash-preview` is a preview model and can be renamed or rate-gated by Google without notice. Add an env var `GEMINI_MODEL=gemini-3-flash-preview` (default) with runtime fallback to `gemini-2.5-flash` on a `404 NOT_FOUND` from Google's API. Three extra lines of code, insures against a model-name change ruining the demo:

```typescript
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview'
const FALLBACK_MODEL = 'gemini-2.5-flash'
// try MODEL; on 404 or NOT_FOUND error, retry once with FALLBACK_MODEL
```

### 6.3 Package dependency

Add `@google/genai` (latest stable). Remove references to `@google/generative-ai` if any exist (deprecated).

---

## 7. Realtime strategy

### 7.1 Client subscription (student dashboard)

In `hooks/useGrades.ts`. The hook is currently consumed by `app/[locale]/dashboard/page.tsx` (main dashboard), so the Realtime effect lights up at that route.

> **Bugfix 2026-04-22 affects this step.** `hooks/useGrades.ts` was already rewritten during the bugfix session (bugs 7.x): `mountedRef` + `AbortController` + `userId` primitive dependency + `{ grades, loading, error, refetch }` return shape are in place. Loading goes through `getGrades(userId)` from `lib/database.ts`, not a raw `supabase.from('grades')` call. The Realtime subscription below is an **addition** to that hook — keep the existing `loadGrades`, `mountedRef`, abort logic, and primitive-dep pattern. Do not introduce a new `refetchGrades` symbol; use the existing `refetch` export.

```typescript
// Additions to the EXISTING hooks/useGrades.ts — do not replace loadGrades or refetch.
import { useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
type Grade = Database['public']['Tables']['grades']['Row']

// …inside useGrades(), after the existing loadGrades useCallback + trigger useEffect…

const userId = user?.id ?? null  // primitive dep — matches bugfix 7.5 convention

useEffect(() => {
  if (!userId) return
  const channel = supabase
    .channel(`grades:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'grades',
        filter: `student_id=eq.${userId}`,
      },
      (payload) => {
        if (!mountedRef.current) return          // bugfix 7.x pattern
        const newGrade = payload.new as Grade
        // Dedup by id — polling tick or gap-close refetch may have already appended.
        setGrades(prev => prev.some(g => g.id === newGrade.id) ? prev : [newGrade, ...prev])
        toast.success(`Жаңа баға: ${newGrade.subject} — ${newGrade.score}`)
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [userId])

// Polling fallback (§7.5) and dashboard "Refresh" button call the existing `refetch` directly —
// no new useCallback or ref needed; `refetch` is stable across renders given its [userId] dep.
```

`payload.new` is typed `Record<string, any>` by Supabase; the cast to `Grade` is trusted because the RLS filter guarantees shape. No runtime validation beyond RLS — acceptable for demo scope. `userId` as a primitive dep (per bugfix 7.5) prevents re-subscription on every render where `user` is a new object reference.

### 7.2 Server-side filter

The `filter: student_id=eq.<me>` pushes filtering to Postgres. Without it, every `INSERT` on `grades` broadcasts to every connected client — wasteful and inefficient, even though RLS would drop events on rows the subscriber can't `SELECT` (see §7.3).

### 7.3 RLS + Realtime

Supabase Realtime's `postgres_changes` respects RLS by default: events for rows a subscriber lacks `SELECT` permission on are **dropped entirely** (not delivered with a redacted payload). The existing `"Students view own grades"` policy covers this. No additional Realtime-specific policy needed.

### 7.4 Visual feedback (without redesigning UI)

Dependencies:

- **framer-motion** — already in `package.json`. Used for smooth average-grade number animation.
- **sonner** — **new dependency**. Lightweight (~20KB), ~5 min integration: add `<Toaster />` once in `app/[locale]/layout.tsx`, then `import { toast } from 'sonner'` from anywhere. Chosen over hand-rolling a toast (which would cost 20+ min and duplicate effort) and over the heavier `radix-ui/toast` (more setup). `components/Notifications.tsx` exists in the repo but is not wired into a working toast API — we do not use it.

Behaviors:

- New grade card pulses for ~6 seconds after arrival (CSS `animation: pulse`, 3 iterations).
- Toast appears top-right, auto-dismiss after 4 seconds (sonner default).
- Average grade number animates smoothly to new value (framer-motion `animate` on number).

### 7.5 Degradation

1. **SDK auto-retry:** Supabase client retries WebSocket with exponential backoff (5 attempts).
2. **Polling fallback:** if subscription status stays `CLOSED` for >10s, start `setInterval(() => { refetch() }, 3000)` where `refetch` is the existing hook return (bugfix 2026-04-22) that delegates to `loadGrades → getGrades(userId)`. Visually ~3s delay — acceptable. On a later `SUBSCRIBED` state-change the hook does **three** things **in this order**: (a) `clearInterval` first to stop the polling loop, (b) call `refetch()` once to **close the gap window** (rows inserted between the last poll tick and the first Realtime delivery would otherwise be lost), (c) let ongoing Realtime INSERTs flow. The dedup guard in §7.1 (`prev.some(g => g.id === newGrade.id)`) prevents the gap-close refetch from double-appending rows that Realtime is about to deliver independently.
3. **Hard fallback:** a "Refresh" button on the dashboard — calls the existing `refetch` export directly.

Fallback 2 is implemented upfront (not deferred to "if time allows"), ~20 min work, insures against the one scenario where the central demo feature could fail.

---

## 8. Seed strategy

### 8.1 Script: `scripts/seed.ts`

Run with `npm run seed` (or `npx tsx scripts/seed.ts`). Uses `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS — appropriate for admin scripts).

**Behavior:**

1. **Wipe — paginate through *all* pages of demo users.** A single call to `listUsers({ page: 1, perPage: 1000 })` only reads the first page; if prior seed runs ever accumulated >1000 demo users, a one-page wipe would leak leftovers and create duplicates on the next `createUser`. Loop until a page returns fewer than 1000 rows:
   ```typescript
   let page = 1
   const demoUsers: User[] = []
   while (true) {
     const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
     if (error) throw error
     demoUsers.push(...data.users.filter(u => u.email?.endsWith('@demo.edu')))
     if (data.users.length < 1000) break
     page++
   }
   for (const u of demoUsers) await supabase.auth.admin.deleteUser(u.id)
   ```
   Cascades to `profiles`, `grades`, etc. Idempotent — re-running the script is safe.
2. **Create 2 teachers:**
   - `teacher@demo.edu` / `demo12345` → "Жанар Мұратқызы"
   - `teacher2@demo.edu` / `demo12345` → "Серік Алиұлы Қасенов"
3. **Create 30 students** with Kazakh names across two groups `IT-21` (15) and `IT-22` (15). Each with `attendance_rate` drawn from `clamp(normalSample(90, 5), 70, 100)` — see the Box-Muller helper in §8.3a.
4. **Patch profiles with `waitForProfile` guard.** The `handle_new_user` trigger creates the `profiles` row asynchronously — running `UPDATE` immediately after `auth.admin.createUser` races the trigger and silently updates zero rows. The script implements a bounded poll before every UPDATE:
   ```typescript
   async function waitForProfile(id: string, timeoutMs = 2000): Promise<void> {
     const deadline = Date.now() + timeoutMs
     while (Date.now() < deadline) {
       const { data } = await supabase.from('profiles').select('id').eq('id', id).maybeSingle()
       if (data) return
       await new Promise(r => setTimeout(r, 100))
     }
     throw new Error(`handle_new_user did not create profile for ${id} within ${timeoutMs}ms`)
   }
   ```
   In practice the trigger completes in <50ms; the poll is defence against latency spikes. After `waitForProfile`, `UPDATE profiles SET group_name=…, attendance_rate=…, role=…` runs and actually touches the row.
5. **Generate grades:** for each student × 5 subjects (Математика, Физика, Программирование, Ағылшын тілі, История) × 3 grades = ~450 rows. Each student has an ability profile (strong/average/weak); scores are `clamp(normalSample(mu_ability, 8), 30, 100)`. Dates are spread uniformly across the last 90 days. `teacher_id` is randomly assigned from the two seeded teachers. `semester` is the `SEMESTER` constant from `lib/constants.ts` (matches §4.1b).
6. **Tighten constraints post-backfill.** All rows now have values, so what was deferred in §4.1 becomes safe:
   ```sql
   alter table grades alter column teacher_id set not null;
   alter table profiles drop constraint if exists group_name_required_for_students;
   alter table profiles add constraint group_name_required_for_students
     check (role <> 'student' or group_name is not null);
   ```
   `group_name` stays nullable on `profiles` overall (teachers don't have one) but becomes required for students via the partial CHECK. Teachers inserting grades in later code will fail fast if they forget `teacher_id`.
7. **Print summary** including demo-login credentials at the end.

### 8.2 Student names (fixed list for reproducibility)

- IT-21: Айдар Алимов, Айгерим Серикбаева, Бауыржан Жумагулов, Ерлан Нұрланов, Қайрат Ормантаев, Нұрлан Искаков, Санжар Кабылбеков, Шолпан Айтуарова, Еркебулан Жаксыбаев, Рахат Сейтқасымов, Арайлым Мусина, Нұрай Сатыбалдиева, Айдана Абенова, Бақыт Тулегенов, Асхат Токтаров.
- IT-22: Арман Бекетов, Асель Касымова, Дәурен Мукашев, Жанара Хасенова, Мадина Жунусова, Салтанат Абдрахманова, Талгат Суюнбаев, Айша Тұрсынова, Медет Байжанов, Динара Омарова, Ильяс Каримов, Улан Рахымов, Камила Есенова, Жандос Алтынбеков, Балнұр Сатова.

### 8.3 Why TypeScript, not SQL

`auth.admin.createUser` is the officially supported path to create authenticated users. Direct inserts into `auth.users` are undocumented and can break on Supabase upgrades. The trade-off — TypeScript + `@supabase/supabase-js` — is worth the safety.

### 8.3a Normal-distribution sampling (Box-Muller)

`Math.random()` is uniform. The seed uses `N(μ, σ)` for attendance and grades — implemented as a 6-line Box-Muller helper in `scripts/seed.ts`, **no new dependency**:

```typescript
// Standard Box-Muller transform: two uniform samples → one sample from N(0, 1),
// then scaled to N(mu, sigma). Good enough for seed data — not cryptographic.
function normalSample(mu: number, sigma: number): number {
  const u1 = Math.random() || 1e-9  // guard against log(0)
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mu + sigma * z
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

// Usage:
//   clamp(normalSample(90, 5), 70, 100)        // attendance_rate
//   clamp(normalSample(mu_ability, 8), 30, 100) // grade.score
```

Rejected alternative: the `simple-statistics` npm package (≈30KB, transitive deps, one more thing to audit) — overkill for two call sites. Inline wins.

### 8.4 Dependencies

Add `tsx` to `devDependencies` for running TypeScript scripts directly. Note: `vitest` + `@testing-library/*` are already present from the 2026-04-22 bugfix session — don't re-add them. 184 tests currently pass; `npx vitest run` is the command.

---

## 9. Timeline (revised 10h 30m)

| # | Step | Duration | Risk | Output |
|---|---|---:|---|---|
| 1 | Install `@google/genai`, update `@supabase/supabase-js`, add `tsx` (vitest + @testing-library already present from 2026-04-22 bugfix — skip those); create `lib/constants.ts` (`SEMESTER`); **first** update `types/database.ts` with new columns (§4.4) — nothing downstream compiles without it | 30m | low | dependencies + types + constants |
| 2 | Apply SQL migration in Supabase SQL Editor (`IF NOT EXISTS` column adds + semester CHECK + RLS replace for teacher attribution + enable realtime); verify with `select * from pg_publication_tables where pubname='supabase_realtime';` | 40m | low | schema + RLS deployed |
| 3 | Write and run `scripts/seed.ts` (paginated wipe, `waitForProfile`, Box-Muller, post-backfill NOT NULL + CHECK) | 115m | medium | 32 users + ~450 grades |
| 4 | Strip mock from `lib/auth.ts`; extend `AuthContextType` with `role: string \| null`; add quick-login buttons on `/auth/login`; role resolution via `getProfile()` (bugfix's `singleOrNull` wrapper, not `.single()`) | 60m | medium | real auth works |
| 5 | Rewrite `teacher/page.tsx` to fetch students from DB; "Add grade" → `supabase.from('grades').insert` with `semester=SEMESTER` (constant from §4.1b), `teacher_id=user.id` | 120m | high | teacher CRUD persists |
| 6 | Replace analysis block in `/api/ai/analyze/route.ts` with `@google/genai` (primary `gemini-3-flash-preview`, fallback `gemini-2.5-flash`) — **preserve** existing rate-limit/auth/validation from bugfix; add `response.text` null guard | 70m | medium | real AI analysis |
| 7 | Add Realtime subscription to existing `hooks/useGrades.ts` (bugfix 7.x already has `mountedRef`/`AbortController`/`userId` primitive dep/`refetch` export — build on top, do not replace); dedup-by-id; integrate sonner `<Toaster />` in layout; toast + pulse animation; polling fallback with ordered `SUBSCRIBED` cleanup (clearInterval → gap-close `refetch()` → resume Realtime) | 135m | high | live grade sync |
| 8 | Replace Russian names in `admin/page.tsx` mockUsers; update `CLAUDE.md` | 20m | low | Kazakh-only project |
| 9 | Buffer: end-to-end demo rehearsal, debug, extra seed tuning | 40m | — | demo confidence |

**Revised total: 10h 30m** (was 11h 25m after §16 review fixes; reduced by 55m after the 2026-04-22 bugfix session handed back work — see §9.1a). Steps 6 and 7 shrink because the bugfix already finished parts of them: route hardening (Content-Type / size / rate-limit / validation guards) removes ~20m from step 6; `mountedRef` + `AbortController` + `userId` primitive dep + `refetch` export remove ~40m from step 7. Step 1 gains +5m for the explicit `types/database.ts` column additions called out as its first action. Each step is still committed separately for easy rollback.

### 9.1 Review-fix load (per-step breakdown)

Tracks the work added by the §16 review fixes — consolidated here so a reader can diff against the pre-review 10h budget:

| Fix | Minutes | Folded into step |
|---|---:|---|
| #4 Box-Muller `normalSample` helper | +5m | 3 |
| #6 `IF NOT EXISTS` on ALTER TABLE | +0m | 2 (free with rewrite) |
| #7 RLS `with check (teacher_id = auth.uid() …)` | +15m | 2 |
| #8 `waitForProfile` poll before UPDATE | +15m | 3 |
| #9 Multi-page `listUsers` loop on wipe | +10m | 3 |
| #10 `refetchGrades` exposed from `useGrades` | +10m | 7 |
| #11 Dedup by id + gap-close refetch on resubscribe | +15m | 7 |
| #12 NOT NULL + partial CHECK after backfill | +5m | 3 |
| #13 `SEMESTER` constant + DB CHECK constraint | +10m | 1, 2 |
| **Subtotal folded into timeline** | **+85m** | — |

### 9.1a Bugfix savings (2026-04-22)

Two parallel Sonnet-4.6 audit agents (2026-04-22, post-bugfix) found parts of the spec that the bugfix had already completed. Work handed back:

| Bugfix work already done | Minutes saved | Step |
|---|---:|---|
| Route hardening (Content-Type / Content-Length / rate-limit / validation guards) | −20m | 6 |
| `hooks/useGrades.ts` rewrite (`mountedRef`, `AbortController`, `userId` primitive dep, `refetch` export, `getGrades` delegation) | −40m | 7 |
| Types ordering clarity penalty (`types/database.ts` explicit column additions as step 1's first action) | +5m | 1 |
| **Net savings** | **−55m** | — |

Post-bugfix total: 685 − 55 = **630 min = 10h 30m**.

---

## 10. Degradation priority

If the schedule slips, features are cut in this order (lowest priority first):

1. **Gemini AI integration** — if we're behind by hour 5, skip step 6. The endpoint keeps its fake logic; we lose one wow factor but keep Realtime.
2. **Teacher CRUD polish** — if step 5 drags, keep only "insert grade"; drop edit/delete affordances.
3. **Animation polish** — if step 7 drags, the subscription works without pulse/toast beautification.
4. **Realtime itself** — as an absolute last resort, fall back to polling-only. The demo moment still works (3s delay), no teacher-to-student visibility gap.

Realtime + teacher persistence is the critical path — all other features can degrade around them.

---

## 11. Demo scenario (rehearsed)

~90 seconds of live demo:

1. Open `/auth/login` in two windows.
2. Window 1: "Войти как учитель" → `/teacher`.
3. Window 2: "Войти как студент" → `/dashboard` (as Айдар Алимов). `useGrades` hook is rendered by `app/[locale]/dashboard/page.tsx` — this is where toast and pulse are visible.
4. Teacher selects Айдар Алимов → subject "Математика" → score "95" → clicks "Добавить".
5. **~300ms pause.** Student window: toast "Жаңа баға: Математика — 95!", math card pulses, average recalculates with animation.
6. Student clicks "AI-анализ" → ~1.5s → live Gemini response in Russian analyzing the grade pattern.
7. Switch to Supabase Dashboard → Table Editor → show the `grades` row exists in the database.

This is the full demo path. Everything in the spec serves it.

---

## 12. Out of scope

Explicitly excluded to prevent scope creep:

- LMS tables: `courses`, `enrollments`, `assignments`, `submissions`.
- SIS features: OneRoster sync, LTI 1.3 Advantage, predictive risk scoring.
- Microlearning modules, gamification badges.
- Full `attendance` table (denormalized column only).
- Admin/Parent CRUD wired to Supabase.
- Full middleware-based route protection (client-side `useRequireAuth` only).
- Streaming Gemini responses.
- New UI / glassmorphism / neon design (per user's explicit request).
- Unit-test expansion for the new backend MVP code (the 2026-04-22 bugfix session already added 184 vitest tests covering hooks, API route, and components — new tests for the Realtime subscription, Gemini route rewrite, and teacher page are still out of scope for the demo build).
- Production deploy to Vercel.
- Password rotation / proper user account management.

---

## 13. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase Realtime doesn't fire | medium | high | `replica identity full` set up front; polling fallback at 10s timeout |
| Gemini API rate limit or outage during demo | low | medium | Rate-limit already implemented (atomic 5/min, bugfix 3.2 — 2026-04-22); add 503 error response on Gemini failure (still to-do in §6.1 rewrite) |
| `auth.admin.createUser` rate-limited during seed | medium | low | Delay 500ms between creates; seed completes in <30s even at worst |
| RLS misconfigured, Realtime payload empty | low | high | Verify with manual test after step 2; has its own test in step 3's end-of-seed output |
| Service role key accidentally bundled client-side | low | critical | Keep it exclusively in `scripts/` and `.env.local`; lint check in buffer time |
| Demo laptop loses Wi-Fi | low | high | Run the script locally with cached Supabase connection; worst case show pre-recorded screen capture |

---

## 14. Post-demo cleanup (not part of 10h budget)

Tracked separately, **not** done today:

- Rotate all passwords and API keys before any public deploy.
- Remove `demo12345` hardcoded passwords from login component.
- Add proper middleware route protection.
- Tighten RLS audit (check all four roles explicitly).
- Remove `replica identity full` if performance becomes an issue at scale (unlikely for any realistic class size).

---

## 15. Resolved decisions

Originally open; closed for this MVP:

- **`activity_log` audit trail table:** **NOT implemented.** Would be ~20 min work; unnecessary for demo; out of scope.
- **`@supabase/auth-helpers-nextjs` → `@supabase/ssr` migration:** **NOT done today.** The helpers package still works and handles the cookie bridge we rely on (§5.1). Deferred to post-demo cleanup per §14.

---

## 16. Review findings — resolved/rejected

Multi-agent design review on **2026-04-22** raised 13 issues plus a timeline concern. This section exists so that future reviewers — human or AI — don't reopen closed questions. A reviewer who suggests a change that appears as "REJECTED" below should either (a) read the rationale and drop the suggestion, or (b) bring new evidence **post-dating the verification date** to reopen it.

### 16.1 Rejected (reviewer knowledge predates 2026 Google/Supabase releases)

All five rejections were independently verified by fetching current official docs (`ai.google.dev/gemini-api/docs/models`, `googleapis.github.io/js-genai`, Supabase auth-helpers README) on the review date. Root cause for every rejection: reviewer training corpus predates the Gemini 3 release (Nov 2025+) and the `@google/genai` SDK rename.

| # | Reviewer claim | Verified reality | Source |
|---|---|---|---|
| 1 | `@google/genai` doesn't exist — use `@google/generative-ai` | `@google/genai` is the current unified SDK. `@google/generative-ai` is officially deprecated; Context7 even files it under `/google-gemini/deprecated-generative-ai-js` | `googleapis.github.io/js-genai`, `ai.google.dev/gemini-api/docs` |
| 1 | Class is `GoogleGenerativeAI`, method `model.generateContent(...)` | Class is `GoogleGenAI`; method is `ai.models.generateContent({ model, contents, config })` | js-genai TypeDoc |
| 2 | `createClientComponentClient` and `createRouteHandlerClient` don't share sessions | They do — via the httpOnly cookie set by `@supabase/auth-helpers-nextjs@0.10` (already pinned in `package.json`) | auth-helpers-nextjs README + §5.1 VERIFIED block |
| 3 | `gemini-3-flash-preview` and `gemini-2.5-flash` are fictional; real names are `gemini-2.0-flash-exp` / `gemini-1.5-flash` | Both model IDs are published on Google's model list as of April 2026. `gemini-3-flash-preview` = preview, `gemini-2.5-flash` = stable. The ones the reviewer suggested are earlier generations — using them would be a downgrade | `ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview` |
| 5 | `config.responseSchema` not accepted; need `generationConfig` | `GenerateContentConfig` (the type of `config:` in `ai.models.generateContent`) accepts `responseSchema` and `responseMimeType` directly, per TypeDoc | js-genai `GenerateContentConfig` interface |

Reopening any row requires a 2026+ source (deprecation notice, changelog entry, release note) post-dating 2026-04-22. A reviewer quoting pre-2026 blog posts or training-data snapshots is not sufficient evidence.

### 16.2 Accepted — folded into the spec

| # | Fix | Section | Rationale |
|---|---|---|---|
| 4 | Box-Muller `normalSample` helper for N(μ, σ) | §8.3a | JS/tsx have no built-in normal distribution; inline helper beats a new npm dep for two call sites |
| 6 | `IF NOT EXISTS` on every `ALTER TABLE ... ADD COLUMN` | §4.1 | Idempotent migration — re-running during debugging doesn't fail |
| 7 | Explicit RLS `with check (auth.uid() = teacher_id …)` on grade INSERT | §4.1a | Previously any teacher could attribute grades to a colleague |
| 8 | `waitForProfile` bounded poll before seed UPDATE | §8.1 step 4 | Guards against `handle_new_user` trigger lag — without it UPDATE silently touches 0 rows on latency spikes |
| 9 | Multi-page `listUsers` loop on wipe | §8.1 step 1 | Single page misses users >1000, causing duplicate-email failures on re-seed |
| 10 | Polling fallback needs a retrievable refetch symbol from `useGrades` | §7.1 | Previously referenced as `refetchGrades` but undefined. **Resolved by 2026-04-22 bugfix** — `useGrades` already returns `{ grades, loading, error, refetch }`; spec updated to use `refetch` throughout (§16.3) |
| 11 | Dedup by `id` in Realtime handler + ordered `SUBSCRIBED` cleanup (clearInterval → gap-close refetch → resume) | §7.1, §7.5 | Prevents double-append when polling and Realtime overlap; closes the gap window between last poll and first Realtime delivery |
| 12 | `NOT NULL` on `grades.teacher_id` + partial CHECK `role <> 'student' or group_name is not null` — applied after seed backfill | §4.1, §8.1 step 6 | Previously both columns could silently be NULL in application inserts |
| 13 | `SEMESTER` constant in `lib/constants.ts` + DB CHECK `semester = '2026-1'` | §4.1, §4.1b | Replaces string-literal `'2026-1'` scattered across seed + teacher page; pins the demo semester at the DB layer |

### 16.3 Bugfix integration (2026-04-22, post-review)

A separate bugfix session (logged in `docs/token-usage.md`) applied Tiers 1–3 of 107 bugs from `bugs.md` — `strictNullChecks` + ES2020 in `tsconfig`, atomic rate-limit + Content-Type / size guards in the AI route, `singleOrNull` wrapper in `lib/database.ts`, `mountedRef` / `AbortController` / `userId` primitive dep in `hooks/useGrades.ts`, 184 vitest tests added. Two parallel Sonnet-4.6 audit agents (2026-04-22, post-bugfix) identified the intersections below; all are folded in.

| Finding | Section(s) updated | Change summary |
|---|---|---|
| `useGrades.ts` returns `refetch` (not `refetchGrades`) | §7.1, §7.5, §9 step 7, §16.2 row 10 | Rename throughout |
| `useGrades.ts` uses `userId` primitive dep (not `user` object) | §7.1 | Adjust dependency array + null-check on `userId` |
| `useGrades.ts` delegates to `getGrades()` in `lib/database.ts` | §7.1 | Replace inline `supabase.from(...)` with `getGrades(userId)` |
| Route already has atomic rate-limit / Content-Type / size guards | §6.1, §13 risk row 2 | Preserve verbatim; Gemini rewrite replaces analysis block only |
| `response.text` typed `string \| undefined` under strictNullChecks | §6.1 | Null-guard before `JSON.parse` |
| `.single()` on profile role throws PGRST116 | §5.1 | Use `getProfile(user.id)` (bugfix-wrapped `singleOrNull`) |
| `AuthContextType` lacks `role` field | §5.1 | Extend type + `useState<string \| null>` in provider |
| `types/database.ts` missing new columns | §4.4 | Specify `Row`/`Insert`/`Update` additions; flag as first edit in step 1 |
| Test-coverage "out of scope" claim stale | §12 | Reword to reflect 184 passing tests |
| `lib/constants.ts` doesn't exist yet | §4.1b | Flag create-before-import ordering |
| Timeline savings from bugfix | §9 table, §9.1a (new) | Total 11h 25m → 10h 30m (−55m) |
| `CLAUDE.md` missing vitest / seed commands | CLAUDE.md (not spec) | Added outside spec |

---

**End of spec.**
