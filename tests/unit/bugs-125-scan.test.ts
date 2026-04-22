/**
 * RED tests for the 125-bug scan (2026-04-22, 15 parallel agents).
 * Each test FAILS while the bug exists and turns GREEN when fixed.
 *
 * Does NOT duplicate bugs already covered in:
 *   tests/unit/red-bugs-md.test.tsx
 *   tests/unit/red-remaining-bugs.test.ts
 *
 * New coverage (C = Critical, H = High, M = Medium):
 *   C3  — student dashboard has no role !== 'student' check
 *   C4  — admin page uses stale JWT metadata instead of auth context role
 *   C4  — parent page uses stale JWT metadata instead of auth context role
 *   C5  — dark mode: hardcoded bg-white / color:#334155 in Layout and globals
 *   C6  — admin/page.tsx imports useRouter from next/navigation (wrong)
 *   C6  — parent/page.tsx imports useRouter from next/navigation (wrong)
 *   H1  — BarChart: no guard against max=0 (division by zero)
 *   H2  — LineChart: no Number.isFinite filter on individual data values
 *   H3  — DonutChart: no guard against negative or NaN values
 *   H9  — useGrades: pulse setTimeout not tracked (memory leak on unmount)
 *   H13 — API route: NaN passes grade.score validation (typeof NaN === 'number')
 *   H14 — RegisterForm/AuthForm: email not trimmed before use
 *   H15 — RegisterForm: no password strength validation beyond minLength
 *   H17 — next.config.mjs: missing security headers (X-Frame-Options etc.)
 *   H18 — lib/auth.ts: session typed as `any` in onAuthStateChange
 *   H19 — lib/auth.ts: (data as any)?.role bypasses type safety
 *   M3  — parent/page.tsx: hardcoded Russian name "Иван Иванов"
 *   M6  — analyze/page.tsx: grades.sort() mutates React state array
 *   M8  — useTimetable: AbortController not wired to actual fetch call
 *   M9  — RegisterForm: setTimeout not cleaned up on unmount
 *   M17 — AuthForm: password visibility toggle has tabIndex={-1}
 *   M26 — LineChart: static gradient id="gradient" causes conflicts
 *   M29 — catch (err: any) in RegisterForm and AuthForm
 *   M30 — .env.local: NEXT_PUBLIC_ prefix on service role key
 *   M31 — lib/database.ts: .select('*') fetches unnecessary columns
 *   M37 — students/page.tsx: never calls Supabase (purely mock data)
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf-8')
const exists = (rel: string) => fs.existsSync(path.join(ROOT, rel))

// ─────────────────────────────────────────────────────
// C3 — Student dashboard has no role verification
// ─────────────────────────────────────────────────────
describe('C3: student dashboard missing role check', () => {
  it('should verify role === student, not just that a user exists', () => {
    const src = read('app/[locale]/dashboard/page.tsx')
    // Bug: only checks `if (!user)` — any authenticated user (teacher, admin) can view
    // Fix: add role !== 'student' redirect
    expect(src).toMatch(/role\s*!==\s*['"]student['"]|role\s*&&\s*role\s*!==\s*['"]student['"]/)
  })
})

// ─────────────────────────────────────────────────────
// C4 — Admin page bypasses DB role via stale JWT metadata
// ─────────────────────────────────────────────────────
describe('C4: admin page uses stale user_metadata instead of auth context role', () => {
  it('should not check user.user_metadata?.role directly (use role from useAuth)', () => {
    const src = read('app/[locale]/admin/page.tsx')
    // Bug: user.user_metadata?.role !== 'admin' — stale JWT can bypass revocation
    expect(src).not.toMatch(/user\.user_metadata\?\.role/)
  })

  it('should destructure role from useAuth() context', () => {
    const src = read('app/[locale]/admin/page.tsx')
    expect(src).toMatch(/const\s*\{[^}]*role[^}]*\}\s*=\s*useAuth\(\)/)
  })
})

// ─────────────────────────────────────────────────────
// C4 — Parent page bypasses DB role via stale JWT metadata
// ─────────────────────────────────────────────────────
describe('C4: parent page uses stale user_metadata instead of auth context role', () => {
  it('should not check user.user_metadata?.role directly', () => {
    const src = read('app/[locale]/parent/page.tsx')
    // Bug: user.user_metadata?.role !== 'parent' — same stale-metadata problem
    expect(src).not.toMatch(/user\.user_metadata\?\.role/)
  })

  it('should destructure role from useAuth() context', () => {
    const src = read('app/[locale]/parent/page.tsx')
    expect(src).toMatch(/const\s*\{[^}]*role[^}]*\}\s*=\s*useAuth\(\)/)
  })
})

// ─────────────────────────────────────────────────────
// C5 — Dark mode broken: hardcoded light-mode colors
// ─────────────────────────────────────────────────────
describe('C5: dark mode hardcoded colors in Layout.tsx', () => {
  it('Layout.tsx should not use bare bg-white (use bg-card or bg-background)', () => {
    const src = read('components/Layout.tsx')
    // Bug: 7+ instances of bg-white — all stay white in dark mode
    expect(src).not.toMatch(/\bbg-white\b/)
  })

  it('globals.css should not hardcode body color:#334155 outside a media query', () => {
    const src = read('app/globals.css')
    // Bug: `p { color: #334155 }` always overrides dark mode text color
    expect(src).not.toMatch(/color:\s*#334155/)
  })
})

// ─────────────────────────────────────────────────────
// C6 — Wrong navigation import in admin/page.tsx
// ─────────────────────────────────────────────────────
describe('C6: admin/page.tsx imports from next/navigation (should use @/i18n/routing)', () => {
  it('should not import useRouter from next/navigation', () => {
    const src = read('app/[locale]/admin/page.tsx')
    // Bug: useRouter from next/navigation drops locale prefix from all redirects
    expect(src).not.toMatch(/import\s*\{[^}]*useRouter[^}]*\}\s*from\s*['"]next\/navigation['"]/)
  })
})

// ─────────────────────────────────────────────────────
// C6 — Wrong navigation import in parent/page.tsx
// ─────────────────────────────────────────────────────
describe('C6: parent/page.tsx imports from next/navigation (should use @/i18n/routing)', () => {
  it('should not import useRouter from next/navigation', () => {
    const src = read('app/[locale]/parent/page.tsx')
    expect(src).not.toMatch(/import\s*\{[^}]*useRouter[^}]*\}\s*from\s*['"]next\/navigation['"]/)
  })
})

// ─────────────────────────────────────────────────────
// H1 — BarChart: division by zero when max is 0 or negative
// ─────────────────────────────────────────────────────
describe('H1: BarChart divides by max without guarding against max=0', () => {
  it('should compute a safe fallback when max is 0 or negative', () => {
    const src = read('components/charts/BarChart.tsx')
    // Bug: (d.value / max) * 100 — if max=0, height becomes Infinity
    // Fix: const safeMax = max && max > 0 ? max : Math.max(...)
    expect(src).toMatch(/safeMax|Math\.max[\s\S]{0,40}1\)|max\s*>\s*0/)
  })

  it('should use the safe max value in bar height calculation, not raw max', () => {
    const src = read('components/charts/BarChart.tsx')
    // After fix, height calculation should reference safeMax (or equivalent guard)
    expect(src).not.toMatch(/d\.value\s*\/\s*max\b/)
  })
})

// ─────────────────────────────────────────────────────
// H2 — LineChart: NaN/Infinity values corrupt SVG path
// ─────────────────────────────────────────────────────
describe('H2: LineChart does not filter NaN/Infinity data values', () => {
  it('should filter out non-finite data values before computing SVG path', () => {
    const src = read('components/charts/LineChart.tsx')
    // Bug: NaN in d.value propagates to y coordinate — breaks entire SVG path
    expect(src).toMatch(/Number\.isFinite|isFinite/)
  })
})

// ─────────────────────────────────────────────────────
// H3 — DonutChart: negative/NaN values produce invalid strokeDasharray
// ─────────────────────────────────────────────────────
describe('H3: DonutChart does not validate negative or NaN values', () => {
  it('should filter data to only include finite non-negative values', () => {
    const src = read('components/charts/DonutChart.tsx')
    // Bug: negative value → negative stroke length → broken arc rendering
    expect(src).toMatch(/Number\.isFinite|isFinite/)
  })

  it('should reject values where d.value < 0', () => {
    const src = read('components/charts/DonutChart.tsx')
    expect(src).toMatch(/>=\s*0|d\.value\s*>=/)
  })
})

// ─────────────────────────────────────────────────────
// H9 — useGrades: pulse setTimeout not tracked (can't be cleared on unmount)
// ─────────────────────────────────────────────────────
describe('H9: useGrades pulse setTimeout not stored for cleanup', () => {
  it('should store the pulse timeout ID so it can be cleared on unmount', () => {
    const src = read('hooks/useGrades.ts')
    // Bug: setTimeout(..., PULSE_DURATION_MS) result is not stored
    // If component unmounts within 6s, the callback fires into dead state
    // Fix: const timerId = setTimeout(...); return () => clearTimeout(timerId)
    expect(src).toMatch(/clearTimeout|const\s+\w*[Tt]imer\w*\s*=\s*setTimeout/)
  })
})

// ─────────────────────────────────────────────────────
// H13 — API route: NaN passes typeof 'number' check
// ─────────────────────────────────────────────────────
describe('H13: API analyze route does not reject NaN/Infinity scores', () => {
  it('should explicitly check Number.isFinite(grade.score) to reject NaN/Infinity', () => {
    const src = read('app/[locale]/api/ai/analyze/route.ts')
    // Bug: typeof NaN === 'number' → true; NaN < 0 → false; NaN > 100 → false
    // NaN passes all three checks and reaches the LLM call
    expect(src).toMatch(/Number\.isFinite\s*\(\s*grade\.score\s*\)/)
  })
})

// ─────────────────────────────────────────────────────
// H14 — Email not trimmed before use in form handlers
// ─────────────────────────────────────────────────────
describe('H14: RegisterForm email not trimmed (trailing spaces cause auth failures)', () => {
  it('should call .trim() when storing email value', () => {
    const src = read('components/RegisterForm.tsx')
    // Bug: setEmail(e.target.value) — user@example.com  (with space) fails auth
    expect(src).toMatch(/\.trim\(\)/)
  })
})

describe('H14: AuthForm email not trimmed', () => {
  it('should call .trim() when storing email value', () => {
    const src = read('components/AuthForm.tsx')
    expect(src).toMatch(/\.trim\(\)/)
  })
})

// ─────────────────────────────────────────────────────
// H15 — No password strength validation in RegisterForm
// ─────────────────────────────────────────────────────
describe('H15: RegisterForm has no password strength check beyond minLength', () => {
  it('should validate password strength (uppercase, lowercase, number)', () => {
    const src = read('components/RegisterForm.tsx')
    // Bug: only checks length (minLength={6}) — allows "aaaaaa", "123456"
    // Fix: require uppercase + lowercase + number, minimum 8 chars
    expect(src).toMatch(/[A-Z].*[a-z]|uppercase|lowercase|strength|/i.source + /[A-Z0-9]/.source)
  })
})

// ─────────────────────────────────────────────────────
// H17 — Missing security headers in next.config.mjs
// ─────────────────────────────────────────────────────
describe('H17: next.config.mjs missing security headers', () => {
  it('should define a headers() function in the Next.js config', () => {
    const src = read('next.config.mjs')
    // Bug: no headers config — no X-Frame-Options, X-Content-Type-Options, etc.
    expect(src).toMatch(/async\s+headers\s*\(\s*\)|headers\s*:\s*async/)
  })

  it('should include X-Frame-Options header', () => {
    const src = read('next.config.mjs')
    expect(src).toMatch(/X-Frame-Options/i)
  })

  it('should include X-Content-Type-Options header', () => {
    const src = read('next.config.mjs')
    expect(src).toMatch(/X-Content-Type-Options/i)
  })
})

// ─────────────────────────────────────────────────────
// H18 — session: any in onAuthStateChange callback
// ─────────────────────────────────────────────────────
describe('H18: lib/auth.ts uses session: any in onAuthStateChange', () => {
  it('should not type the session parameter as any', () => {
    const src = read('lib/auth.ts')
    // Bug: async (_event: string, session: any) — bypasses Supabase Session type
    expect(src).not.toMatch(/session:\s*any/)
  })

  it('should import and use the Session type from @supabase/supabase-js', () => {
    const src = read('lib/auth.ts')
    expect(src).toMatch(/Session.*supabase-js|from\s*['"]@supabase\/supabase-js['"][\s\S]{0,200}Session/)
  })
})

// ─────────────────────────────────────────────────────
// H19 — (data as any)?.role bypasses type checking in resolveRole
// ─────────────────────────────────────────────────────
describe('H19: lib/auth.ts uses (data as any) to access role', () => {
  it('should not cast data to any to access .role', () => {
    const src = read('lib/auth.ts')
    // Bug: (data as any)?.role — hides type errors from profile schema changes
    expect(src).not.toMatch(/\(data\s+as\s+any\)\?\.role/)
  })
})

// ─────────────────────────────────────────────────────
// M3 — Parent dashboard has hardcoded Russian name "Иван Иванов"
// ─────────────────────────────────────────────────────
describe('M3: parent/page.tsx hardcoded Russian name "Иван Иванов"', () => {
  it('should not contain "Иван Иванов" — violates Kazakhstan context guideline', () => {
    const src = read('app/[locale]/parent/page.tsx')
    // Bug: Иван Иванов is a Russian name — all mock/demo names must be Kazakh
    expect(src).not.toContain('Иван Иванов')
  })
})

// ─────────────────────────────────────────────────────
// M6 — analyze/page.tsx: grades.sort() mutates React state array
// ─────────────────────────────────────────────────────
describe('M6: analyze/page.tsx mutates grades state with .sort()', () => {
  it('should spread grades before sorting to avoid mutating state', () => {
    const src = read('app/[locale]/dashboard/analyze/page.tsx')
    // Bug: grades.sort(...) mutates the original state array in-place
    // React may not re-render because the reference doesn't change
    expect(src).not.toMatch(/\bgrades\.sort\s*\(/)
  })

  it('should use [...grades].sort() or grades.slice().sort() instead', () => {
    const src = read('app/[locale]/dashboard/analyze/page.tsx')
    expect(src).toMatch(/\[\.\.\.\w*grades\w*\]\.sort\(|\w*grades\w*\.slice\(\)\.sort\(/)
  })
})

// ─────────────────────────────────────────────────────
// M8 — useTimetable: AbortController not wired to actual fetch
// ─────────────────────────────────────────────────────
describe('M8: useTimetable AbortController is created but never used to cancel fetch', () => {
  it('should either pass signal to getTimetable or remove the AbortController', () => {
    const src = read('hooks/useTimetable.ts')
    // Bug: abortController.signal is never passed to getTimetable() — the abort check
    // `abortController.signal.aborted` is always false (never aborted externally)
    // and the returned cleanup `() => abortController.abort()` is dead code
    expect(src).toMatch(/getTimetable\s*\([^)]*signal|AbortController[\s\S]{0,50}getTimetable[\s\S]{0,50}signal|signal:\s*abortController\.signal/)
  })
})

// ─────────────────────────────────────────────────────
// M9 — RegisterForm: setTimeout not cleaned up on unmount
// ─────────────────────────────────────────────────────
describe('M9: RegisterForm setTimeout has no cleanup on component unmount', () => {
  it('should store timer ID and clean up with clearTimeout in useEffect', () => {
    const src = read('components/RegisterForm.tsx')
    // Bug: setTimeout(() => router.push('/dashboard'), 1500) — no ref, no cleanup
    // If user navigates away, the callback fires and calls setState on dead component
    expect(src).toMatch(/clearTimeout|useRef[\s\S]{0,100}setTimeout|const\s+\w*[Tt]imer/)
  })
})

// ─────────────────────────────────────────────────────
// M17 — AuthForm: password visibility toggle has tabIndex={-1}
// ─────────────────────────────────────────────────────
describe('M17: AuthForm password toggle has tabIndex={-1} — inaccessible to keyboard', () => {
  it('should not remove password toggle from keyboard navigation', () => {
    const src = read('components/AuthForm.tsx')
    // Bug: tabIndex={-1} explicitly removes the toggle from tab order
    // Keyboard-only users can't toggle password visibility
    expect(src).not.toContain('tabIndex={-1}')
  })
})

// ─────────────────────────────────────────────────────
// M26 — LineChart: hardcoded id="gradient" clashes when multiple charts render
// ─────────────────────────────────────────────────────
describe('M26: LineChart uses static gradient ID — conflicts with multiple instances', () => {
  it('should not use a hardcoded static id="gradient" in the SVG', () => {
    const src = read('components/charts/LineChart.tsx')
    // Bug: <linearGradient id="gradient"> — every LineChart shares the same ID
    // When two charts appear on the same page, only the first gradient renders
    expect(src).not.toContain('id="gradient"')
  })

  it('should use a unique per-instance gradient ID (useId or similar)', () => {
    const src = read('components/charts/LineChart.tsx')
    expect(src).toMatch(/useId\(\)|gradientId|uniqueId/)
  })
})

// ─────────────────────────────────────────────────────
// M29 — catch (err: any) in RegisterForm
// ─────────────────────────────────────────────────────
describe('M29: RegisterForm uses catch (err: any) — bypasses TypeScript error typing', () => {
  it('should not use catch (err: any) — use unknown or instanceof Error check', () => {
    const src = read('components/RegisterForm.tsx')
    // Bug: catch (err: any) then err.message — unsafe, masks non-Error throws
    expect(src).not.toMatch(/catch\s*\(\s*err\s*:\s*any\s*\)/)
  })
})

describe('M29: AuthForm uses catch (err: any)', () => {
  it('should not use catch (err: any)', () => {
    const src = read('components/AuthForm.tsx')
    expect(src).not.toMatch(/catch\s*\(\s*err\s*:\s*any\s*\)/)
  })
})

// ─────────────────────────────────────────────────────
// M30 — NEXT_PUBLIC_ prefix on service role key makes it client-accessible
// ─────────────────────────────────────────────────────
describe('M30: .env.local exposes service role key to client via NEXT_PUBLIC_ prefix', () => {
  it('service role key should NOT have NEXT_PUBLIC_ prefix', () => {
    const envPath = path.join(ROOT, '.env.local')
    if (!exists('.env.local')) return // file absent = not an issue
    const env = fs.readFileSync(envPath, 'utf-8')
    // Bug: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY= exposes the service key in client bundles
    expect(env).not.toMatch(/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/)
  })
})

// ─────────────────────────────────────────────────────
// M31 — lib/database.ts: .select('*') fetches all columns unnecessarily
// ─────────────────────────────────────────────────────
describe('M31: lib/database.ts uses .select("*") — exposes unnecessary columns', () => {
  it('getProfile should select only needed columns, not *', () => {
    const src = read('lib/database.ts')
    // Bug: .select('*') in getProfile, getGrades, getTimetable etc.
    // Over-fetches data and exposes columns that aren't needed by the UI
    const profileFn = src.slice(src.indexOf('getProfile'), src.indexOf('getProfile') + 300)
    expect(profileFn).not.toMatch(/\.select\s*\(\s*['"`]\s*\*\s*['"`]\s*\)/)
  })
})

// ─────────────────────────────────────────────────────
// M37 — students/page.tsx: purely mock data, never calls Supabase
// ─────────────────────────────────────────────────────
describe('M37: students/page.tsx never queries Supabase — fully mock', () => {
  it('should import a database function to fetch real student data', () => {
    const src = read('app/[locale]/dashboard/students/page.tsx')
    // Bug: page uses hardcoded initialStudents array — no database integration
    // Any data in Supabase is never shown to teachers
    expect(src).toMatch(/from\s*['"]@\/lib\/database['"]|getStudents|getAllProfiles|supabase/)
  })

  it('should not rely solely on a hardcoded initialStudents constant', () => {
    const src = read('app/[locale]/dashboard/students/page.tsx')
    // If the only data source is the initialStudents constant (no fetch), the page is mock-only
    const hasDbImport = /from\s*['"]@\/lib\/database['"]|getAllProfiles|getStudents/.test(src)
    expect(hasDbImport).toBe(true)
  })
})
