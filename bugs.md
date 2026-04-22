# bugs.md

## 55 bugs found by 10 parallel agents (2026-04-22)

---

## CRITICAL (15)

| # | File | Bug |
|---|------|-----|
| 1 | `app/[locale]/teacher/page.tsx` | No role check — any user can access teacher dashboard and modify grades |
| 2 | `app/[locale]/admin/page.tsx` | No role check — any user can access admin panel, delete users, create admins |
| 3 | `app/[locale]/parent/page.tsx` | No role check — any user can view other students' private grades |
| 4 | `components/charts/LineChart.tsx:10` | Division by zero when `data.length <= 1` — component crashes |
| 5 | `components/charts/DonutChart.tsx:8` | Division by zero when `data` is empty — component crashes |
| 6 | `.env.local` | Exposed secrets — real Supabase keys & Gemini API key in repo |
| 7 | `lib/auth.ts:105-121` | Race condition — `getUser()` can complete after unmount, broken error handling |
| 8 | `components/RegisterForm.tsx:28` | State not refreshed after signup — AuthProvider doesn't know about new user |
| 9 | `app/[locale]/auth/login/page.tsx:27` | Fragile setTimeout race condition between `refreshUser()` and `router.push()` |
| 10 | `app/[locale]/auth/login/page.tsx:17` | Missing role-based redirect — always goes to `/` instead of role-specific dashboard |
| 11 | `app/[locale]/dashboard/grades/page.tsx:103` | Unhandled promise rejection — `createGrade` has no `.catch()` |
| 12 | `app/[locale]/dashboard/timetable/page.tsx:38` | No error handling — failed DB ops still update local state (data inconsistency) |
| 13 | `app/[locale]/dashboard/timetable/page.tsx:64` | No error handling on delete — UI removes entry even if DB delete fails |
| 14 | `app/[locale]/dashboard/materials/page.tsx:49` | Fake upload — shows success toast but never processes files |
| 15 | `app/[locale]/api/ai/analyze/route.ts` | Missing auth check — API endpoint accessible without authentication |

---

## HIGH (23)

| # | File | Bug |
|---|------|-----|
| 1 | **15+ files** | `useRouter`/`Link` from `next/navigation` instead of `@/i18n/routing` — breaks i18n on every redirect. Files: `teacher/page.tsx`, `admin/page.tsx`, `parent/page.tsx`, `dashboard/page.tsx`, `qr/page.tsx`, `auth/login/page.tsx`, `auth/signup/page.tsx`, `curator/page.tsx`, `consultation/page.tsx`, `Layout.tsx`, `RegisterForm.tsx`, `auth.ts`, `GradesSection.tsx`, `TimetableSection.tsx`, `app/[locale]/page.tsx` |
| 2 | `components/Layout.tsx:4,25` | Wrong imports — `Link` and `usePathname` from `next/navigation`, active nav highlighting never works (compares `/ru/dashboard` against `/dashboard`) |
| 3 | `app/[locale]/layout.tsx` | Client components (`ThemeProvider`, `AuthProvider`) used without `'use client'` directive |
| 4 | `app/[locale]/dashboard/page.tsx:65` | Hardcoded `locale = 'ru'` instead of reading from `params.locale` |
| 5 | `middleware.ts:8` | Matcher pattern doesn't properly handle root `/` redirect |
| 6 | `playwright.config.ts:11,22` | `baseURL` set to port 3001, dev server runs on 3000 — all E2E tests fail |
| 7 | `components/dashboard/QuickLinksSection.tsx:25` | Buttons have `href` but use `<Button>` not `<Link>` — dead, non-functional links |
| 8 | `app/[locale]/dashboard/students/page.tsx:18` | Mock data uses Western names (John Smith) — violates Kazakhstan context guideline |
| 9 | `app/[locale]/dashboard/qr/page.tsx` | All text hardcoded in Russian — no `useTranslations()`, Kazakh locale never shown |
| 10 | `messages/kk.json:60` | Language selector says "Русский" instead of "Орысша" in Kazakh interface |
| 11 | `api/ai/analyze/route.ts:9-25` | Memory leak — `rateLimit` Map grows unbounded, stale entries never removed |
| 12 | `api/ai/analyze/route.ts:95-99` | Dead timeout code — wraps `Promise.resolve()`, provides zero actual timeout protection |
| 13 | `lib/database.ts:1-3` | Client Supabase in server — `createClientComponentClient` used in API route context; should be `createRouteHandlerClient({ cookies })` |
| 14 | `lib/auth.ts:173-184` | `signUp()` always stores to localStorage — Supabase code unreachable in production |
| 15 | `app/[locale]/auth/signup/page.tsx:50-51` | `alert()` blocks main thread, mentions email verification that doesn't exist in mock |
| 16 | `app/[locale]/auth/signup/page.tsx:52-53` | Exposes raw error messages to users (Supabase internals) |
| 17 | `app/[locale]/auth/login/page.tsx` | Missing `getDashboardUrl()` call — role-based routing function exists but is never used |
| 18 | `lib/auth.ts:159-171` | All mock users share same password `demo123` — one compromised = all compromised |
| 19 | `app/[locale]/dashboard/profile/page.tsx` | No auth check — any user can view/modify another user's profile |
| 20 | `app/[locale]/dashboard/curator/page.tsx:8` | No auth check — unauthorized users can spam curator messages |
| 21 | `app/[locale]/dashboard/consultation/page.tsx:24` | No auth check — unauthorized users can book consultations |
| 22 | `app/[locale]/dashboard/teachers/page.tsx:21` | No auth check — "Add Teacher" button accessible to anyone |
| 23 | `app/[locale]/dashboard/analyze/page.tsx:80-82` | Catch block sets error as if it's a valid result — renders error as success |

