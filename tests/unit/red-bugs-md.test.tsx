/**
 * RED tests — each test FAILS because the bug exists in bugs.md.
 * If a test turns green, it's a false positive — the bug wasn't real.
 *
 * Covers bugs from bugs.md (2026-04-22 audit):
 *   CRITICAL #4  — LineChart division by zero (data.length <= 1)
 *   CRITICAL #5  — DonutChart division by zero (empty data)
 *   HIGH    #4   — dashboard/page.tsx hardcoded locale = 'ru'
 *   HIGH    #6   — playwright.config.ts baseURL port 3001 ≠ dev server 3000
 *   HIGH    #8   — students/page.tsx Western names in mock data
 *   HIGH    #10  — kk.json "russian" says "Русский" not "Орысша"
 *   MEDIUM  #8/#9— analytics date parsing with Russian month abbreviations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = path.resolve(__dirname, '../..')

// ─────────────────────────────────────────────────────
// CRITICAL #4 — LineChart crashes when data.length <= 1
// Line 10: `(i / (data.length - 1)) * 100` → division by 0
// ─────────────────────────────────────────────────────
describe('CRITICAL #4: LineChart division by zero (data.length <= 1)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should not render an SVG when data is empty', async () => {
    const LineChart = (await import('@/components/charts/LineChart')).default
    const { container } = render(React.createElement(LineChart, { data: [] }))
    // Bug: empty data renders an SVG element anyway — component should return null
    expect(container.querySelector('svg')).toBeNull()
  })

  it('should render without NaN when data has single point (division by data.length - 1 = 0)', async () => {
    const LineChart = (await import('@/components/charts/LineChart')).default
    const { container } = render(
      React.createElement(LineChart, { data: [{ label: 'A', value: 50 }] })
    )
    // Bug: i / (1 - 1) = Infinity → SVG gets "Infinity" in path
    expect(container.innerHTML).not.toContain('Infinity')
    expect(container.innerHTML).not.toContain('NaN')
  })
})

// ─────────────────────────────────────────────────────
// CRITICAL #5 — DonutChart crashes when data is empty
// Line 8: total = 0, then `(d.value / total) * 100` → NaN
// ─────────────────────────────────────────────────────
describe('CRITICAL #5: DonutChart division by zero (empty data)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should render an empty state when data is empty, not an invisible SVG', async () => {
    const DonutChart = (await import('@/components/charts/DonutChart')).default
    const { container } = render(React.createElement(DonutChart, { data: [] }))
    // Bug: empty data renders empty SVG with zero circles — user sees nothing
    // Component should either show a fallback message or not render at all
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBeGreaterThan(0)
  })

  it('should render without NaN when all values are 0 (total = 0)', async () => {
    const DonutChart = (await import('@/components/charts/DonutChart')).default
    const { container } = render(
      React.createElement(DonutChart, {
        data: [
          { label: 'A', value: 0, color: '#3b82f6' },
          { label: 'B', value: 0, color: '#10b981' },
        ],
      })
    )
    expect(container.innerHTML).not.toContain('NaN')
  })
})

// ─────────────────────────────────────────────────────
// HIGH #4 — dashboard/page.tsx hardcoded locale = 'ru'
// Line 65: `const locale = 'ru'` instead of reading from params
// ─────────────────────────────────────────────────────
describe('HIGH #4: dashboard/page.tsx hardcoded locale', () => {
  it('should read locale from params, not hardcode "ru"', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/page.tsx'),
      'utf-8'
    )
    // Bug: line 65 is `const locale = 'ru'` — should use params.locale
    expect(source).not.toMatch(/const\s+locale\s*=\s*['"]ru['"]/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #6 — playwright.config.ts baseURL port 3001 ≠ 3000
// ─────────────────────────────────────────────────────
describe('HIGH #6: playwright.config.ts wrong port', () => {
  it('baseURL port should match dev server (3000)', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'playwright.config.ts'),
      'utf-8'
    )
    // Bug: baseURL set to 3001, dev server is on 3000
    expect(source).not.toContain('localhost:3001')
    expect(source).toContain('localhost:3000')
  })

  it('webServer url should use correct dev server port (3000)', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'playwright.config.ts'),
      'utf-8'
    )
    // Both are 3001 (consistent but both wrong). Dev server runs on 3000.
    // Bug: webServer.url should be localhost:3000 to match `npm run dev`
    expect(source).toMatch(/url:\s*['"]http:\/\/localhost:3000['"]/)
  })
})

// ─────────────────────────────────────────────────────
// HIGH #8 — students/page.tsx uses Western names (John Smith etc.)
// Violates Kazakhstan context guideline
// ─────────────────────────────────────────────────────
describe('HIGH #8: students/page.tsx Western names in mock data', () => {
  const westernNames = ['John', 'Emma', 'Michael', 'Sarah', 'James', 'Emily', 'David']

  it('should not contain Western mock names', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/students/page.tsx'),
      'utf-8'
    )
    for (const name of westernNames) {
      expect(source).not.toContain(name)
    }
  })

  it('should use Kazakh-style names', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/students/page.tsx'),
      'utf-8'
    )
    // Should contain at least one Kazakh name (starts with Cyrillic capital)
    const hasKazakhName = /name:\s*['"][А-ЯЁ]/.test(source)
    expect(hasKazakhName).toBe(true)
    // Emails should use @demo.edu not @college.edu
    expect(source).not.toContain('@college.edu')
  })
})

// ─────────────────────────────────────────────────────
// HIGH #10 — kk.json "russian" says "Русский" not "Орысша"
// The Kazakh translation file should use Kazakh word for "Russian"
// ─────────────────────────────────────────────────────
describe('HIGH #10: kk.json language selector wrong word', () => {
  it('languages.russian should be in Kazakh ("Орысша"), not Russian ("Русский")', () => {
    const kk = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'messages/kk.json'), 'utf-8')
    )
    // Bug: kk.json says "Русский" (Russian word) instead of "Орысша" (Kazakh word)
    expect(kk.languages.russian).toBe('Орысша')
  })

  it('languages.russian should NOT contain Cyrillic Russian word "Русский"', () => {
    const kk = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, 'messages/kk.json'), 'utf-8')
    )
    expect(kk.languages.russian).not.toBe('Русский')
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #8/#9 — analytics date parsing with Russian months
// .toLowerCase() on "Янв" → "янв" never matches "2026-01" dates
// ─────────────────────────────────────────────────────
describe('MEDIUM #8/#9: analytics date parsing Russian months', () => {
  it('progressData filter should actually match grades by month', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/analytics/page.tsx'),
      'utf-8'
    )
    // Bug: line 56 — `g.date.startsWith(months[i].toLowerCase())`
    // months = ['Янв', 'Фев', ...] → toLowerCase() = 'янв', 'фев'
    // dates = '2026-01', '2026-02' → never starts with 'янв' or 'фев'
    //
    // The filter should use proper date parsing, not string prefix matching
    // with Russian abbreviations. Assert that the filter doesn't rely on
    // .toLowerCase() of Russian month names to match ISO date strings.
    expect(source).not.toMatch(
      /months\[i\]\.toLowerCase\(\)|months\[.*\]\.toLowerCase\(\)/
    )
  })

  it('should use numeric month mapping or Date objects, not string prefix', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/analytics/page.tsx'),
      'utf-8'
    )
    // The correct approach: map 'Янв' → '01', 'Фев' → '02', etc.
    // Or parse dates with new Date() and compare months.
    // Bug: the code uses g.date.startsWith(month.toLowerCase()) which is wrong
    expect(source).toMatch(
      /new Date\(|getMonth\(\)|['"]01['"]|['"]02['"]|monthMap/
    )
  })
})

// ─────────────────────────────────────────────────────
// MEDIUM #12 — dashboard/page.tsx empty useEffect cleanup
// Line 50: `return () => {}` is dead code
// ─────────────────────────────────────────────────────
describe('MEDIUM #12: dashboard/page.tsx empty useEffect cleanup', () => {
  it('should not have empty cleanup return () => {}', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/page.tsx'),
      'utf-8'
    )
    // Bug: line 50 has `return () => {}` — this is dead code
    // Either remove it or make the cleanup meaningful (e.g., abort controller)
    expect(source).not.toContain('return () => {}')
  })
})

// ─────────────────────────────────────────────────────
// HIGH #7 — QuickLinksSection buttons are dead links
// href in data but never passed to Button — all links go nowhere
// ─────────────────────────────────────────────────────
describe('HIGH #7: QuickLinksSection dead button links', () => {
  it('should pass href to an anchor or Link element, not render href-less Button', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/QuickLinksSection.tsx'),
      'utf-8'
    )
    // Bug: quickLinks have href property but it's never used in JSX.
    // <Button> is not a link — clicking does nothing.
    // Should use <Link href={link.href}> or <a href={link.href}>
    expect(source).toMatch(/link\.href|href=\{link\./)
  })
})
