# EduTok Backend MVP — Design Spec

**Date:** 2026-04-22
**Status:** Draft — pending spec review
**Timeline:** 1 day (~10 working hours)
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
-- Student/teacher profile enrichment
alter table profiles add column group_name text;       -- e.g. "IT-21"
alter table profiles add column attendance_rate int;   -- 0-100, denormalized for demo

-- Grade enrichment
alter table grades add column teacher_id uuid references profiles(id);
alter table grades add column comment text;
```

Existing RLS policies already cover these columns (they use table-level `ALL`/`SELECT`).

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

`types/database.ts` is updated to include the two new columns on `profiles` and `grades`. Client code referencing these is strictly typed; any teacher/student UI accessing `group_name` or `attendance_rate` relies on the updated types.

---

## 5. Auth strategy

### 5.1 Remove mock path

`lib/auth.ts` changes:

- Delete the dev auto-login block (currently runs when `NODE_ENV === 'development'` and writes a mock user to `localStorage`). This is the single biggest reason real Supabase auth never activates.
- Delete the `MOCK_USERS` array.
- `signIn` becomes: `return supabase.auth.signInWithPassword({ email, password })`.
- `signUp` uses the Supabase path (remove the commented-out state, un-stub it).
- `getUserRole` reads role from `profiles.role`, not `user.user_metadata.role`. The `handle_new_user` trigger writes role to `profiles` and `user_metadata.role` can be empty after login. `AuthProvider` fetches the profile once on login and caches the role in component state.

### 5.2 Login UX — quick-login buttons

On `/auth/login`, in addition to the standard email/password form, two prominent buttons:

- **"Войти как учитель"** → calls `signIn('teacher@demo.edu', 'demo12345')`.
- **"Войти как студент"** → calls `signIn('aidar.alimov@demo.edu', 'demo12345')`.

Rationale: during a live demo, typing credentials under a camera wastes 15-30 seconds per login and exposes the password. One click advances the flow.

Passwords are hardcoded in the login component but guarded behind `process.env.NODE_ENV === 'development'` (in production the buttons render as disabled stubs). All seeded users share the same password `demo12345` — acceptable for hackathon, **not acceptable for production**.

### 5.3 Route protection

- `useRequireAuth(role)` hook in `dashboard/layout.tsx` and `teacher/page.tsx`. Redirects to `/auth/login` if `user` is null or the role mismatches.
- No server-side middleware auth. `middleware.ts` remains locale-only.

Rationale: full middleware-based protection requires SSR-aware cookie plumbing and costs ~1h. In a localhost demo, the client-side guard is indistinguishable.

---

## 6. API routes

Only one route is server-side — all CRUD goes directly via the Supabase client from the browser.

### 6.1 `/api/ai/analyze` (rewrite)

**Input (unchanged):** `{ grades: [{subject: string, score: number}] }`. Validation unchanged.

**Auth (unchanged):** `createRouteHandlerClient` + `supabase.auth.getUser()` — 401 if not logged in.

**Rate limit (unchanged):** in-memory `Map`, 5 requests/minute per user.

**Logic (new):**

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

const parsed = JSON.parse(response.text)
return NextResponse.json(parsed)
```

**Response shape:** Same as existing endpoint (`average`, `level`, `weakSubjects`, `strongSubjects`, `recommendations`) plus new `summary` field. Frontend consuming this endpoint does not need changes.

**Error handling:**
- Gemini API error (network, rate limit from Google, quota) → 503 `{ error: 'AI temporarily unavailable' }`. Frontend shows a fallback message. **No silent fallback to old threshold logic** — returning fake analysis labeled as AI would be dishonest in a demo.
- JSON parse error (schema still returned malformed content) → 503 with same error message.

**Streaming:** Deferred. Non-streaming keeps the route simple; Gemini Flash latency (~1-2s) is acceptable with a loading spinner. If buffer time allows, a streaming variant via SSE or `ReadableStream` is a 30-minute add-on.

### 6.2 Package dependency

Add `@google/genai` (latest stable). Remove references to `@google/generative-ai` if any exist (deprecated).

---

## 7. Realtime strategy

### 7.1 Client subscription (student dashboard)

In `hooks/useGrades.ts`:

```typescript
useEffect(() => {
  if (!user) return
  const channel = supabase
    .channel(`grades:${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'grades',
        filter: `student_id=eq.${user.id}`,
      },
      (payload) => {
        setGrades(prev => [payload.new, ...prev])
        toast.show(`Жаңа баға: ${payload.new.subject} — ${payload.new.score}`)
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [user])
```

### 7.2 Server-side filter

The `filter: student_id=eq.<me>` pushes filtering to Postgres. Without it, every `INSERT` on `grades` broadcasts to every connected client — wasteful and exposes metadata of other students' activity even though RLS would redact the payload.

### 7.3 RLS + Realtime

Supabase Realtime's `postgres_changes` respects RLS by default: students receive `INSERT` events only for rows they can `SELECT`. The existing `"Students view own grades"` policy covers this. No additional Realtime-specific policy needed.

### 7.4 Visual feedback (without redesigning UI)

Using framer-motion (already in dependencies):

- New grade card pulses for ~6 seconds after arrival (CSS `animation: pulse`, 3 iterations).
- Toast in top-right, auto-dismiss after 4 seconds.
- Average grade number animates smoothly to new value (framer-motion `animate` on number).

### 7.5 Degradation

1. **SDK auto-retry:** Supabase client retries WebSocket with exponential backoff (5 attempts).
2. **Polling fallback:** if subscription status stays `CLOSED` for >10s, start `setInterval(refetchGrades, 3000)`. Visually ~3s delay — acceptable.
3. **Hard fallback:** a "Refresh" button on the dashboard for manual refetch.

Fallback 2 is implemented upfront (not deferred to "if time allows"), ~20 min work, insures against the one scenario where the central demo feature could fail.

---

## 8. Seed strategy

### 8.1 Script: `scripts/seed.ts`

Run with `npm run seed` (or `npx tsx scripts/seed.ts`). Uses `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS — appropriate for admin scripts).

