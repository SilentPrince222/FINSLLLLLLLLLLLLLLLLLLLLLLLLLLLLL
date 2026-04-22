# EduTok Backend MVP — Execution Plan

**Date:** 2026-04-22
**Spec:** `docs/superpowers/specs/2026-04-22-edutok-backend-mvp-design.md`
**Budget:** 10h 30m tracked (post §9.1 fixes + §9.1a bugfix savings)
**Commit discipline:** each step is its own commit — named "step N: …" — for easy rollback.

---

## Step 0 — Pre-flight (must finish before step 1)

### 0.1 Env check
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`
- [ ] `npm run build` passes (tsc clean under strictNullChecks — added in 2026-04-22 bugfix)
- [ ] `npx vitest run` passes (184 tests from bugfix)
- [ ] Supabase project `baxfcwfkhcsmsvtcwcsq` reachable in SQL Editor

### 0.2 Baseline commit
- [ ] Commit any in-flight work on `main` before starting — each step below is its own commit.

### 0.3 Package pin warning
- [ ] **Do NOT let `npm install` auto-upgrade `@supabase/auth-helpers-nextjs`.** The spec §5.1/§15 depends on the cookie bridge from the current pinned version (`0.10.0`). Migration to `@supabase/ssr` is post-demo work (§14). If `npm install @google/genai` in step 1 pulls a peer-dep upgrade, pin the helpers version explicitly.

---

## Step 1 — Dependencies, types, constants (30m, low risk)

**Why first:** nothing downstream compiles without `types/database.ts` columns + `lib/constants.ts` + `@google/genai` in package.

| File | Action |
|---|---|
| `package.json` | `npm install @google/genai` · `npm install -D tsx` · (vitest/@testing-library already present — skip) |
| `lib/constants.ts` | **create** with `export const SEMESTER = '2026-1' as const` |
| `types/database.ts` | add to `profiles` Row/Insert/Update: `group_name: string \| null`, `attendance_rate: number \| null`; add to `grades` Row/Insert/Update: `teacher_id: string \| null`, `comment: string \| null` |

**Verify:** `npx tsc --noEmit` exits clean. `grep -n '"@google/genai"' package.json` finds the dep.

**Commit:** `step 1: deps + types + SEMESTER constant`

---

## Step 2 — Supabase migration (40m, low risk)

**Run in Supabase SQL Editor** (idempotent — safe to re-run):

```sql
-- §4.1 columns
alter table profiles add column if not exists group_name text;
alter table profiles add column if not exists attendance_rate int
  check (attendance_rate between 0 and 100);
alter table grades add column if not exists teacher_id uuid references profiles(id);
alter table grades add column if not exists comment text;

-- §4.1b semester CHECK (drop-then-add pattern)
alter table grades drop constraint if exists grades_semester_fixed;
alter table grades add constraint grades_semester_fixed check (semester = '2026-1');

-- §4.1a RLS — teacher attribution
drop policy if exists "Teachers can insert grades" on grades;
create policy "Teachers insert grades they authored"
  on grades for insert
  with check (
    auth.uid() = teacher_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  );

