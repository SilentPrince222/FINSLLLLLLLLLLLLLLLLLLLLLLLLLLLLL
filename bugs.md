# bugs.md

**Test-proven bugs only** — every entry below has a failing vitest test as evidence.  
Run: `npx vitest run tests/unit/red-bugs-md.test.tsx tests/unit/red-remaining-bugs.test.ts tests/unit/bugs-125-scan.test.ts`  
Last audit: 2026-04-22 — 37 failing tests → 28 distinct bugs.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 5 |
| High | 13 |
| Medium | 10 |
| **Total** | **28** |

---

## CRITICAL

### C1. `.env.local` contains a real Supabase project URL

**Test:** `red-remaining-bugs.test.ts` › CRITICAL #6  
**File:** `.env.local`  
`NEXT_PUBLIC_SUPABASE_URL` points to a real `*.supabase.co` project — confirms keys are live, not placeholders.

**Impact:** Anyone with a copy of `.env.local` has full Supabase access (service role key also present).

**Fix:** Revoke all keys in Supabase dashboard + Google Cloud, re-generate, never commit.

---

### C2. `createGrade` call has no error handling

**Test:** `red-remaining-bugs.test.ts` › CRITICAL #11  
**File:** `app/[locale]/dashboard/grades/page.tsx`  
`createGrade(...).then(...)` has no `.catch()`. On DB failure the promise rejects silently — optimistic UI state is left dirty.

**Fix:** Add `.catch(err => { rollback(); showError(err) })` on the same chain.

---

### C3. `timetable handleAddEntry` ignores DB errors

**Test:** `red-remaining-bugs.test.ts` › CRITICAL #12  
**File:** `app/[locale]/dashboard/timetable/page.tsx`  
`const { data } = await createTimetableEntry(...)` — `error` is never destructured or checked. UI appends a phantom entry even when the DB write failed.

**Fix:** `const { data, error } = await createTimetableEntry(...)` + guard on `error`.

---

### C4. `timetable handleDeleteEntry` updates UI before confirming success

**Test:** `red-remaining-bugs.test.ts` › CRITICAL #13  
**File:** `app/[locale]/dashboard/timetable/page.tsx`  
`await deleteTimetableEntry(id)` is immediately followed by `setEntries(entries.filter(...))` with no error check. A failed delete removes the row from UI but not from DB.

**Fix:** Check the return value; only call `setEntries` when `error` is null.

---

### C5. Materials upload is entirely fake

**Test:** `red-remaining-bugs.test.ts` › CRITICAL #14 (2 tests)  
**File:** `app/[locale]/dashboard/materials/page.tsx`  
`handleUpload` and `handleDrop` call `setTimeout(() => setUploading(false), 1500)` without ever reading `e.target.files` or `e.dataTransfer.files`. No file is processed or uploaded anywhere.

**Fix:** Read `files[0]`, build a `FormData`, POST to a real upload endpoint (or Supabase Storage).

---

## HIGH

### H1. QR page is entirely in hardcoded Russian — no i18n

**Test:** `red-remaining-bugs.test.ts` › HIGH #9  
**File:** `app/[locale]/dashboard/qr/page.tsx`  
All strings ("Сканирование QR", etc.) are hardcoded. `useTranslations` is never imported. Kazakh locale always shows Russian.

**Fix:** Add translation keys to `messages/{ru,kk}.json`, call `useTranslations()`.

---

### H2. `signup/page.tsx` uses `alert()` for success feedback

**Test:** `red-remaining-bugs.test.ts` › HIGH #15  
**File:** `app/[locale]/auth/signup/page.tsx`  
`alert()` blocks the main thread and is not accessible.

**Fix:** Replace with an inline success message or toast notification.

---

### H3. `signup/page.tsx` exposes raw Supabase error to users

**Test:** `red-remaining-bugs.test.ts` › HIGH #16  
**File:** `app/[locale]/auth/signup/page.tsx`  
`setError(err.message || ...)` renders internal Supabase error strings in the UI — leaks implementation details.

**Fix:** Use a generic message: `setError('Не удалось создать аккаунт.')`.

---

### H4. All demo accounts share the password `demo123`

**Test:** `red-remaining-bugs.test.ts` › HIGH #18  
**File:** `app/[locale]/auth/login/page.tsx`  
Student, teacher, admin demo buttons all use `{ password: 'demo123' }`. One leak = all accounts compromised.

**Fix:** Give each demo role a distinct password, or document risk prominently.

---

### H5. Profile page has no authentication check