**Behavior:**

1. **Wipe:** delete all users with email domain `@demo.edu` via `supabase.auth.admin.deleteUser`. Cascades to `profiles`, `grades`, etc. Idempotent — re-running the script is safe.
2. **Create 2 teachers:**
   - `teacher@demo.edu` / `demo12345` → "Жанар Мұратқызы"
   - `teacher2@demo.edu` / `demo12345` → "Серік Алиұлы Қасенов"
3. **Create 30 students** with Kazakh names across two groups `IT-21` (15) and `IT-22` (15). Each with `attendance_rate` drawn from a realistic distribution (N(90, 5), clamped to [70, 100]).
4. **Patch profiles** with `group_name` and `attendance_rate` (the `handle_new_user` trigger creates the profile row; `UPDATE` sets the custom fields).
5. **Generate grades:** for each student × 5 subjects (Математика, Физика, Программирование, Ағылшын тілі, История) × 3 grades = ~450 rows. Each student has an ability profile (strong/average/weak); scores are drawn from N(μ_ability, 8), clamped to [30, 100]. Dates are spread uniformly across the last 90 days. `teacher_id` is randomly assigned from the two seeded teachers.
6. **Print summary** including demo-login credentials at the end.

### 8.2 Student names (fixed list for reproducibility)

- IT-21: Айдар Алимов, Айгерим Серикбаева, Бауыржан Жумагулов, Ерлан Нұрланов, Қайрат Ормантаев, Нұрлан Искаков, Санжар Кабылбеков, Шолпан Айтуарова, Еркебулан Жаксыбаев, Рахат Сейтқасымов, Арайлым Мусина, Нұрай Сатыбалдиева, Айдана Абенова, Бақыт Тулегенов, Асхат Токтаров.
- IT-22: Арман Бекетов, Асель Касымова, Дәурен Мукашев, Жанара Хасенова, Мадина Жунусова, Салтанат Абдрахманова, Талгат Суюнбаев, Айша Тұрсынова, Медет Байжанов, Динара Омарова, Ильяс Каримов, Улан Рахымов, Камила Есенова, Жандос Алтынбеков, Балнұр Сатова.

### 8.3 Why TypeScript, not SQL

`auth.admin.createUser` is the officially supported path to create authenticated users. Direct inserts into `auth.users` are undocumented and can break on Supabase upgrades. The trade-off — TypeScript + `@supabase/supabase-js` — is worth the safety.

### 8.4 Dependencies

Add `tsx` to `devDependencies` for running TypeScript scripts directly.

---

## 9. Timeline (10h)

| # | Step | Duration | Risk | Output |
|---|---|---:|---|---|
| 1 | Install `@google/genai`, update `@supabase/supabase-js`, add `tsx`; update `types/database.ts` | 20m | low | dependencies + types |
| 2 | Apply SQL migration in Supabase SQL Editor (alter tables + enable realtime) | 20m | low | schema deployed |
| 3 | Write and run `scripts/seed.ts` | 80m | medium | 32 users + ~450 grades |
| 4 | Strip mock from `lib/auth.ts`; add quick-login buttons on `/auth/login` | 60m | medium | real auth works |
| 5 | Rewrite `teacher/page.tsx` to fetch students from DB; "Add grade" → `supabase.from('grades').insert` | 120m | high | teacher CRUD persists |
| 6 | Rewrite `/api/ai/analyze/route.ts` with `@google/genai` + `gemini-3-flash-preview` | 90m | medium | real AI analysis |
| 7 | Add Realtime subscription in `hooks/useGrades.ts`; toast + pulse animation; polling fallback | 120m | high | live grade sync |
| 8 | Replace Russian names in `admin/page.tsx` mockUsers; update `CLAUDE.md` | 20m | low | Kazakh-only project |
| 9 | Buffer: end-to-end demo rehearsal, debug, extra seed tuning | 70m | — | demo confidence |

**Total: 10h 0m.** Each step is committed separately for easy rollback.

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
3. Window 2: "Войти как студент" → `/dashboard` (as Айдар Алимов).
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
- Test coverage for new code (Playwright exists but no time to expand).
- Production deploy to Vercel.
- Password rotation / proper user account management.

---

## 13. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase Realtime doesn't fire | medium | high | `replica identity full` set up front; polling fallback at 10s timeout |
| Gemini API rate limit or outage during demo | low | medium | Rate-limit user to 5/min (prevents us triggering Google limits); show error message instead of fake response |
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

## 15. Open questions

- Should the single `grade` insert also write to an `activity_log` table to show an "audit trail" card on the teacher page? Small effort (~20min); not critical, but could be a second wow element. **Default: no, unless buffer remains.**
- The current `lib/supabase.ts` uses `@supabase/auth-helpers-nextjs`. This package is deprecated as of 2025 in favor of `@supabase/ssr`. Migration adds ~40min. **Default: keep existing package; flag as post-demo cleanup.**

---

**End of spec.**