-- §4.2 realtime publication
alter publication supabase_realtime add table grades;
alter table grades replica identity full;
```

**Verify:**
```sql
select * from pg_publication_tables where pubname='supabase_realtime';
-- expect row: public.grades
```

**Commit:** update `SUPABASE_SCHEMA.md` with the diff above — `step 2: apply supabase migration`

---

## Step 3 — Seed script (115m, MEDIUM risk)

**Prereq:** `scripts/` directory does **not** exist — create it first: `mkdir -p scripts`.

**File:** `scripts/seed.ts` (**create**)
**Also:** add `"seed": "tsx scripts/seed.ts"` to `package.json` scripts.

**Script structure (order matters):**
1. **Paginated wipe** — loop `auth.admin.listUsers({ page, perPage: 1000 })` until page returns <1000, filter `@demo.edu`, delete each. (Never assume first page is enough.)
2. **Box-Muller helpers** — `normalSample(mu, sigma)` and `clamp(v, lo, hi)` inline (no npm dep — §8.3a).
3. **Create 2 teachers** — use `supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: 'teacher', full_name } })`. `teacher@demo.edu` (Жанар Мұратқызы), `teacher2@demo.edu` (Серік Алиұлы Қасенов), password `demo12345`.
4. **Create 30 students** — 15 in `IT-21`, 15 in `IT-22`, exact names from spec §8.2, `@demo.edu` emails.
5. **`waitForProfile(id, 2000ms)` before every UPDATE** — bounded poll with `maybeSingle`. Race against `handle_new_user` trigger.
6. **UPDATE profiles** with `role`, `group_name`, `attendance_rate = clamp(normalSample(90, 5), 70, 100)`.
7. **Generate grades** — per student × 5 subjects (Математика, Физика, Программирование, Ағылшын тілі, История) × 3 grades = ~450 rows. Score: `clamp(normalSample(mu_ability, 8), 30, 100)`. Dates spread across last 90 days. `teacher_id` random from 2 teachers. `semester: SEMESTER`.
8. **Post-backfill DDL** (all rows now have values):
   ```sql
   alter table grades alter column teacher_id set not null;
   alter table profiles drop constraint if exists group_name_required_for_students;
   alter table profiles add constraint group_name_required_for_students
     check (role <> 'student' or group_name is not null);
   ```
9. **Print credentials summary** for demo (teacher + 2 sample students).

**Verify:**
- `npm run seed` completes clean.
- `select count(*) from profiles;` → 32.
- `select count(*) from grades where semester='2026-1';` → ~450.
- Re-run the script — no errors (idempotency).

**Commit:** `step 3: seed script (32 users, 450 grades)`

---

## Step 4 — Auth: remove mock, wire real Supabase (60m, medium risk)

**Files:** `lib/auth.ts`, `app/[locale]/auth/login/page.tsx`

**`lib/auth.ts` — surgical, NOT "delete and replace":**

> **⚠️ Preserve these exports verbatim** (the file has them at lines 195–221; `AuthProvider.value` wires them at lines 140–144): `signOut()`, `checkRole(user, role)`, `getUserRole(user)`, `getDashboardUrl(role)`. Consumers elsewhere in the app rely on them — deleting them breaks sign-out and post-login redirect silently (no tsc error because exports simply disappear). The changes below are narrow edits, not a rewrite.

- [ ] Delete dev auto-login block only (lines 83–102: the `NODE_ENV === 'development'` branch + `mock_signed_out` / `mock_user` localStorage reads inside the `useEffect`).
- [ ] Delete the upfront `mockUserData` read at the top of the effect (lines 71–81).
- [ ] Delete `MOCK_USERS` constant (lines 9–28).
- [ ] Delete the mock check inside `signIn` (lines 162–167: the `MOCK_USERS.find(...)` block). Keep the trailing `return supabase.auth.signInWithPassword(...)`.
- [ ] Un-stub `signUp` — replace the mock-user block (lines 174–184) with the commented Supabase path (lines 186–192), uncommented.
- [ ] In `signOut`: drop the `localStorage.removeItem('mock_user')` / `setItem('mock_signed_out','1')` pair (lines 199–200). Keep the `supabase.auth.signOut()` return.
- [ ] Extend `AuthContextType` — add `role: string | null`.
- [ ] In `AuthProvider`: `const [role, setRole] = useState<string | null>(null)`.
- [ ] In the existing `onAuthStateChange` handler (line 122) and initial `getUser()` (line 105): after `setUser(session?.user)`, if user is non-null call `const { data } = await getProfile(user.id); setRole(data?.role ?? null)`. **Use `getProfile()` from `lib/database.ts`** — it wraps `singleOrNull` (bugfix 2026-04-22) and won't throw PGRST116 on the signup/trigger gap.
- [ ] Expose `role` in context provider `value` (line 135).
- [ ] Keep `checkRole`, `getUserRole`, `getDashboardUrl` exports as-is; they still work (they read `user.user_metadata`, not `role`). Consumers can stay on them or migrate to `useAuth().role` at their own pace — do not force-migrate now.

**`app/[locale]/auth/login/page.tsx` — replace demo buttons:**
- [ ] Remove the admin demo button entirely.
- [ ] `@demo.com` → `@demo.edu` in `demoCredentials`.
- [ ] `demo123` → `demo12345`.
- [ ] Final state: two buttons — **Войти как учитель** (`teacher@demo.edu`) and **Войти как студент** (`aidar.alimov@demo.edu`).

**Verify (step 4's verify gate requires steps 2 AND 3 already complete** — otherwise `getProfile(user.id)` returns no row or no `role` column):
- Click teacher button → lands on `/teacher` with `useAuth().role === 'teacher'`.
- Click student button → lands on `/dashboard`, grades load.
- Sign-out button in nav still works (`signOut` export preserved).
- `npx tsc --noEmit` clean.

**Commit:** `step 4: real supabase auth + quick-login`

---

## Step 5 — Teacher page (120m, HIGH risk)

**File:** `app/[locale]/teacher/page.tsx`

**Replace:**
- [ ] Hardcoded `useState` student array → `useEffect` fetching `supabase.from('profiles').select('*').eq('role', 'student')`.
- [ ] Any Russian mock names (student list, placeholders, toasts) → Kazakh.
- [ ] "Add grade" form — subject dropdown (5 fixed subjects), score 0–100, optional comment.
- [ ] Submit handler uses the bugfix's `createGrade()` wrapper (`lib/database.ts:46`), not raw `.insert()` — it wraps `singleOrNull` for consistent error shape:
  ```typescript
  import { SEMESTER } from '@/lib/constants'
  import { createGrade } from '@/lib/database'

  const { data, error } = await createGrade({
    student_id: selected.id,
    subject, score, comment,
    semester: SEMESTER,
    teacher_id: user.id,  // RLS rejects if this lies
  })
  if (error || !data) {
    toast.error('Не удалось сохранить оценку')
    return
  }
  toast.success('Оценка сохранена')
  // clear form
  ```
- [ ] Explicitly check `data == null` — `createGrade` can return `{ data: null, error: null }` on PGRST116 per the bugfix wrapper.

**Verify:**
- Logged in as `teacher@demo.edu`, insert grade for Айдар Алимов → row visible in Supabase Table Editor.
- Try to insert with `teacher_id` set to another teacher's uuid (manually in devtools) → RLS rejects with 403.

**Commit:** `step 5: teacher page writes real grades`

---

## Step 6 — Gemini AI route (70m, medium risk) — **SKIP IF OPTION B**

**File:** `app/[locale]/api/ai/analyze/route.ts`

**⚠️ Preserve verbatim** (from 2026-04-22 bugfix, lines 9–25 + lines 27–37 `withTimeout` helper + surrounding blocks):
- `checkRateLimit` / `rateLimit` Map / `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` constants
- `withTimeout<T>(promise, ms)` helper (line 29) and `SUPABASE_TIMEOUT_MS` (line 28)
- Content-Type 415 guard
- Content-Length 413 guard
- Empty-array 400 guard
- `GradeInput` typed interface
- `createRouteHandlerClient` + `supabase.auth.getUser()` → 401

**⚠️ Dead `withTimeout(Promise.resolve(), …)` placeholder (lines 94–99)** — delete it; it wraps nothing. The real Gemini call below **reuses** the same `withTimeout` helper.

**Replace the analysis block + dead timeout placeholder (lines 94–136)** with:

```typescript
import { GoogleGenAI } from '@google/genai'

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview'
const FALLBACK_MODEL = 'gemini-2.5-flash'
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const prompt = `Ты образовательный аналитик казахстанского колледжа.
Студент получил следующие оценки (шкала 0-100):
${typedGrades.map(g => `${g.subject}: ${g.score}`).join('\n')}

Проанализируй успеваемость. Отвечай ТОЛЬКО валидным JSON в указанной схеме.`