**Test:** `red-remaining-bugs.test.ts` › HIGH #19  
**File:** `app/[locale]/dashboard/profile/page.tsx`  
`useAuth` is never imported. Any unauthenticated visitor can reach the profile page.

**Fix:** Import `useAuth`, redirect to login if `!user`.

---

### H6. Curator page has no authentication check

**Test:** `red-remaining-bugs.test.ts` › HIGH #20  
**File:** `app/[locale]/dashboard/curator/page.tsx`  
No auth guard — anyone can submit curator messages.

**Fix:** Same as H5.

---

### H7. Consultation page has no authentication check

**Test:** `red-remaining-bugs.test.ts` › HIGH #21  
**File:** `app/[locale]/dashboard/consultation/page.tsx`  
No auth guard.

**Fix:** Same as H5.

---

### H8. Teachers page has no authentication check

**Test:** `red-remaining-bugs.test.ts` › HIGH #22  
**File:** `app/[locale]/dashboard/teachers/page.tsx`  
No auth guard — "Add Teacher" is publicly accessible.

**Fix:** Same as H5, also verify role is `teacher` or `admin`.

---

### H9. Analyze page `catch` block writes to `result` state instead of `error` state

**Test:** `red-remaining-bugs.test.ts` › HIGH #23  
**File:** `app/[locale]/dashboard/analyze/page.tsx`  
`catch (err) { setResult({ average: 0, level: 'Error', ... }) }` — a failed analysis renders as if it succeeded, with level = 'Error' shown as an analysis result.

**Fix:** `catch (err) { setError(message); setResult(null) }`.

---

### H10. Dark mode: `Layout.tsx` uses bare `bg-white`

**Test:** `bugs-125-scan.test.ts` › C5  
**File:** `components/Layout.tsx`  
Seven or more instances of `bg-white` — all stay white when dark mode is active.

**Fix:** Replace with `bg-card` or `bg-background` (CSS variable-backed).

---

### H11. Dark mode: `globals.css` hardcodes `color: #334155` on `p` elements

**Test:** `bugs-125-scan.test.ts` › C5  
**File:** `app/globals.css`  
`p { color: #334155 }` overrides dark-mode text color unconditionally.

**Fix:** Use `color: var(--foreground)` or a Tailwind token.

---

### H12. Email fields not trimmed before use (AuthForm + RegisterForm)

**Test:** `bugs-125-scan.test.ts` › H14 (2 tests)  
**Files:** `components/AuthForm.tsx`, `components/RegisterForm.tsx`  
`setEmail(e.target.value)` — a trailing space causes auth failure against Supabase.

**Fix:** `setEmail(e.target.value.trim())`.

---

### H13. RegisterForm has no password strength validation

**Test:** `bugs-125-scan.test.ts` › H15  
**File:** `components/RegisterForm.tsx`  
Only minimum length (6) is checked. Passwords like `"aaaaaa"` or `"123456"` are accepted.

**Fix:** Require ≥8 chars, at least one uppercase, one lowercase, one digit.

---

## MEDIUM

### M1. Layout mobile sidebar stays open after navigation

**Test:** `red-remaining-bugs.test.ts` › MEDIUM #1  
**File:** `components/Layout.tsx`  
`sidebarOpen` is never reset when the route changes — the sidebar remains open after clicking a link.

**Fix:** `useEffect(() => { setSidebarOpen(false) }, [pathname])`.

---

### M2. Layout mobile menu button has no `aria-label`

**Test:** `red-remaining-bugs.test.ts` › MEDIUM #2  
**File:** `components/Layout.tsx`  
Screen readers announce the toggle as an unlabeled button.

**Fix:** `<button aria-label="Открыть меню" ...>`.

---

### M3. Analytics page date filter broken (Russian month abbrevs vs ISO dates)

**Test:** `red-bugs-md.test.tsx` › MEDIUM #8/#9  
**File:** `app/[locale]/dashboard/analytics/page.tsx`  
`g.date.startsWith(months[i].toLowerCase())` — `months = ['Янв', 'Фев', ...]` lowercased becomes `'янв'`, `'фев'`, which never matches ISO date strings like `'2026-01'`. Progress data is always empty.

**Fix:** Build a numeric month map `{ 'Янв': '01', 'Фев': '02', ... }` and match on `g.date.startsWith('2026-' + monthMap[month])`.

---

### M4. QR page has no "scan again" button after a successful scan

**Test:** `red-remaining-bugs.test.ts` › MEDIUM #10  
**File:** `app/[locale]/dashboard/qr/page.tsx`  
After `setResult(...)`, there is no way to reset and scan another code without navigating away and back.

