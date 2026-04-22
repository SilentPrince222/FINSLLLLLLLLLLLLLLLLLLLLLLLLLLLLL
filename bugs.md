# bugs.md

## 70 open bugs (cleaned 2026-04-22: removed false positives + fixed)

---

## Summary by Zone

| # | Zone | Bugs | Critical |
|---|------|------|----------|
| 1 | Dark mode & theme | 10 | 5 |
| 2 | Form validation | 13 | 10 |
| 3 | TypeScript type safety | 13 | 6 |
| 4 | Accessibility | 12 | 4 |
| 5 | Charts & data viz | 6 | 3 |
| 6 | Memory leaks & perf | 9 | 3 |
| 7 | Security | 8 | 4 |
| 8 | Auth & mock mode | 7 | 3 |
| 9 | Database & Supabase | 7 | 4 |
| 10 | Mock vs real mode | 6 | 2 |
| 11 | i18n & routing | 6 | 2 |
| 12 | Component state | 5 | 0 |
| 13 | Race conditions | 4 | 2 |
| 14 | Dashboard & role routing | 4 | 4 |
| 15 | API routes | 2 | 0 |

---

## CRITICAL (fix immediately)

### C1. API keys may be committed to git

**Zone:** Security | **Confidence:** 100

`.env.local` contains real Supabase service role key (bypasses ALL RLS) and Gemini API key. `.gitignore` has `.env.local`, but if it was ever committed, keys are exposed.

**Files:** `.env.local`

**Impact:** Anyone with repo access can read all student data, bypass RLS, make unlimited API calls.

**Fix:**
1. Revoke all exposed keys in Supabase dashboard and Google Cloud Console
2. Remove `.env.local` from git history: `git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.local" --prune-empty --tag-name-filter cat -- --all`
3. Regenerate all API keys

---

### C2. No server-side route protection — all role checks are client-only

**Zone:** Dashboard & role routing | **Confidence:** 90

All dashboard pages (`/dashboard`, `/teacher`, `/parent`, `/admin`) check roles only in client-side `useEffect`. No middleware auth, no server component checks.

**Files:** All pages under `app/[locale]/{dashboard,teacher,parent,admin}/`

**Impact:** Users can navigate directly to any dashboard URL. Page loads and renders JS before redirect fires. Protected content briefly visible. Can be bypassed by disabling JavaScript.

**Fix:** Add middleware-based route protection or server component auth checks in `layout.tsx` for each dashboard route.

---

### C5. Dark mode broken on 95% of components

**Zone:** Dark mode | **Confidence:** 100

Theme infrastructure is set up correctly (ThemeProvider, CSS variables, Tailwind config), but almost all components use hardcoded light-mode colors:

- `Layout.tsx` — 7 instances of `bg-white`, `bg-slate-50`, `text-slate-900`
- `Modal.tsx` — `bg-white`, `border-slate-200`, `bg-slate-50`
- All dashboard pages — 30+ instances of `bg-white`
- `globals.css:31` — body has `@apply bg-slate-50 text-slate-900`
- `globals.css:63` — `p` has hardcoded `color: #334155`
- Charts — hardcoded `#3b82f6`, `#e5e7eb`
- Button — `hover:bg-slate-50`, `disabled:text-slate-400`

**Impact:** When dark mode is activated, content area stays white while some elements switch — broken, unusable UI.

**Fix:** Global replacement needed:
- `bg-white` → `bg-card` or `bg-background`
- `text-slate-900` → `text-foreground`
- `border-slate-200` → `border-border`
- `bg-slate-50` → `bg-background`
- Add `dark:` variants where needed

---

### C7. Dual role resolution — metadata vs profiles table

**Zone:** Auth & mock mode / Mock vs real | **Confidence:** 100

The codebase has two competing sources of truth for user roles:

1. `resolveRole()` in `lib/auth.ts:26-33` — fetches from `profiles` table, stored in `AuthContext.role`
2. `getUserRole()` / `checkRole()` in `lib/auth.ts:114,117-118` — reads from `user.user_metadata.role`

