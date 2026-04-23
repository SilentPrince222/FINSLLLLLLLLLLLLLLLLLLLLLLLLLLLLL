/**
 * RED tests — new uncovered bugs found in 2026-04-23 scan.
 * Each test FAILS while the bug exists and turns GREEN when fixed.
 *
 * Does NOT duplicate bugs already covered in:
 *   tests/unit/red-bugs-md.test.tsx
 *   tests/unit/red-remaining-bugs.test.ts
 *   tests/unit/bugs-125-scan.test.ts
 *   tests/tier2.test.tsx
 *   tests/tier3.test.tsx
 *   tests/unit/static-and-api.test.ts
 *
 * New coverage:
 *   HC-1  — HomeClient.tsx: useRouter imported from next/navigation (not @/i18n/routing)
 *   HC-2  — HomeClient.tsx: getDashboardUrl in useEffect dep array (unstable ref → infinite renders)
 *   HC-3  — HomeClient.tsx: still renders spinner for unauthenticated users with no redirect
 *   GC-1  — GradesCalendar.tsx: calendar grid uses array index as React key
 *   GC-2  — GradesCalendar.tsx: modal backdrop hardcodes bg-white (dark mode broken)
 *   GC-3  — GradesCalendar.tsx: modal container missing role="dialog" (accessibility)
 *   GC-4  — GradesCalendar.tsx: modal has no Escape key / onKeyDown dismiss handler
 *   GC-5  — GradesCalendar.tsx: bare date string fed to new Date() → UTC → off-by-one in UTC- zones
 *   TT-1  — useTimetable.ts: abort cleanup returned from async fn (never called by useEffect)
 *   TT-2  — useEvents.ts: same dead-code abort pattern
 *   TT-3  — useTimetable.ts: userId-change race — no abort on old in-flight request
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf-8')

// ─────────────────────────────────────────────────────
// HC-1 — HomeClient.tsx imports useRouter from next/navigation
// Bug: next/navigation router ignores locale prefix on push()
// ─────────────────────────────────────────────────────
describe('HC-1: HomeClient.tsx imports useRouter from next/navigation', () => {
  it('should not import useRouter from next/navigation', () => {
    const src = read('app/[locale]/HomeClient.tsx')
    // Bug: same class as HIGH #1 in red-remaining-bugs — wrong router source breaks i18n
    expect(src).not.toMatch(
      /import\s*\{[^}]*useRouter[^}]*\}\s*from\s*['"]next\/navigation['"]/
    )
  })

  it('should import useRouter from @/i18n/routing', () => {
    const src = read('app/[locale]/HomeClient.tsx')
    expect(src).toMatch(/from\s*['"]@\/i18n\/routing['"]/)
  })
})

// ─────────────────────────────────────────────────────
// HC-2 — HomeClient.tsx: getDashboardUrl in useEffect dep array
// Bug: getDashboardUrl is recreated on every auth context render.
//      Adding it to deps causes the effect to re-run every render → infinite loop.
// ─────────────────────────────────────────────────────
describe('HC-2: HomeClient.tsx getDashboardUrl in useEffect dep array (infinite loop risk)', () => {
  it('should not list getDashboardUrl in the useEffect dependency array', () => {
    const src = read('app/[locale]/HomeClient.tsx')
    // Bug: useEffect([user, loading, router, getDashboardUrl, locale])
    // getDashboardUrl is a new function reference on every context render.
    // Depending on user/role is sufficient — getDashboardUrl is pure of role.
    const match = src.match(/useEffect\s*\(\s*[\s\S]*?,\s*\[([^\]]+)\]/)
    if (!match) return // no useEffect found — different problem
    const depsStr = match[1]
    expect(depsStr).not.toContain('getDashboardUrl')
  })
})

// ─────────────────────────────────────────────────────
// HC-3 — HomeClient.tsx: shows LoadingSpinner even when loading=false && user=null
// Bug: when loading is false and user is null the redirect fires but the spinner
//      still renders for one frame — there is no early return null.
// ─────────────────────────────────────────────────────
describe('HC-3: HomeClient.tsx missing early null return while redirect fires', () => {
  it('should return null (not the spinner) when loading=false and user=null', () => {
    const src = read('app/[locale]/HomeClient.tsx')
    // After redirect fires the component should not flash its loading UI.
    // Fix: return null when !loading (redirect is already in-flight).
    expect(src).toMatch(/if\s*\(\s*!loading\s*\)\s*return\s+null|loading\s*&&\s*.*LoadingSpinner/)
  })
})

// ─────────────────────────────────────────────────────
// GC-1 — GradesCalendar.tsx: array index as React key in calendar grid
// Bug: days.map((day, index) => ... key={index} ...)
//      Index keys cause wrong DOM reconciliation when the month changes.
// ─────────────────────────────────────────────────────
describe('GC-1: GradesCalendar.tsx calendar grid uses array index as React key', () => {
  it('should not use array index as key in the days.map()', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    // Bug: the calendar grid renders <div key={index}> — index keys cause wrong
    // DOM reconciliation when changing months (empty vs filled cells swap).
    // Fix: key={day !== null ? `day-${day}` : `empty-${index}`}
    expect(src).not.toContain('key={index}')
  })
})

// ─────────────────────────────────────────────────────
// GC-2 — GradesCalendar.tsx: modal backdrop hardcodes bg-white
// Bug: <div className="bg-white rounded-lg ..."> — stays white in dark mode.
// ─────────────────────────────────────────────────────
describe('GC-2: GradesCalendar.tsx modal panel hardcodes bg-white (dark mode broken)', () => {
  it('modal panel should not use bare bg-white (use bg-card or bg-background)', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    // Bug: bg-white inside the modal div overrides dark mode background
    // Fix: use bg-card or bg-background Tailwind tokens
    const modalBlock = src.slice(src.indexOf('showAddModal'))
    expect(modalBlock).not.toMatch(/\bbg-white\b/)
  })
})

// ─────────────────────────────────────────────────────
// GC-3 — GradesCalendar.tsx: modal container missing role="dialog"
// Bug: the modal overlay and panel divs have no ARIA dialog role.
//      Screen readers don't announce this as a dialog.
// ─────────────────────────────────────────────────────
describe('GC-3: GradesCalendar.tsx modal missing role="dialog" attribute', () => {
  it('the modal container should have role="dialog"', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    // Bug: no role="dialog" anywhere in the modal JSX
    // Fix: add role="dialog" aria-modal="true" to the inner panel div
    const modalBlock = src.slice(src.indexOf('showAddModal'))
    expect(modalBlock).toMatch(/role=["']dialog["']/)
  })

  it('the modal container should have aria-modal="true"', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    const modalBlock = src.slice(src.indexOf('showAddModal'))
    expect(modalBlock).toMatch(/aria-modal=["']true["']/)
  })
})

// ─────────────────────────────────────────────────────
// GC-4 — GradesCalendar.tsx: modal has no Escape key dismiss handler
// Bug: pressing Escape does not close the modal. Only clicking the backdrop/Cancel does.
// ─────────────────────────────────────────────────────
describe('GC-4: GradesCalendar.tsx modal cannot be dismissed with Escape key', () => {
  it('modal or its container should handle keyDown for Escape', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    // Bug: no onKeyDown handler in the modal block
    // Fix: add onKeyDown={(e) => e.key === 'Escape' && setShowAddModal(false)} or
    //      use a useEffect that listens for keydown events while modal is open
    const modalBlock = src.slice(src.indexOf('showAddModal'))
    expect(modalBlock).toMatch(/onKeyDown|Escape|useEffect[\s\S]{0,200}keydown/)
  })
})

// ─────────────────────────────────────────────────────
// GC-5 — GradesCalendar.tsx: bare date string → UTC midnight → off-by-one in UTC- zones
// Bug: new Date("2026-04-23") parses as UTC midnight.
//      In UTC-5, toLocaleDateString() returns "4/22/2026" (the previous day).
// ─────────────────────────────────────────────────────
describe('GC-5: GradesCalendar.tsx date display has UTC off-by-one bug', () => {
  it('should not pass a bare YYYY-MM-DD string directly to new Date() for display', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    // Bug: new Date(selectedDate).toLocaleDateString() where selectedDate = "YYYY-MM-DD"
    // ISO date-only strings are parsed as UTC midnight, causing day shift in UTC- timezones.
    // Fix: new Date(selectedDate + 'T00:00:00') or manual parsing.
    expect(src).not.toMatch(
      /new\s+Date\s*\(\s*selectedDate\s*\)\s*\.toLocaleDateString/
    )
  })

  it('should use a timezone-safe date parsing method for display', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    // Accept any safe pattern: appending T00:00:00, splitting on '-', or using a library
    expect(src).toMatch(
      /selectedDate\s*\+\s*['"]T00:00:00['"]|selectedDate\.split|new Date\([^)]*T00:00:00/
    )
  })
})

// ─────────────────────────────────────────────────────
// TT-1 — useTimetable.ts: abort cleanup is inside async fn (dead code)
// Bug: `return () => abortController.abort()` is the resolved value of the
//      loadTimetable Promise — not a cleanup function that useEffect can call.
//      The useEffect discards the Promise and no abort ever fires.
// ─────────────────────────────────────────────────────
describe('TT-1: useTimetable.ts abort cleanup placed inside async fn is dead code', () => {
  it('abort cleanup must NOT be the return value of the async loadTimetable callback', () => {
    const src = read('hooks/useTimetable.ts')
    // Bug: `async () => { ... return () => abortController.abort() }` as useCallback body.
    // The cleanup resolves as the Promise value; useEffect sees a Promise, not a cleanup fn.
    expect(src).not.toMatch(
      /useCallback\s*\(\s*async[\s\S]{0,900}return\s*\(\s*\)\s*=>\s*abortController\.abort\(\)/
    )
  })

  it('useEffect should call `return loadTimetable()` so the cleanup reaches React', () => {
    const src = read('hooks/useTimetable.ts')
    // Bug: useEffect calls bare `loadTimetable()` without return.
    // The Promise (and its embedded cleanup) is discarded — React never calls abort.
    // Fix: `return loadTimetable()` so React receives the Promise and can chain cleanup.
    expect(src).toMatch(/return\s+loadTimetable\(\)/)
  })
})

// ─────────────────────────────────────────────────────
// TT-2 — useEvents.ts: same dead-code abort pattern
// ─────────────────────────────────────────────────────
describe('TT-2: useEvents.ts abort cleanup placed inside async fn is dead code', () => {
  it('abort cleanup must NOT be the return value of the async loadEvents callback', () => {
    const src = read('hooks/useEvents.ts')
    // Same bug as TT-1: return () => abortController.abort() inside async fn
    expect(src).not.toMatch(
      /useCallback\s*\(\s*async[\s\S]{0,900}return\s*\(\s*\)\s*=>\s*abortController\.abort\(\)/
    )
  })

  it('useEffect should call `return loadEvents()` so the cleanup reaches React', () => {
    const src = read('hooks/useEvents.ts')
    // Bug: bare `loadEvents()` discards the Promise and its embedded cleanup.
    expect(src).toMatch(/return\s+loadEvents\(\)/)
  })
})

// ─────────────────────────────────────────────────────
// TT-3 — useTimetable.ts: userId-change race condition (old result overwrites new state)
// Bug: when userId changes from A to B, loadA runs in parallel with loadB.
//      loadA finishes after loadB → setEntries(A's data) overwrites B's data.
//      `mountedRef.current` is still true so the stale-update guard does NOT help here.
// ─────────────────────────────────────────────────────
describe('TT-3: useTimetable.ts has no protection against userId-change race condition', () => {
  it('should compare currentUserId to userId before setting state after await', () => {
    const src = read('hooks/useTimetable.ts')
    // Fix: after await getTimetable(), check `if (currentUserId !== userId) return`
    // OR use a loadId / generation counter to discard superseded responses.
    // (The existing mountedRef only protects unmount, not userId changes.)
    expect(src).toMatch(
      /currentUserId\s*!==\s*userId|activeLoadId|myLoadId\s*!==|loadId\s*!==|currentRequest/
    )
  })
})

// ─────────────────────────────────────────────────────
// GC-6 — GradesCalendar.tsx: calendar day cells have no keyboard handler
// Bug: <div onClick={() => handleDateClick(day)}> — not keyboard accessible.
//      Tab/Enter cannot be used to select a day.
// ─────────────────────────────────────────────────────
describe('GC-6: GradesCalendar.tsx day cells not keyboard accessible', () => {
  it('day cells should have onKeyDown or role="button" for keyboard navigation', () => {
    const src = read('components/ui/GradesCalendar.tsx')
    // Bug: only onClick on day cells — keyboard users (Enter/Space) can't open the modal.
    // Fix: add onKeyDown={(e) => e.key === 'Enter' && handleDateClick(day)} + role="button"
    const gridSection = src.slice(src.indexOf('Calendar Grid'))
    expect(gridSection).toMatch(/onKeyDown|role=["']button["']|tabIndex/)
  })
})