const schema = {
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
}

const callGemini = (model: string) =>
  ai.models.generateContent({
    model, contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: schema },
  })

let response
try {
  response = await withTimeout(callGemini(MODEL), SUPABASE_TIMEOUT_MS)
} catch (err: any) {
  if (err?.status === 404 || /NOT_FOUND/i.test(err?.message ?? '')) {
    try {
      response = await withTimeout(callGemini(FALLBACK_MODEL), SUPABASE_TIMEOUT_MS)
    } catch {
      return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
    }
  } else if (err?.message === 'timeout') {
    return NextResponse.json({ error: 'Gateway timeout' }, { status: 504 })
  } else {
    return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
  }
}

const rawText = response.text  // string | undefined under strictNullChecks
if (!rawText) {
  return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
}
return NextResponse.json(JSON.parse(rawText))
```

**⚠️ Do NOT** modernize `@google/genai` to `@google/generative-ai` (deprecated) or change class/method shape — see spec §5.1, §6.1, §6.2 **VERIFIED 2026-04-22** blocks. `gemini-3-flash-preview` and `gemini-2.5-flash` are real published IDs.

**No silent fallback to the old threshold logic** on failure. Returning fake analysis labeled "AI" in a demo = dishonest.

**Verify:**
- POST `/api/ai/analyze` with valid grades → real Gemini response with `summary` field.
- 6th request in a minute → 429 (rate-limit preserved).
- `GEMINI_API_KEY` unset → 503 gracefully.

**Commit:** `step 6: gemini-powered ai analysis`

---

## Step 7 — Realtime + UX polish (135m, HIGH risk)

**Files:**
- `hooks/useGrades.ts` — add subscription effect
- `app/[locale]/layout.tsx` — add `<Toaster />`
- `components/dashboard/GradesSection.tsx` — pulse animation on new card, framer-motion on average
- `app/globals.css` (or equivalent) — `@keyframes pulse` definition if not already present

### 7.1 Sonner toaster
- [ ] `npm install sonner`
- [ ] Add `<Toaster position="top-right" richColors />` inside `app/[locale]/layout.tsx`.

### 7.2 Subscription (add to existing `hooks/useGrades.ts`)
**Do NOT replace** the existing `loadGrades`/`mountedRef`/`AbortController`/`userId` dep/`refetch` export (from bugfix 7.x). **Append** the subscription effect.

```typescript
const userId = user?.id ?? null  // primitive dep — bugfix 7.5 convention