Different pages use different sources:
- Teacher page → `useAuth().role` (from profiles table)
- Admin page → `role` from `useAuth()` (from profiles table)
- Parent page → `role` from `useAuth()` (fixed)
- Student dashboard → `role` from `useAuth()` (fixed)

**Impact:** After signup, `user_metadata.role` is set immediately, but `profiles` row is created async by trigger. During this gap, role sources can diverge.

**Fix:** Standardize on ONE source. Either use `user_metadata.role` everywhere, or use `profiles.role` everywhere (requires waiting for `resolveRole()`).

---

### C8. Login ignores user role — sends everyone to `/`

**Zone:** Auth & mock mode | **Confidence:** 95

**File:** `app/[locale]/auth/login/page.tsx:93`

After successful login: `router.push('/')`. Homepage then redirects via `getDashboardUrl()`, but this creates a double redirect and a flash of the loading spinner.

**Fix:**
```tsx
await refreshUser()
router.replace(getDashboardUrl() as never)
```

---

### C9. Race condition: `refreshUser()` + `router.push()` via setTimeout(400ms)

**Zone:** Auth & mock mode / Race conditions | **Confidence:** 90

**File:** `app/[locale]/auth/login/page.tsx:88-94`

```tsx
setTimeout(() => {
  if (!mountedRef.current) return
  refreshUser()
  router.push('/')
}, 400)
```

`refreshUser()` is async but not awaited. `router.push('/')` fires immediately after calling `refreshUser()`, before user state is updated. The 400ms delay is arbitrary — no guarantee `refreshUser()` completes in time.

**Impact:** Dashboard may see `user: null` and redirect back to login, creating redirect loops on slow networks.

**Fix:** Await `refreshUser()` before navigating.

---

## HIGH (fix this week)

### H4. Missing error handling in timetable page

**Zone:** Database | **Confidence:** 95

**File:** `app/[locale]/dashboard/timetable/page.tsx:27-29,64-67`

```tsx
const { data } = await getTimetable(user.id)
if (data) setEntries(data)  // error silently ignored

await deleteTimetableEntry(id)
setEntries(entries.filter(e => e.id !== id))  // updates UI even if DB delete fails
```

**Impact:** Silent data loss. Optimistic UI updates without rollback on failure.

**Fix:** Check `error`, rollback state on failure, show error toast.

---

### H5. Missing error handling in grades page

**Zone:** Database | **Confidence:** 95

**File:** `app/[locale]/dashboard/grades/page.tsx:103-114`

`createGrade()` called without `.catch()`. Unhandled promise rejections and silent data loss.

**Fix:** Add error handling with `.then(({ data, error }) => { ... })` and `.catch()`.

---

### H6. Schema type mismatch: `teacher_id` nullability

**Zone:** Database | **Confidence:** 90

**Files:**
- `types/database.ts:45,55,65` — `teacher_id: string | null`
- `SUPABASE_SCHEMA.md:194,258` — `NOT NULL` after seed

TypeScript allows `null`, database rejects it at runtime.

**Fix:** Update `types/database.ts` to `teacher_id: string` after post-seed DDL.

---

### H9. Memory leak: setTimeout in useGrades hook

**Zone:** Memory leaks | **Confidence:** 100

**File:** `hooks/useGrades.ts:94-102`

Pulse duration timeout (6s) not tracked or cleaned up on unmount.

**Fix:** Track timeout IDs in a `Set<ReturnType<typeof setTimeout>>`, clear all on unmount.

---

### H10. Memory leak: fake upload setTimeout in materials page

**Zone:** Memory leaks | **Confidence:** 100

**File:** `app/[locale]/dashboard/materials/page.tsx:52-58`

Multiple `setTimeout` calls from drag/upload events without cleanup.

**Fix:** Track timeout ID in ref, clear on unmount and before creating new timeout.

