import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = path.resolve(__dirname, '../..')
const read = (rel: string) => fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf-8')

// =====================================================
// RED — BUG TG-1
// teacher/grades fetch uses /api/ai/analyze without locale prefix.
// Route is mounted at /{locale}/api/ai/analyze → 404 without prefix.
// =====================================================
describe('BUG TG-1: teacher/grades fetch must include locale prefix', () => {
    it('fetch URL should be template literal containing ${locale}/api/ai/analyze, not /api/ai/analyze', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        // Currently: fetch('/api/ai/analyze', ...) — this 404s in production
        expect(src).toMatch(/fetch\s*\(\s*`\/\$\{locale\}\/api\/ai\/analyze/)
    })
})

// =====================================================
// RED — BUG DA-1
// dashboard/analytics fetch uses /api/ai/analyze without locale prefix — same 404 bug.
// =====================================================
describe('BUG DA-1: analytics page fetch must include locale prefix', () => {
    it('fetch URL should be template literal containing ${locale}/api/ai/analyze', () => {
        const src = read('app/[locale]/dashboard/analytics/page.tsx')
        expect(src).toMatch(/fetch\s*\(\s*`\/\$\{locale\}\/api\/ai\/analyze/)
    })
})

// =====================================================
// RED — BUG TG-2
// When student has no grades, runAI falls back to Math.random() scores.
// This sends fake data to Gemini and misleads the teacher.
// =====================================================
describe('BUG TG-2: teacher/grades must NOT use Math.random() for AI payload', () => {
    it('source should not contain Math.random() — never send fake scores to AI', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        expect(src).not.toContain('Math.random()')
    })
})

// =====================================================
// RED — BUG TG-3
// scores.map((score, i) => <td key={i}> uses array index as React key.
// Subjects are fixed (SUBJECTS constant) — key should be SUBJECTS[i] or subject name.
// =====================================================
describe('BUG TG-3: teacher/grades scores.map must not use index as React key', () => {
    it('should not have key={i} inside scores.map — use subject name instead', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        // key={i} inside the td loop is the bug
        expect(src).not.toMatch(/scores\.map[\s\S]{0,120}key=\{i\}/)
    })
})

// =====================================================
// RED — BUG TG-4
// When student has no grades, runAI should abort with toast.error rather than
// sending any payload. The fix must use toast, not silently skip.
// =====================================================
describe('BUG TG-4: teacher/grades should toast.error when student has no grades', () => {
    it('should contain a toast.error call in the no-grades branch of runAI', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        // After fix: if (!subjMap || subjMap.size === 0) { toast.error(...); return }
        expect(src).toMatch(/size\s*===\s*0[\s\S]{0,200}toast\.error|subjMap\.size[\s\S]{0,200}toast\.error/)
    })
})

// =====================================================
// GREEN — teacher/grades page uses useLocale from next-intl
// =====================================================
describe('GREEN: teacher/grades imports useLocale for locale-aware API calls', () => {
    it('should import useLocale from next-intl', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        expect(src).toContain('useLocale')
    })
})

// =====================================================
// GREEN — analytics page uses useLocale from next-intl
// =====================================================
describe('GREEN: analytics page imports useLocale for locale-aware API calls', () => {
    it('should import useLocale from next-intl', () => {
        const src = read('app/[locale]/dashboard/analytics/page.tsx')
        expect(src).toContain('useLocale')
    })
})

// =====================================================
// GREEN — PortalShell teacher nav includes /teacher/grades
// =====================================================
describe('GREEN: PortalShell teacher nav has /teacher/grades entry', () => {
    it("teacher nav items should contain href '/teacher/grades'", () => {
        const src = read('components/portal/PortalShell.tsx')
        expect(src).toContain('/teacher/grades')
    })

    it('ClipboardList icon is used in teacher nav', () => {
        const src = read('components/portal/PortalShell.tsx')
        expect(src).toContain('ClipboardList')
    })
})

// =====================================================
// GREEN — teacher/layout.tsx maps /teacher/grades to a title
// =====================================================
describe('GREEN: teacher/layout.tsx has /teacher/grades in TITLE_BY_PATH', () => {
    it("TITLE_BY_PATH should include '/teacher/grades' key", () => {
        const src = read('app/[locale]/teacher/layout.tsx')
        expect(src).toContain('/teacher/grades')
    })
})

// =====================================================
// GREEN — GEMINI_API_KEY is server-only (no NEXT_PUBLIC_ prefix)
// =====================================================
describe('GREEN: GEMINI_API_KEY must not be exposed to client via NEXT_PUBLIC_', () => {
    it('.env.local should have GEMINI_API_KEY (not NEXT_PUBLIC_GEMINI_API_KEY)', () => {
        const src = read('.env.local')
        expect(src).toContain('GEMINI_API_KEY=')
        expect(src).not.toContain('NEXT_PUBLIC_GEMINI_API_KEY')
    })

    it('route.ts should reference process.env.GEMINI_API_KEY (not NEXT_PUBLIC_)', () => {
        const src = read('app/[locale]/api/ai/analyze/route.ts')
        expect(src).toContain('GEMINI_API_KEY')
        expect(src).not.toContain('NEXT_PUBLIC_GEMINI_API_KEY')
    })
})

// =====================================================
// GREEN — analytics page has "ИИ-анализ" button
// =====================================================
describe('GREEN: dashboard analytics page has AI analyze button', () => {
    it('source should contain ИИ-анализ button label', () => {
        const src = read('app/[locale]/dashboard/analytics/page.tsx')
        expect(src).toContain('ИИ-анализ')
    })

    it('should have disabled={aiLoading} on the AI button', () => {
        const src = read('app/[locale]/dashboard/analytics/page.tsx')
        expect(src).toContain('disabled={aiLoading}')
    })
})

// =====================================================
// GREEN — teacher/grades page has disable guard on all AI buttons
// =====================================================
describe('GREEN: teacher/grades AI buttons are disabled when aiLoading=true', () => {
    it('analyze buttons should have disabled={aiLoading}', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        expect(src).toContain('disabled={aiLoading}')
    })
})

// =====================================================
// GREEN — teacher/grades AI panel has close (X) button
// =====================================================
describe('GREEN: teacher/grades AI panel has close button', () => {
    it('should render an X icon and setAiStudent(null) on click', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        expect(src).toContain('setAiStudent(null)')
        expect(src).toContain('<X')
    })
})

// =====================================================
// GREEN — analytics page shows static insights when AI not yet run
// =====================================================
describe('GREEN: analytics page shows static insights before AI analysis', () => {
    it('should conditionally render static cards only when aiResult is null', () => {
        const src = read('app/[locale]/dashboard/analytics/page.tsx')
        expect(src).toContain('!aiResult && !aiLoading')
    })
})

// =====================================================
// GREEN — teacher/grades has all SUBJECTS as column headers
// =====================================================
describe('GREEN: teacher/grades table headers include all SUBJECTS', () => {
    it('should map SUBJECTS to <th> elements in table header', () => {
        const src = read('app/[locale]/teacher/grades/page.tsx')
        expect(src).toContain('SUBJECTS.map(s => (')
        expect(src).toMatch(/SUBJECTS\.map\s*\(\s*s\s*=>\s*\([\s\S]{0,60}<th/)
    })
})
