/**
 * RED tests for bugs in bugs.md that had no test coverage.
 * Each test FAILS while the bug exists and turns GREEN when fixed.
 *
 * Covers:
 *   CRITICAL #1  — teacher page no role check
 *   CRITICAL #2  — admin page no role check
 *   CRITICAL #3  — parent page no role check
 *   CRITICAL #6  — .env.local not in .gitignore
 *   CRITICAL #9  — login setTimeout race condition
 *   CRITICAL #10 — login missing role-based redirect
 *   CRITICAL #11 — grades createGrade no .catch()
 *   CRITICAL #12 — timetable add: no error handling
 *   CRITICAL #13 — timetable delete: updates UI even on failure
 *   CRITICAL #14 — materials fake upload (setTimeout only)
 *   HIGH #1      — useRouter/Link from next/navigation in 4 files
 *   HIGH #2      — Layout.tsx Link/usePathname from wrong packages
 *   HIGH #9      — qr page hardcoded Russian, no useTranslations
 *   HIGH #11     — rateLimit Map unbounded (no cleanup)
 *   HIGH #12     — withTimeout wraps Promise.resolve() (no-op)
 *   HIGH #14     — signUp always writes to localStorage
 *   HIGH #15     — signup uses alert()
 *   HIGH #16     — signup exposes raw Supabase error
 *   HIGH #17     — login uses router.push('/') not getDashboardUrl
 *   HIGH #18     — all demo accounts share same password
 *   HIGH #19     — profile page no auth check
 *   HIGH #20     — curator page no auth check
 *   HIGH #21     — consultation page no auth check
 *   HIGH #22     — teachers page no auth check
 *   HIGH #23     — analyze catch block sets result, not error state
 *   MEDIUM #1    — Layout sidebar not closed on navigation
 *   MEDIUM #2    — Layout menu button missing aria-label
 *   MEDIUM #3    — BarChart uses array index as React key
 *   MEDIUM #4    — LineChart uses array index as React key
 *   MEDIUM #5    — DonutChart uses array index as React key
 *   MEDIUM #10   — qr page no "scan again" button after success
 *   MEDIUM #11   — file input accepts any type/size (no validation)
 *   MEDIUM #13   — inline timetable .map() in dashboard JSX (no memoization)
 *   MEDIUM #14   — dashboard layout hardcodes href="/" instead of locale-aware path
 *   MEDIUM #16   — AI route returns user-supplied subject names unsanitized
 *   MEDIUM #17   — ErrorMessage is not wrapped in React.memo
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf-8')

// ─────────────────────────────────────────────────────
// CRITICAL #1 — teacher/page.tsx: any user can access teacher dashboard
// ─────────────────────────────────────────────────────
describe('CRITICAL #1: teacher page missing role check', () => {
  it('should import useAuth and check user role', () => {
    const src = read('app/[locale]/teacher/page.tsx')
    // Bug: no useAuth import, no role guard — any user can reach this page
    expect(src).toMatch(/useAuth|checkRole|user_metadata\.role/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #2 — admin/page.tsx: any user can access admin panel
// ─────────────────────────────────────────────────────
describe('CRITICAL #2: admin page missing role check', () => {
  it('should import useAuth and check user role before rendering', () => {
    const src = read('app/[locale]/admin/page.tsx')
    expect(src).toMatch(/useAuth|checkRole|user_metadata\.role/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #3 — parent/page.tsx: any user can view student grades
// ─────────────────────────────────────────────────────
describe('CRITICAL #3: parent page missing role check', () => {
  it('should import useAuth and check user role before rendering', () => {
    const src = read('app/[locale]/parent/page.tsx')
    expect(src).toMatch(/useAuth|checkRole|user_metadata\.role/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #6 — .env.local not in .gitignore
// ─────────────────────────────────────────────────────
describe('CRITICAL #6: .env.local exposed in repo', () => {
  it('.gitignore should include .env.local', () => {
    const gitignore = read('.gitignore')
    // Bug: real Supabase & Gemini keys committed — .env.local must be ignored
    expect(gitignore).toContain('.env.local')
  })

  it('.env.local should not contain real API key patterns', () => {
    const envPath = path.join(ROOT, '.env.local')
    if (!fs.existsSync(envPath)) return // file absent = not committed, OK
    const env = fs.readFileSync(envPath, 'utf-8')
    // Real Supabase project URLs are not localhost
    const hasRealSupabaseUrl = /SUPABASE_URL=https:\/\/[a-z0-9]+\.supabase\.co/.test(env)
    expect(hasRealSupabaseUrl).toBe(false)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #9 — login/page.tsx: setTimeout race between refreshUser and push
// ─────────────────────────────────────────────────────
describe('CRITICAL #9: login setTimeout race condition', () => {
  it('should not wrap refreshUser() inside setTimeout', () => {
    const src = read('app/[locale]/auth/login/page.tsx')
    // Bug: setTimeout(() => { refreshUser(); router.push('/') }, 100)
    // refreshUser is async; a fixed 100ms delay is fragile — user may redirect before state updates
    expect(src).not.toMatch(/setTimeout[\s\S]{0,60}refreshUser/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #10 — login/page.tsx: always redirects to '/' ignoring role
// ─────────────────────────────────────────────────────
describe('CRITICAL #10: login missing role-based redirect', () => {
  it('should use getDashboardUrl() for redirect after login', () => {
    const src = read('app/[locale]/auth/login/page.tsx')
    // Bug: router.push('/') — getDashboardUrl() exists in AuthContext but is never called
    expect(src).toMatch(/getDashboardUrl/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #11 — grades/page.tsx: createGrade promise has no .catch()
// ─────────────────────────────────────────────────────
describe('CRITICAL #11: grades createGrade unhandled rejection', () => {
  it('createGrade call should have error handling (.catch or try/catch)', () => {
    const src = read('app/[locale]/dashboard/grades/page.tsx')
    // Bug: createGrade(...).then(...) with no .catch() — unhandled rejection crashes silently
    // Only .catch() on the same promise chain is valid (not an unrelated try block elsewhere)
    expect(src).toMatch(/createGrade[\s\S]{0,300}\.catch\(/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #12 — timetable/page.tsx: handleAddEntry ignores DB errors
// ─────────────────────────────────────────────────────
describe('CRITICAL #12: timetable handleAddEntry no error handling', () => {
  it('createTimetableEntry result should destructure error and check it', () => {
    const src = read('app/[locale]/dashboard/timetable/page.tsx')
    // Bug: const { data } = await createTimetableEntry(...) — no error check
    // UI updates even if DB write failed, causing phantom entries
    expect(src).toMatch(/\{\s*data\s*,\s*error\s*\}[\s\S]{0,100}createTimetableEntry|createTimetableEntry[\s\S]{0,200}if\s*\(\s*error\s*\)/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #13 — timetable/page.tsx: handleDeleteEntry updates UI even on failure
// ─────────────────────────────────────────────────────
describe('CRITICAL #13: timetable handleDeleteEntry ignores errors', () => {
  it('should check deleteTimetableEntry result before updating entries state', () => {
    const src = read('app/[locale]/dashboard/timetable/page.tsx')
    // Bug: await deleteTimetableEntry(id); setEntries(entries.filter(...))
    // Even if DB delete fails, the local entry disappears — data inconsistency
    expect(src).not.toMatch(/await deleteTimetableEntry[\s\S]{0,10}\n\s*setEntries/)
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #14 — materials/page.tsx: upload is fake (setTimeout, no file processing)
// ─────────────────────────────────────────────────────
describe('CRITICAL #14: materials fake upload', () => {
  it('handleUpload should process actual file data, not just toggle a loading flag', () => {
    const src = read('app/[locale]/dashboard/materials/page.tsx')
    // Bug: handleUpload() calls setTimeout(() => setUploading(false), 1500)
    // No access to e.target.files or dataTransfer.files — nothing is uploaded
    expect(src).toMatch(/e\.target\.files|e\.dataTransfer\.files|new FormData/)
  })

  it('handleDrop should process dropped files, not just toggle loading', () => {
    const src = read('app/[locale]/dashboard/materials/page.tsx')
    // Bug: handleDrop only calls setTimeout, never reads e.dataTransfer.files
    expect(src).toMatch(/dataTransfer\.files|e\.files|FormData/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #1 — useRouter imported from next/navigation instead of @/i18n/routing
// ─────────────────────────────────────────────────────
describe('HIGH #1: useRouter/Link from next/navigation breaks i18n', () => {
  const files = [
    'app/[locale]/teacher/page.tsx',
    'app/[locale]/admin/page.tsx',
    'app/[locale]/auth/login/page.tsx',
    'app/[locale]/auth/signup/page.tsx',
    'app/[locale]/dashboard/qr/page.tsx',
    'app/[locale]/dashboard/curator/page.tsx',
    'app/[locale]/dashboard/consultation/page.tsx',
  ]

  for (const file of files) {
    it(`${file} should not import useRouter from next/navigation`, () => {
      const src = read(file)
      // Bug: useRouter from next/navigation generates non-locale-prefixed URLs
      expect(src).not.toMatch(/import\s*\{[^}]*useRouter[^}]*\}\s*from\s*['"]next\/navigation['"]/)
    })
  }
})

// ─────────────────────────────────────────────────────
// HIGH #2 — Layout.tsx: Link and usePathname from wrong packages
// ─────────────────────────────────────────────────────
describe('HIGH #2: Layout.tsx wrong navigation imports', () => {
  it('should not import Link from next/link', () => {
    const src = read('components/Layout.tsx')
    // Bug: Link from next/link generates non-locale-prefixed hrefs
    expect(src).not.toMatch(/from\s*['"]next\/link['"]/)
  })

  it('should not import usePathname from next/navigation', () => {
    const src = read('components/Layout.tsx')
    // Bug: usePathname from next/navigation returns /dashboard, not /ru/dashboard
    // so active link highlighting never matches
    expect(src).not.toMatch(/import\s*\{[^}]*usePathname[^}]*\}\s*from\s*['"]next\/navigation['"]/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #9 — qr/page.tsx: all text hardcoded in Russian, no i18n
// ─────────────────────────────────────────────────────
describe('HIGH #9: qr page not internationalized', () => {
  it('should use useTranslations() instead of hardcoded Russian strings', () => {
    const src = read('app/[locale]/dashboard/qr/page.tsx')
    // Bug: strings like "Сканирование QR" hardcoded — Kazakh locale never shown
    expect(src).toMatch(/useTranslations/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #11 — api/ai/analyze/route.ts: rateLimit Map grows unbounded
// ─────────────────────────────────────────────────────
describe('HIGH #11: rateLimit Map memory leak', () => {
  it('should clean up stale rate limit entries (setInterval or delete)', () => {
    const src = read('app/[locale]/api/ai/analyze/route.ts')
    // Bug: entries are only reset when the same user makes another request.
    // Inactive users leave entries in the Map forever.
    expect(src).toMatch(/rateLimit\.delete|setInterval[\s\S]*rateLimit|clearInterval/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #12 — api/ai/analyze/route.ts: withTimeout wraps Promise.resolve() (no-op)
// ─────────────────────────────────────────────────────
describe('HIGH #12: withTimeout is a no-op', () => {
  it('withTimeout should not wrap Promise.resolve() — that always resolves immediately', () => {
    const src = read('app/[locale]/api/ai/analyze/route.ts')
    // Bug: await withTimeout(Promise.resolve(), SUPABASE_TIMEOUT_MS)
    // Promise.resolve() completes synchronously — the timeout never fires
    expect(src).not.toMatch(/withTimeout\s*\(\s*Promise\.resolve\s*\(\s*\)/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #14 — lib/auth.ts: signUp always writes to localStorage, Supabase unreachable
// ─────────────────────────────────────────────────────
describe('HIGH #14: signUp bypasses Supabase auth', () => {
  it('signUp should not unconditionally write to localStorage and return early', () => {
    const src = read('lib/auth.ts')
    // Bug: localStorage.setItem(...) followed immediately by return { data, error: null }
    // makes the real Supabase signUp code permanently unreachable
    expect(src).not.toMatch(/localStorage\.setItem\(['"][^'"]*mock[^'"]*['"]/m)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #15 — auth/signup/page.tsx: alert() used for success message
// ─────────────────────────────────────────────────────
describe('HIGH #15: signup uses alert()', () => {
  it('should not call alert() for success feedback', () => {
    const src = read('app/[locale]/auth/signup/page.tsx')
    // Bug: alert() blocks the main thread and is not dismissible programmatically
    expect(src).not.toContain('alert(')
  })
})

// ─────────────────────────────────────────────────────
// HIGH #16 — auth/signup/page.tsx: raw Supabase error exposed to users
// ─────────────────────────────────────────────────────
describe('HIGH #16: signup exposes raw Supabase error message', () => {
  it('should show a generic error, not err.message from Supabase', () => {
    const src = read('app/[locale]/auth/signup/page.tsx')
    // Bug: setError(err.message || ...) leaks internal Supabase error strings to the UI
    expect(src).not.toMatch(/setError\s*\(\s*err\.message/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #17 — auth/login/page.tsx: getDashboardUrl() exists but is never called
// ─────────────────────────────────────────────────────
describe('HIGH #17: login ignores getDashboardUrl', () => {
  it('should call getDashboardUrl() for role-aware redirect after sign-in', () => {
    const src = read('app/[locale]/auth/login/page.tsx')
    // Bug: router.push('/') ignores role — student, teacher, admin all go to same page
    expect(src).toMatch(/getDashboardUrl/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #18 — all demo accounts share password 'demo123'
// ─────────────────────────────────────────────────────
describe('HIGH #18: all mock users share the same password', () => {
  it('demo credentials in login page should use distinct passwords', () => {
    const src = read('app/[locale]/auth/login/page.tsx')
    // Bug: student, teacher, admin all use { password: 'demo123' }
    // One leaked credential = all accounts compromised
    const passwords = [...src.matchAll(/password:\s*['"]([^'"]+)['"]/g)].map(m => m[1])
    const unique = new Set(passwords)
    expect(unique.size).toBeGreaterThan(1)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #19-22 — missing auth checks on protected pages
// ─────────────────────────────────────────────────────
describe('HIGH #19: profile page missing auth check', () => {
  it('should import useAuth and verify user before rendering', () => {
    const src = read('app/[locale]/dashboard/profile/page.tsx')
    // Bug: no useAuth import — any unauthenticated user can view/edit profile
    expect(src).toMatch(/useAuth/)
  })
})

describe('HIGH #20: curator page missing auth check', () => {
  it('should import useAuth before allowing curator messages', () => {
    const src = read('app/[locale]/dashboard/curator/page.tsx')
    // Bug: no auth check — unauthenticated users can spam curator messages
    expect(src).toMatch(/useAuth/)
  })
})

describe('HIGH #21: consultation page missing auth check', () => {
  it('should import useAuth before showing consultation booking', () => {
    const src = read('app/[locale]/dashboard/consultation/page.tsx')
    // Bug: no auth check — anyone can book consultations
    expect(src).toMatch(/useAuth/)
  })
})

describe('HIGH #22: teachers page missing auth check', () => {
  it('should import useAuth before rendering teacher management', () => {
    const src = read('app/[locale]/dashboard/teachers/page.tsx')
    // Bug: no auth check — "Add Teacher" accessible to anyone
    expect(src).toMatch(/useAuth/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #23 — analyze/page.tsx: catch block writes error into result state
// ─────────────────────────────────────────────────────
describe('HIGH #23: analyze catch block renders error as analysis result', () => {
  it('catch block should set error state, not result state', () => {
    const src = read('app/[locale]/dashboard/analyze/page.tsx')
    // Bug: catch (err) { setResult({ average: 0, level: 'Error', ... }) }
    // This makes errors appear as successful analyses with level='Error'
    expect(src).not.toMatch(/catch[\s\S]{0,100}setResult\s*\(/)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #1 — Layout.tsx: mobile sidebar stays open after navigation
// ─────────────────────────────────────────────────────
describe('MEDIUM #1: Layout sidebar stays open after navigation', () => {
  it('should close sidebar when pathname changes (useEffect on pathname)', () => {
    const src = read('components/Layout.tsx')
    // Bug: sidebarOpen state is never reset when user navigates — sidebar stays open
    expect(src).toMatch(/useEffect[\s\S]{0,100}pathname[\s\S]{0,100}setSidebarOpen\s*\(\s*false\s*\)|setSidebarOpen\s*\(\s*false\s*\)[\s\S]{0,100}pathname/)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #2 — Layout.tsx: mobile menu button missing aria-label
// ─────────────────────────────────────────────────────
describe('MEDIUM #2: Layout menu button missing aria-label', () => {
  it('mobile menu toggle button should have an aria-label', () => {
    const src = read('components/Layout.tsx')
    // Bug: <button onClick={() => setSidebarOpen(...)}>  — no aria-label
    // Screen readers announce this as an unlabeled button
    expect(src).toMatch(/aria-label/)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #3-5 — Charts use array index as React key
// ─────────────────────────────────────────────────────
describe('MEDIUM #3: BarChart uses array index as React key', () => {
  it('should not use array index as key in BarChart data map', () => {
    const src = read('components/charts/BarChart.tsx')
    // Bug: data.map((d, i) => <div key={i} ...>) — index keys cause wrong animations on reorder
    expect(src).not.toMatch(/\.map\s*\(\s*\([^)]*,\s*i\s*\)[\s\S]{0,30}key=\{i\}/)
  })
})

describe('MEDIUM #4: LineChart uses array index as React key', () => {
  it('should not use array index as key in LineChart point maps', () => {
    const src = read('components/charts/LineChart.tsx')
    expect(src).not.toMatch(/\.map\s*\(\s*\([^)]*,\s*i\s*\)[\s\S]{0,30}key=\{i\}/)
  })
})

describe('MEDIUM #5: DonutChart uses array index as React key', () => {
  it('should not use array index as key in DonutChart data map', () => {
    const src = read('components/charts/DonutChart.tsx')
    // Bug: data.map((d, i) => ... key={i} ...) — index key causes wrong animations on reorder
    expect(src).not.toContain('key={i}')
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #10 — qr/page.tsx: no "scan again" button after success
// ─────────────────────────────────────────────────────
describe('MEDIUM #10: qr page missing scan again button', () => {
  it('should show a "scan again" button after a successful scan', () => {
    const src = read('app/[locale]/dashboard/qr/page.tsx')
    // Bug: after setResult(...), there's no button to reset result and scan again
    // User must navigate away and back to scan a second code
    expect(src).toMatch(/scan.*again|ещё\s*раз|заново|result\s*&&[\s\S]{0,200}onClick[\s\S]{0,50}setResult\s*\(\s*['"]{2}\s*\)/i)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #11 — materials/page.tsx: file input has no type or size validation
// ─────────────────────────────────────────────────────
describe('MEDIUM #11: file input missing validation', () => {
  it('file input should have an accept attribute limiting allowed types', () => {
    const src = read('app/[locale]/dashboard/materials/page.tsx')
    // Bug: <input type="file" /> with no accept= — allows .exe, .bat, etc.
    expect(src).toMatch(/accept=/)
  })

  it('upload handler should validate file size before proceeding', () => {
    const src = read('app/[locale]/dashboard/materials/page.tsx')
    // Bug: handleDrop/handleUpload never checks file.size — any size accepted
    // material.size (display) is different from validation of uploaded file.size
    expect(src).toMatch(/file\.size|files\[0\]\.size|MAX_FILE_SIZE|maxFileSize/)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #13 — dashboard/page.tsx: inline .map() in JSX creates new array every render
// ─────────────────────────────────────────────────────
describe('MEDIUM #13: unsafe inline timetable transformation in dashboard JSX', () => {
  it('timetable prop should use useMemo or a pre-computed variable, not inline .map()', () => {
    const src = read('app/[locale]/dashboard/page.tsx')
    // Bug: timetable={timetable.map(t => ({...}))} in JSX — new array every render
    // forces UpNextSection to re-render even when timetable data is unchanged
    expect(src).not.toMatch(/timetable=\{timetable\.map\(/)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #14 — dashboard/layout.tsx: Link href="/" not locale-aware
// ─────────────────────────────────────────────────────
describe('MEDIUM #14: dashboard layout hardcodes href="/"', () => {
  it('logo/home link should use locale-aware href, not hardcoded "/"', () => {
    const src = read('app/[locale]/dashboard/layout.tsx')
    // Bug: <Link href="/"> — strips locale prefix on navigation
    // fix: href={`/${locale}`} or use Link from @/i18n/routing
    expect(src).not.toMatch(/href=["']\/["']/)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #16 — api/ai/analyze/route.ts: user-supplied subject names in response
// ─────────────────────────────────────────────────────
describe('MEDIUM #16: AI route returns unsanitized user input in response', () => {
  it('should sanitize subject names before including them in recommendations', () => {
    const src = read('app/[locale]/api/ai/analyze/route.ts')
    // Bug: weakSubjects / strongSubjects come directly from user input and are
    // embedded in response strings — XSS risk if output is rendered as HTML
    expect(src).toMatch(/sanitize|escapeHtml|replace[\s\S]{0,30}<|DOMPurify|encodeURIComponent/)
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #17 — ErrorMessage: pure component not wrapped in React.memo
// ─────────────────────────────────────────────────────
describe('MEDIUM #17: ErrorMessage missing React.memo', () => {
  it('ErrorMessage should be wrapped in React.memo to prevent unnecessary re-renders', () => {
    const src = read('components/ErrorMessage.tsx')
    // Bug: component re-renders on every parent update even if message prop is unchanged
    expect(src).toMatch(/React\.memo|memo\(/)
  })
})