---

### H11. SignOut navigation race condition

**Zone:** Race conditions | **Confidence:** 95

**Files:**
- `app/[locale]/teacher/page.tsx:99`
- `app/[locale]/dashboard/page.tsx:74`

`signOut().then(() => router.push(...))` — but `onAuthStateChange` fires synchronously, causing route guards to redirect before `.then()` executes. Double navigation.

**Fix:** Navigate immediately, fire `signOut()` without waiting.

---

### H14. No email/password trimming on auth forms

**Zone:** Form validation | **Confidence:** 95

**Files:**
- `components/AuthForm.tsx:45,57`
- `components/RegisterForm.tsx:78,90`
- `app/[locale]/auth/login/page.tsx:84,99`
- `app/[locale]/auth/signup/page.tsx:99,135,150`

Email fields use `e.target.value` directly without `.trim()`. Trailing spaces cause auth failures.

**Fix:** `setEmail(e.target.value.trim())` for email fields. Trim password on submit only.

---

### H15. No password strength validation

**Zone:** Form validation | **Confidence:** 85

**Files:**
- `components/RegisterForm.tsx:86-95`
- `app/[locale]/auth/signup/page.tsx:127-155`

Only checks minimum length (6 chars). Allows "123456", "aaaaaa".

**Fix:** Require uppercase + lowercase + number, minimum 8 chars.

---

### H16. No server-side validation in database inserts

**Zone:** Form validation / Database | **Confidence:** 95

**File:** `lib/database.ts` — all insert functions

`createGrade`, `createTimetableEntry`, `createEvent` pass client data directly to Supabase without validation. Malicious client can send negative scores, empty subjects, oversized strings.

**Fix:** Add validation in each insert function before calling Supabase.

---

### H17. Missing security headers

**Zone:** Security | **Confidence:** 95

**File:** `next.config.mjs`