useEffect(() => {
  if (!userId) return
  const channel = supabase
    .channel(`grades:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'grades',
      filter: `student_id=eq.${userId}`,
    }, (payload) => {
      if (!mountedRef.current) return
      const newGrade = payload.new as Grade
      setGrades(prev => prev.some(g => g.id === newGrade.id) ? prev : [newGrade, ...prev])
      toast.success(`Жаңа баға: ${newGrade.subject} — ${newGrade.score}`)
    })
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [userId])
```

### 7.3 Polling fallback (§7.5)
Use the `status` callback from `.subscribe()` — **not** a `channel.state` property. The callback fires with `'SUBSCRIBED'` | `'CLOSED'` | `'CHANNEL_ERROR'` | `'TIMED_OUT'` transitions.

```typescript
let pollInterval: ReturnType<typeof setInterval> | null = null
let closedSince: number | null = null

const channel = supabase.channel(`grades:${userId}`)
  .on('postgres_changes', { /* as in 7.2 */ }, handler)
  .subscribe((status) => {
    if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      closedSince ??= Date.now()
      if (!pollInterval && Date.now() - closedSince > 10_000) {
        pollInterval = setInterval(() => { refetch() }, 3000)
      }
    } else if (status === 'SUBSCRIBED') {
      // ORDER matters: clearInterval → gap-close refetch → resume Realtime
      if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
      closedSince = null
      refetch()  // close the gap between last poll tick and first Realtime delivery
    }
  })

return () => {
  if (pollInterval) clearInterval(pollInterval)
  supabase.removeChannel(channel)
}
```
- [ ] Dedup-by-id guard from §7.2 prevents double-append between gap-close refetch and incoming Realtime INSERTs.

### 7.4 Dashboard UX (in `components/dashboard/GradesSection.tsx`)
- [ ] "Refresh" button → calls existing `refetch` export from `useGrades()` directly.
- [ ] CSS `@keyframes pulse` (in `app/globals.css` if not already present) — 3 iterations, ~6s total. Track "just arrived" via a transient Set<number> of grade ids; clear after 6s.
- [ ] framer-motion `animate` on the average-grade number (tween from old → new value). Use `<motion.span animate={{ opacity: 1 }} transition={{ duration: 0.4 }} key={avg}>` for re-mount trick, or `useSpring` for smooth number morph.

**Verify (two browser windows):**
- [ ] Window 1 (teacher) inserts grade → Window 2 (student) sees toast + pulse within ~300ms, average animates.
- [ ] Kill WebSocket (devtools Network → offline) → polling kicks in after ~10s; grades still arrive with ~3s lag.
- [ ] Restore network → `SUBSCRIBED` fires → interval clears, one `refetch()` call, no duplicated cards.

**Commit:** `step 7: realtime grade sync with toast and pulse`

---

## Step 8 — Kazakh localization cleanup (20m, low risk)

> **Degradation-path dependency:** if step 5 is scope-cut (teacher polish dropped), step 8 still has to sweep `app/[locale]/teacher/page.tsx` for Russian names. Do NOT skip step 8 when skipping step 5.

| File | Action |
|---|---|
| `app/[locale]/admin/page.tsx` | Replace Russian mockUsers (Иван Иванов, Мария Петрова, etc.) with Kazakh names. Group codes: `IT-21`/`IT-22`. |
| `app/[locale]/teacher/page.tsx` | Step 5 should have done it — verify with grep even if step 5 was partially cut. |
| `lib/auth.ts` | Confirm no Russian names left in any comments/fixtures (the `Иван Иванов` at line 13 and `Мария Петрова` at line 19 disappear with `MOCK_USERS` deletion in step 4). |
| `CLAUDE.md` | Already has Kazakh context + seed command after §16.3 — verify no gaps. |

**Verify:** `grep -rn "Иванов\|Петрова\|Сидоров" app/ lib/ --include="*.ts*"` returns nothing.

**Commit:** `step 8: kazakh localization cleanup`

---

## Step 9 — Demo rehearsal + buffer (40m)

**Rehearsal checklist (target ≤90s live):**
- [ ] Two browser windows at `/auth/login`
- [ ] W1: "Войти как учитель" → `/teacher`
- [ ] W2: "Войти как студент" (Айдар Алимов) → `/dashboard`
- [ ] W1: select Айдар, subject Математика, score 95, click Добавить
- [ ] W2: toast "Жаңа баға: Математика — 95!", math card pulses, average animates — all within ~300ms
- [ ] W2: click "AI-анализ" → ~1.5s spinner → real Gemini response in Russian
- [ ] Supabase Dashboard → Table Editor → show the row exists in `grades`
- [ ] Total ≤ 90s

**Buffer use (in priority order):**
1. Fix any flaky Realtime reconnect observed.
2. Re-tune seed attendance/ability distributions if dashboard looks flat.
3. Polish pulse timing / toast copy.
4. Add any missed error-state copy.

**Commit (if any changes):** `step 9: demo rehearsal tweaks`

---

## Degradation path (if slipping)

Cut in this order (per §10):

1. **Hour 5+, Gemini not done:** skip step 6, endpoint keeps fake logic. Lose one wow factor, keep Realtime + persistence.
2. **Step 5 drags:** keep "insert grade" only; drop edit/delete affordances.
3. **Step 7 drags:** skip pulse/toast polish; raw subscription still fires.
4. **Last resort:** Realtime fails → polling-only (3s delay). Demo moment still works.

**Critical path:** Realtime + teacher persistence. **Never** cut those.

---

## Per-step files touched (lookup table)

| Step | Files |
|---|---|
| 1 | `package.json`, `lib/constants.ts` ⭐new, `types/database.ts` |
| 2 | Supabase SQL Editor; `SUPABASE_SCHEMA.md` |
| 3 | `scripts/seed.ts` ⭐new, `package.json` |
| 4 | `lib/auth.ts`, `app/[locale]/auth/login/page.tsx` |
| 5 | `app/[locale]/teacher/page.tsx` |
| 6 | `app/[locale]/api/ai/analyze/route.ts` |
| 7 | `hooks/useGrades.ts`, `app/[locale]/layout.tsx`, `components/dashboard/GradesSection.tsx`, `app/globals.css` |
| 8 | `app/[locale]/admin/page.tsx`, any stragglers |
| 9 | (rehearsal only; edits if buffer issues found) |

---

## Running totals

| Category | Minutes |
|---|---:|
| Steps 1–9 | 630 |
| **Total** | **10h 30m** |

---

## Audit findings applied (2026-04-22)

A Sonnet-4.6 `Explore` audit of the first draft of this plan surfaced 3 critical + 5 important + 3 nit issues. All CRITICAL + IMPORTANT fixed inline above:

| Tag | Finding | Fix location |
|---|---|---|
| C1 | Step 4 "delete and replace" would orphan `signOut`/`checkRole`/`getUserRole`/`getDashboardUrl` | Step 4 rewritten as surgical edits + preservation directive |
| C2 | `withTimeout` placeholder at route.ts:94–99 left unused after Gemini rewrite | Step 6 snippet now reuses `withTimeout` helper around both primary and fallback Gemini calls; placeholder deleted |
| C3 | `scripts/` directory doesn't exist | Step 3 prereq: `mkdir -p scripts` |
| I1 | Step 7 file list vague | Named `components/dashboard/GradesSection.tsx` + `app/globals.css` |
| I2 | Step 5 used raw `.insert()` instead of `createGrade()` wrapper | Step 5 submit handler rewritten with `createGrade()` + null-check |
| I3 | Step 4 verify gate implicitly required steps 2+3 | Verify prefix now flags the dependency |
| I4 | Step 7.3 polling used nonexistent `channel.state` property | Rewritten to use `.subscribe(status => ...)` callback |
| I5 | `@supabase/auth-helpers-nextjs` version pin warning missing | Added Step 0.4 package pin warning |
| N1 | Step 8 localization dependency on step 5 implicit | Degradation note added at top of step 8 |
| N2 | Step 6 `/* see §6.1 */` placeholder | `schema` constant now inlined in full |
| N3 | Step 3 `auth.admin.createUser` signature missing | Substep 3 shows full call shape |

---

**End of plan.**