**Fix:** Add a button that calls `setResult('')`.

---

### M5. Materials file input has no type or size validation

**Test:** `red-remaining-bugs.test.ts` › MEDIUM #11 (2 tests)  
**File:** `app/[locale]/dashboard/materials/page.tsx`  
`<input type="file" />` has no `accept=` attribute. Upload handler never checks `file.size`. Any file type and size is silently "accepted".

**Fix:** Add `accept=".pdf,.doc,.ppt,.mp4"` and validate `file.size < MAX_FILE_SIZE` before proceeding.

---

### M6. `ErrorMessage` component not wrapped in `React.memo`

**Test:** `red-remaining-bugs.test.ts` › MEDIUM #17  
**File:** `components/ErrorMessage.tsx`  
Pure presentational component re-renders on every parent update even when `message` prop is unchanged.

**Fix:** `export default React.memo(function ErrorMessage(...) { ... })`.

---

### M7. `analyze/page.tsx` mutates React state with `grades.sort()`

**Test:** `bugs-125-scan.test.ts` › M6 (2 tests)  
**File:** `app/[locale]/dashboard/analyze/page.tsx`  
`grades.sort(...)` sorts in-place — mutates the state array. React may not trigger a re-render because the reference is unchanged.

**Fix:** `[...grades].sort(...)` or `grades.slice().sort(...)`.

---

### M8. `useTimetable` creates an `AbortController` that is never wired to the fetch

**Test:** `bugs-125-scan.test.ts` › M8  
**File:** `hooks/useTimetable.ts`  
`abortController.signal` is never passed to `getTimetable()`. The `.abort()` in cleanup is dead code — the request cannot be cancelled.

**Fix:** Pass `{ signal: abortController.signal }` to `getTimetable()`, or remove the controller entirely.

---

### M9. `RegisterForm` `setTimeout` not cleaned up on unmount

**Test:** `bugs-125-scan.test.ts` › M9  
**File:** `components/RegisterForm.tsx`  
`setTimeout(() => router.push('/dashboard'), 1500)` — the timer ID is not stored. If the component unmounts before it fires, it calls `setState` on a dead component.

**Fix:** `const timerId = setTimeout(...); return () => clearTimeout(timerId)` inside a `useEffect`.

---

### M10. `AuthForm` password visibility toggle has `tabIndex={-1}`

**Test:** `bugs-125-scan.test.ts` › M17  
**File:** `components/AuthForm.tsx`  
Keyboard users cannot toggle password visibility — the button is removed from tab order.

**Fix:** Remove `tabIndex={-1}`, add `aria-label="Показать пароль"`.

---

### M11. `catch (err: any)` in `RegisterForm` and `AuthForm`

**Test:** `bugs-125-scan.test.ts` › M29 (2 tests)  
**Files:** `components/RegisterForm.tsx`, `components/AuthForm.tsx`  
`catch (err: any)` then `err.message` — unsafe. Non-`Error` throws (strings, objects) return `undefined.message`.

**Fix:** `const msg = err instanceof Error ? err.message : 'Неизвестная ошибка'`.

---

### M12. `lib/database.ts` uses `.select('*')` in `getProfile`

**Test:** `bugs-125-scan.test.ts` › M31  
**File:** `lib/database.ts`  
`getProfile` fetches all columns including internal fields that the UI never uses.

**Fix:** `.select('id, role, full_name, email, avatar_url')` (or whatever columns are actually needed).

---

### M13. `students/page.tsx` never queries Supabase — hardcoded mock data only

**Test:** `bugs-125-scan.test.ts` › M37 (2 tests)  
**File:** `app/[locale]/dashboard/students/page.tsx`  
Page uses a hardcoded `initialStudents` array. Real student data in Supabase is never fetched or displayed.

**Fix:** Import a database function (e.g. `getStudents`) and call it in a `useEffect`.

---

## Not yet proven by tests (do not fix until a red test is written)

The following categories from the previous audit have no failing test evidence and may be false positives, already fixed, or need a test before investing time:

- C2 (server-side route protection) — no test
- C7 (dual role resolution race) — no test
- H4/H5/H6 (timetable/grades silent error handling beyond what C3/C4 cover) — partially covered
- M4–M11 original numbering (index keys, memoization, perf) — mixed; some covered, some not
- M15–M22 accessibility items — only M2, M10 proven by test
- M27–M29 full TypeScript `as any` sweep — partially covered
- L1–L11 low priority items — none tested