No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`.

**Fix:** Add `headers()` config to `next.config.mjs`.

---

### H18. `session: any` in onAuthStateChange callback

**Zone:** TypeScript type safety | **Confidence:** 95

**File:** `lib/auth.ts:53`

`session: any` bypasses type checking for Supabase Session type.

**Fix:** Import and use `Session` type from `@supabase/supabase-js`.

---

### H19. `as any` on database response in resolveRole

**Zone:** TypeScript type safety | **Confidence:** 90

**File:** `lib/auth.ts:29`

`(data as any)?.role` — casts database response to `any` instead of using proper Profile type.

**Fix:** Type `getProfile()` return properly, then just `data?.role`.

---

### H20. Role resolution race condition during mount

**Zone:** Auth & mock mode | **Confidence:** 85

**File:** `lib/auth.ts:48-64`

In `AuthProvider`, `setUser(current)` fires at line 56, but `setRole(r)` only after async `resolveRole()` at line 59. Between these, components see `user` set but `role === null`.

**Impact:** Teacher page's guard `if (role && role !== 'teacher')` won't redirect because role is temporarily null.

**Fix:** Set user and role atomically — don't set user until role is resolved.

---

## MEDIUM (fix next sprint)

### M1. Hardcoded navigation paths without locale prefix

**Zone:** i18n | **Confidence:** 100

Remaining instances of `router.push('/dashboard')`, `router.push('/auth/login')` without `/${locale}` prefix in files not yet migrated to `@/i18n/routing`.

**Files:** AuthForm, GradesSection, TimetableSection, RegisterForm, Layout, teacher page, admin page, login page.

---

### M2. Hardcoded Russian/English strings bypass i18n

**Zone:** i18n | **Confidence:** 95

50+ hardcoded strings in AuthForm ("Вход", "Пароль"), RegisterForm ("Регистрация"), Layout ("Home"), dashboard pages, login page.

**Fix:** All UI strings should use `useTranslations()`.

---

### M4. Index-based keys in calendar and quick links

**Zone:** Component state | **Confidence:** 90

**Files:**
- `components/ui/GradesCalendar.tsx:126` — `key={index}`
- `components/dashboard/StudentQuickLinksSection.tsx:50` — `key={i}`
- `components/dashboard/QuickLinksSection.tsx:25` — `key={i}`

**Fix:** Use stable unique keys.

---

### M5. Inline array/function creation on every render

**Zone:** Memory leaks & perf | **Confidence:** 85

**Files:**
- `app/[locale]/dashboard/page.tsx:86` — `.map()` in JSX creates new array ref every render
- `app/[locale]/dashboard/page.tsx:70-75` — `navItems` with inline `onClick` functions
- `app/[locale]/dashboard/analyze/page.tsx:38-58` — `getGPAData()` called on every render

**Fix:** Use `useMemo` / `useCallback`.

---

### M6. Array mutation in analyze page

**Zone:** Memory leaks & perf | **Confidence:** 85

**File:** `app/[locale]/dashboard/analyze/page.tsx:39`

`grades.sort()` mutates the original array. Use `[...grades].sort()`.

---

### M7. Missing React.memo on chart and dashboard section components

**Zone:** Memory leaks & perf | **Confidence:** 85

**Files:** All `components/charts/*.tsx`, all `components/dashboard/*Section.tsx`

Charts are expensive to render but re-render on every parent state change.

---

### M8. AbortController dead code in hooks

**Zone:** Race conditions | **Confidence:** 85

**Files:**
- `hooks/useTimetable.ts:37-59`
- `hooks/useEvents.ts:34-60`

`AbortController` created but never wired to actual fetch. `abortController.signal.aborted` check is useless after request completes.

---

### M9. RegisterForm setTimeout leak

**Zone:** Race conditions | **Confidence:** 82

**File:** `components/RegisterForm.tsx:27-30`

`setTimeout(() => router.push('/dashboard'), 1500)` — no cleanup if component unmounts.

---

### M10. Grade creation rollback uses stale closure

**Zone:** Race conditions | **Confidence:** 80

**File:** `app/[locale]/dashboard/grades/page.tsx:57-81`

`previousGrades` captured at render time, becomes stale on double-submit.

---

### M11. No email format validation in registration

**Zone:** Form validation | **Confidence:** 90

**Files:** `components/RegisterForm.tsx:75-82`, `app/[locale]/auth/signup/page.tsx:95-103`

Relies only on HTML5 `type="email"` which accepts "user@localhost".

---

### M12. No double-submit protection on modal forms

**Zone:** Form validation | **Confidence:** 90

**Files:** `components/AddStudentModal.tsx:30-37`, `components/ui/CreateEventModal.tsx:20-27`

Users can double-click submit, creating duplicate entries.

---

### M13. Missing maxLength on text inputs

**Zone:** Form validation | **Confidence:** 85

**Files:** CreateEventModal, AddStudentModal, profile page, timetable page

Database has column limits, forms don't enforce them.

---

### M14. Timetable form: no time range validation

**Zone:** Form validation | **Confidence:** 90

**File:** `app/[locale]/dashboard/timetable/page.tsx:38-62`

End time before start time accepted.

---

### M15. Missing aria-labels on icon-only buttons

**Zone:** Accessibility | **Confidence:** 90-95

**Files:**
- `components/Layout.tsx:72-75` — mobile menu toggle
- `components/Modal.tsx:57-61` — close button
- `components/ui/EventCard.tsx:86-99` — like/comment buttons

---

### M16. Clickable divs without keyboard support

**Zone:** Accessibility | **Confidence:** 85

**Files:**
- `components/Notifications.tsx:71-86` — notification items
- `components/ui/GradesCalendar.tsx:125-147` — calendar day cells

`<div onClick={...}>` with `cursor-pointer` but no `role="button"`, `tabIndex`, or keyboard handler.

---

### M17. Password visibility toggle has tabIndex={-1}

**Zone:** Accessibility | **Confidence:** 85

**File:** `components/AuthForm.tsx:62-69`

Explicitly removes toggle from keyboard navigation.

**Fix:** Remove `tabIndex={-1}`, add `aria-label`.

---

### M18. Missing form label associations

**Zone:** Accessibility | **Confidence:** 80

**Files:** RegisterForm, AddStudentModal, CreateEventModal — labels without `htmlFor` matching input `id`.

---

### M19. Missing skip-to-content link

**Zone:** Accessibility | **Confidence:** 80

**File:** `app/[locale]/layout.tsx`

Keyboard users must tab through all navigation to reach main content.

---

### M20. Missing ARIA live regions for dynamic content

**Zone:** Accessibility | **Confidence:** 80

Notifications list, error messages, validation errors — no `aria-live="polite"` for screen reader announcements.

---

### M21. Dark mode contrast issues on demo buttons

**Zone:** Accessibility / Dark mode | **Confidence:** 85

**File:** `app/[locale]/auth/login/page.tsx:131,138,145`

Demo role buttons use `bg-blue-50`, `bg-green-50` with no `dark:` variants.

---

### M22. Color-only information in grade displays

**Zone:** Accessibility | **Confidence:** 85

Multiple grade displays convey pass/fail through color only, without screen reader text. `GradeCard.tsx` has `sr-only` text but other grade displays don't.

---

### M23. Non-colorblind-friendly chart palette

**Zone:** Charts / Accessibility | **Confidence:** 85

Colors `#3b82f6` (blue), `#10b981` (green), `#8b5cf6` (purple), `#ef4444` (red) — problematic for protanopia/deuteranopia.

---

### M24. Missing error boundaries around chart components

**Zone:** Charts | **Confidence:** 85

If a chart throws from malformed data, the entire page crashes instead of graceful fallback.

---

### M25. Recharts YAxis domain clips data outside 0-100

**Zone:** Charts | **Confidence:** 85

**File:** `app/[locale]/dashboard/analyze/page.tsx:131`

`<YAxis domain={[0, 100]} />` clips GPA values outside range. Use dynamic domain.

---

### M27. `as any` throughout codebase (20+ instances)

**Zone:** TypeScript type safety | **Confidence:** 80-90

Key locations:
- `lib/auth.ts:53` — `session: any`
- `lib/auth.ts:29` — `(data as any)?.role`
- `app/[locale]/api/ai/analyze/route.ts:94` — `let body: any`
- `hooks/useProfile.ts:37` — `data as Profile | null`
- `hooks/useGrades.ts:47` — `(data ?? []) as Grade[]`
- `hooks/useGrades.ts:109,116` — `'postgres_changes' as any`
- `app/[locale]/teacher/page.tsx:48` — `(data ?? []) as Profile[]`
- `components/RegisterForm.tsx:110` — `setRole(r.value as any)`

---

### M28. Local Profile interface duplicates database type

**Zone:** TypeScript type safety | **Confidence:** 85

**File:** `hooks/useProfile.ts:5-11`

Defines local `Profile` interface instead of importing from `types/database.ts`. Risk of schema drift.

---

### M29. catch blocks use `err: any`

**Zone:** TypeScript type safety | **Confidence:** 80

**Files:** AuthForm, RegisterForm, login page, signup page, analyze page — all use `catch (err: any)` then `err.message`.

**Fix:** `const message = err instanceof Error ? err.message : 'Unknown error'`

---

### M30. Service role key accessible in client code

**Zone:** Security | **Confidence:** 90

**File:** `.env.local` — `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` prefix makes it available to all client-side code.

**Fix:** Remove `NEXT_PUBLIC_` prefix. Use only in server-side scripts.

---

### M31. Over-permissive `.select('*')` queries

**Zone:** Security / Database | **Confidence:** 82

**File:** `lib/database.ts:23,32,40,78,105`

Multiple functions fetch ALL columns. Unnecessary data exposure.

**Fix:** Select only needed columns explicitly.

---

### M32. No CSRF protection

**Zone:** Security | **Confidence:** 80

No CSRF tokens on state-changing operations. Mitigated by SameSite cookies but not explicitly verified.

---

### M33. refreshUser() has no mounted check

**Zone:** Auth & mock mode | **Confidence:** 85

**File:** `lib/auth.ts:41-46`

Can set state on unmounted component. Convert `mounted` from `let` to `useRef`.

---

### M34. resolveRole() silently returns null on ALL errors

**Zone:** Auth & mock mode | **Confidence:** 85

**File:** `lib/auth.ts:26-33`

Network failures, DB errors, schema bugs — all return `null` (defaults to student). Teachers/admins lose access during connectivity issues.

---

### M35. Missing timeout on database operations

**Zone:** Database | **Confidence:** 80

**File:** `lib/database.ts` — all functions

When Supabase is unreachable, app hangs indefinitely.

---

### M36. useProfile doesn't handle missing profiles

**Zone:** Mock vs real | **Confidence:** 85

**File:** `hooks/useProfile.ts:32-40`

After signup, `profiles` row may not exist yet (trigger delay). Hook sets `profile: null` — any code accessing `profile.role` crashes.

---

### M37. Dashboard students page is purely mock

**Zone:** Mock vs real | **Confidence:** 80

**File:** `app/[locale]/dashboard/students/page.tsx:17-25`

Uses hardcoded `initialStudents`, never calls Supabase. Completely disconnected from real backend.

---

### M38. Missing CORS headers and OPTIONS handler

**Zone:** API routes | **Confidence:** 80

**File:** `app/[locale]/api/ai/analyze/route.ts`

No CORS configuration. No `OPTIONS` method handler for preflight requests.

---

### M39. Insufficient touch target sizes on mobile

**Zone:** Accessibility | **Confidence:** 80

Event card buttons, calendar arrows, notification actions — may be smaller than 44x44px minimum.

---

### M40. AddStudentModal: no error handling in handleSubmit

**Zone:** Component state | **Confidence:** 85

**File:** `components/AddStudentModal.tsx:30-36`

If `onSubmit` throws, `setLoading(false)` never called — button stuck in loading state.

---

### M41. AuthForm: race condition with router.push

**Zone:** Component state | **Confidence:** 85

**File:** `components/AuthForm.tsx:15-28`

If `signIn` throws after `router.push('/dashboard')` is called, user is navigated but error state is set.

---

## LOW (backlog)

### L1. No retry logic for failed DB operations
### L2. In-memory rate limiting resets on server restart
### L3. Profile form saves without validation (simulated save only)
### L4. Phone number format not validated
### L5. Group code format not validated
### L6. Unicode/character set not validated in name fields
### L7. console.log with potential user data in production
### L8. BarChart: no empty state handling
### L9. BarChart: single data point fills entire width
### L10. Admin dashboard uses mock data but has real auth guard (confusing UX)
### L11. Teacher page redirects missing locale prefix despite using i18n router

---

## Priority Fix Order

### Immediate (today)
1. C1 — Revoke exposed API keys

### This week
2. C2 — Add server-side role checks
3. C5 — Dark mode: globals.css + Layout + Modal
4. C7 — Standardize role source
5. C8 + C9 — Fix login redirect to use role + await refreshUser
6. H4–H6 — Add error handling in database operations
7. H20 — Fix role resolution race condition

### Next sprint
8. H9–H11 — Memory leak + race condition fixes
9. H14–H16 — Form validation improvements
10. H17 — Security headers
11. H18–H19 — TypeScript any in auth
12. M1–M2 — i18n hardcoded paths and strings
13. M15–M22 — Accessibility fixes

### Backlog
14. M5–M7 — Performance (memoization)
15. M27–M29 — TypeScript type safety cleanup
16. M30–M32 — Additional security hardening
17. L1–L11 — Low priority items