---

## MEDIUM (17)

| # | File | Bug |
|---|------|-----|
| 1 | `components/Layout.tsx:73` | Sidebar stays open after navigation — no `useEffect` to close on pathname change |
| 2 | `components/Layout.tsx:31,86` | Missing `aria-label` on menu toggle button — accessibility violation |
| 3 | `components/charts/BarChart.tsx:12` | Uses array index as React key instead of unique identifier |
| 4 | `components/charts/LineChart.tsx:27,32` | Uses array index as React key instead of unique identifier |
| 5 | `components/charts/DonutChart.tsx:19` | Uses array index as React key instead of unique identifier |
| 6 | `app/[locale]/dashboard/grades/page.tsx` | Modal has no Escape key handler or focus trap |
| 7 | `app/[locale]/dashboard/grades/page.tsx` | Missing body scroll lock when modal is open |
| 8 | `app/[locale]/dashboard/analyze/page.tsx:56` | Date parsing with `month.toLowerCase()` breaks with Russian month abbreviations |
| 9 | `app/[locale]/dashboard/analytics/page.tsx:56` | Same date parsing bug — Russian month names don't match filter logic |
| 10 | `app/[locale]/dashboard/qr/page.tsx:61` | No "scan again" button after successful scan — must leave page to rescan |
| 11 | `app/[locale]/dashboard/materials/page.tsx:89` | File input accepts any type/size — no validation despite UI claiming limits |
| 12 | `app/[locale]/dashboard/page.tsx:50` | Empty useEffect cleanup `return () => {}` — dead code, entire news state management is unnecessary |
| 13 | `app/[locale]/dashboard/page.tsx:83` | Unsafe inline array transformation in JSX without useMemo or null check on `timetable` |
| 14 | `app/[locale]/dashboard/layout.tsx:29-30` | Hardcoded `/` link instead of locale-aware routing |
| 15 | `api/ai/analyze/route.ts:16-18` | Race condition in rate limit reset — allows slightly more than 5 req/min under concurrency |
| 16 | `api/ai/analyze/route.ts:117` | Missing input sanitization — user-controlled subject names directly in response |
| 17 | `components/ErrorMessage.tsx` | Missing `React.memo` — pure component re-renders on every parent update |

---

## Top 5 Priorities

1. **Add role checks** to `/teacher`, `/admin`, `/parent` pages — complete RBAC bypass
2. **Fix `next/navigation` → `@/i18n/routing` imports** — 15+ files, breaks i18n everywhere
3. **Add error handling** to grade/timetable CRUD operations — silent data loss
4. **Revoke exposed secrets** in `.env.local` — real API keys committed to repo
5. **Add empty-data guards** to chart components — crash on empty arrays
