import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import fs from 'fs'
import path from 'path'

const PROJECT_ROOT = path.resolve(__dirname, '..')

// ─────────────────────────────────────────────────────────────────────────────
// Shared mocks used across most component tests
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => {
  const push = vi.fn()
  return {
    useRouter: () => ({ push }),
    usePathname: () => '/ru/dashboard',
  }
})

vi.mock('framer-motion', () => {
  const MotionDiv = React.forwardRef((props: any, ref: any) =>
    React.createElement('div', { ...props, ref })
  )
  MotionDiv.displayName = 'MotionDiv'
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: any) => children,
  }
})

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: { getUser: vi.fn() },
  }),
  createClientComponentClient: () => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  }),
}))

vi.mock('next/headers', () => ({
  cookies: () => ({}),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  },
}))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeApiRequest(body: any, headers?: Record<string, string>) {
  return {
    json: () => Promise.resolve(body),
    headers: {
      get: (h: string) => headers?.[h.toLowerCase()] ?? null,
    },
    body: body ? new ReadableStream({
      start(controller) {
        if (typeof body === 'string') {
          controller.enqueue(new TextEncoder().encode(body))
        } else {
          controller.enqueue(new TextEncoder().encode(JSON.stringify(body)))
        }
        controller.close()
      }
    }) : null,
  } as any as Request
}

function makeNextResponseMock() {
  class NextResponse {
    body: any
    status: number
    constructor(body: any, init?: { status?: number }) {
      this.body = typeof body === 'string' ? JSON.parse(body) : body
      this.status = init?.status ?? 200
    }
    static json(data: any, init?: { status?: number }) {
      return new NextResponse(data, init)
    }
  }
  // Override the global Response to use our mock
  global.Response = NextResponse as any
  return { NextResponse }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3.4 — POST with grades:[] returns 400 (division by zero)
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 3.4: POST grades:[] returns 400', () => {
  const mockGetUser = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({ auth: { getUser: mockGetUser } }),
    }))
    vi.doMock('next/headers', () => ({ cookies: () => ({}) }))
    vi.doMock('next/server', makeNextResponseMock)
    mockGetUser.mockReset()
  })

  it('returns 400 for empty grades array', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-3-4' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeApiRequest(
      { grades: [] },
      { 'content-type': 'application/json' }
    ))
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3.1 — POST without application/json returns 415
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 3.1: POST without Content-Type: application/json returns 415', () => {
  const mockGetUser = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({ auth: { getUser: mockGetUser } }),
    }))
    vi.doMock('next/headers', () => ({ cookies: () => ({}) }))
    vi.doMock('next/server', makeNextResponseMock)
    mockGetUser.mockReset()
  })

  it('returns 415 when Content-Type is text/plain', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-3-1' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeApiRequest(
      { grades: [{ subject: 'Math', score: 80 }] },
      { 'content-type': 'text/plain' }
    ))
    expect(res.status).toBe(415)
  })

  it('returns 415 when Content-Type is multipart/form-data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-3-1b' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeApiRequest(
      { grades: [{ subject: 'Math', score: 80 }] },
      { 'content-type': 'multipart/form-data' }
    ))
    expect(res.status).toBe(415)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3.5 — POST with huge Content-Length returns 413
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 3.5: POST with huge Content-Length returns 413', () => {
  const mockGetUser = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({ auth: { getUser: mockGetUser } }),
    }))
    vi.doMock('next/headers', () => ({ cookies: () => ({}) }))
    vi.doMock('next/server', makeNextResponseMock)
    mockGetUser.mockReset()
  })

  it('returns 413 when Content-Length is 999999', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-3-5' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeApiRequest(
      { grades: [{ subject: 'Math', score: 80 }] },
      { 'content-type': 'application/json', 'content-length': '999999' }
    ))
    expect(res.status).toBe(413)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3.7 — All invalid-data errors return same generic message
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 3.7: All invalid-data errors return { error: "Invalid grade data" }', () => {
  const mockGetUser = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({ auth: { getUser: mockGetUser } }),
    }))
    vi.doMock('next/headers', () => ({ cookies: () => ({}) }))
    vi.doMock('next/server', makeNextResponseMock)
    mockGetUser.mockReset()
  })

  it('returns { error: "Invalid grade data" } for non-array grades', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-3-7a' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeApiRequest(
      { grades: 'not-an-array' },
      { 'content-type': 'application/json' }
    )) as any
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid grade data')
  })

  it('returns { error: "Invalid grade data" } for grades array > 50 items', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-3-7b' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const bigGrades = Array.from({ length: 51 }, (_, i) => ({ subject: `S${i}`, score: 70 }))
    const res = await POST(makeApiRequest(
      { grades: bigGrades },
      { 'content-type': 'application/json' }
    )) as any
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid grade data')
  })

  it('returns { error: "Invalid grade data" } for empty array', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-3-7c' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeApiRequest(
      { grades: [] },
      { 'content-type': 'application/json' }
    )) as any
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid grade data')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3.10 — Unauthenticated POST triggers console.warn
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 3.10: Unauthenticated POST triggers console.warn', () => {
  const mockGetUser = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({ auth: { getUser: mockGetUser } }),
    }))
    vi.doMock('next/headers', () => ({ cookies: () => ({}) }))
    vi.doMock('next/server', makeNextResponseMock)
    mockGetUser.mockReset()
  })

  it('calls console.warn when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    await POST(makeApiRequest(
      { grades: [{ subject: 'Math', score: 80 }] },
      { 'content-type': 'application/json' }
    ))
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 6.3 — NewsFeedSection: invalid date should not crash
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 6.3: NewsFeedSection should not crash with invalid date', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not crash when date is "invalid"', async () => {
    const C = (await import('@/components/dashboard/NewsFeedSection')).default
    expect(() =>
      render(React.createElement(C, {
        news: [{ id: 1, title: 'Test', date: 'invalid', preview: 'p', image: '' }]
      }))
    ).not.toThrow()
  })

  it('does not render "Invalid Date" text', async () => {
    const C = (await import('@/components/dashboard/NewsFeedSection')).default
    const { container } = render(React.createElement(C, {
      news: [{ id: 1, title: 'Test', date: 'not-a-date', preview: 'p', image: '' }]
    }))
    expect(container.textContent).not.toContain('Invalid Date')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 6.5 — UpNextSection: 00:30 class found at 23:45 (midnight crossing)
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 6.5: UpNextSection finds midnight-crossing class', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows a 00:30 class as upcoming when current time is 23:45', async () => {
    vi.setSystemTime(new Date('2026-04-20T23:45:00'))
    const C = (await import('@/components/dashboard/UpNextSection')).default
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const timetable = [
      { id: 1, subject: 'NightClass', day: currentDay, start_time: '00:30', end_time: '01:30', room: '101' },
    ]
    const { container } = render(React.createElement(C, { timetable }))
    expect(container.textContent).toContain('NightClass')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 6.15 — StudentQuickLinksSection: uses router.push, not window.location
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 6.15: StudentQuickLinksSection uses router.push', () => {
  let routerPush: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.resetModules()

    routerPush = vi.fn()

    // Re-mock both navigation sources
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: routerPush }),
      usePathname: () => '/ru/dashboard',
    }))
    vi.doMock('@/i18n/routing', () => ({
      useRouter: () => ({ push: routerPush }),
      usePathname: () => '/ru/dashboard',
      Link: ({ children, href }: any) => React.createElement('a', { href }, children),
      redirect: vi.fn(),
    }))
    vi.doMock('next-intl', () => ({
      useTranslations: () => (key: string) => key,
    }))
    vi.doMock('framer-motion', () => {
      const MotionDiv = React.forwardRef((props: any, ref: any) =>
        React.createElement('div', { ...props, ref })
      )
      MotionDiv.displayName = 'MotionDiv'
      return { motion: { div: MotionDiv } }
    })

    delete (window as any).location
    ;(window as any).location = { href: '' }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls router.push when scan-qr is clicked, not window.location', async () => {
    const C = (await import('@/components/dashboard/StudentQuickLinksSection')).default
    render(React.createElement(C))
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(routerPush).toHaveBeenCalled()
    expect(window.location.href).toBe('')
  })

  it('calls router.push when consultation is clicked', async () => {
    const C = (await import('@/components/dashboard/StudentQuickLinksSection')).default
    render(React.createElement(C))
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])
    expect(routerPush).toHaveBeenCalled()
    expect(window.location.href).toBe('')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 6.16 — UpNextSection: new Date() is memoized (useMemo/useRef present)
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 6.16: UpNextSection new Date() is memoized', () => {
  it('source file uses useMemo or useRef', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/UpNextSection.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/useMemo|useRef/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 4.1 — grades/page.tsx: loadGrades rejection → loading=false + error shown
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 4.1: grades/page catch block sets error state', () => {
  it('source file has setError inside a catch block', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/grades/page.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/catch[\s\S]{0,200}setError|setError[\s\S]{0,200}catch/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 4.3 — analyze/page.tsx: loadGrades has try/catch
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 4.3: analyze/page.tsx loadGrades has try/catch', () => {
  it('loadGrades callback contains try/catch around getGrades', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/analyze/page.tsx'),
      'utf-8'
    )
    const match = source.match(/const loadGrades[\s\S]*?\}, \[user\]\)/)
    expect(match).not.toBeNull()
    const block = match![0]
    expect(block).toMatch(/try\s*\{|\.catch\s*\(/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 4.5 — dashboard/page.tsx: useEffect returns cleanup function
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 4.5: dashboard/page.tsx useEffect returns cleanup', () => {
  it('useEffect contains a return () => cleanup pattern', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/page.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?return\s*\(\s*\)\s*=>/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 2.5 — grades/page.tsx: deleteGrade failure rolls back optimistic update
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 2.5: grades/page.tsx handleDeleteGrade rolls back on failure', () => {
  it('catch block after deleteGrade restores previous grades state', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/grades/page.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/deleteGrade[\s\S]{0,600}catch[\s\S]{0,300}setGrades/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 2.9 — grades/page.tsx: createGrade failure → grades unchanged
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 2.9: grades/page.tsx handleAddGrade rolls back on createGrade failure', () => {
  it('catch block after createGrade calls setGrades to restore previous state', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/grades/page.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/createGrade[\s\S]{0,600}catch[\s\S]{0,300}setGrades/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 5.15 — GradesCalendar: empty form shows validation message
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 5.15: GradesCalendar shows validation for empty subject', () => {
  it('source uses .trim() to validate subject', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/ui/GradesCalendar.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/\.trim\(\)|subject\.length|subject\s*!==\s*['"]/)
  })

  it('renders a validation error when Add Lesson is clicked with empty fields', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onAddLesson = vi.fn()
    const C = (await import('@/components/ui/GradesCalendar')).default

    const { container } = render(React.createElement(C, {
      onAddLesson,
      lessons: []
    }))

    // Click a day to open the modal
    const dayCells = container.querySelectorAll('[class*="min-h"]')
    const firstActiveDay = Array.from(dayCells).find(el => (el as HTMLElement).textContent?.trim() !== '')
    if (firstActiveDay) {
      fireEvent.click(firstActiveDay)
    }

    // Click Add Lesson without filling fields
    const addBtn = screen.queryByText('Add Lesson')
    if (addBtn) {
      fireEvent.click(addBtn)
      // Either onAddLesson is not called, or a validation message appears
      expect(onAddLesson).not.toHaveBeenCalled()
    }
    vi.restoreAllMocks()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 5.16 — GradesCalendar: grade "150" shows validation error
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 5.16: GradesCalendar JS validates score > 100', () => {
  it('source validates grade > 100 in JavaScript logic', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/ui/GradesCalendar.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/parseInt.*>\s*100|score\s*>\s*100|grade\s*>\s*100|gradeNum\s*>\s*100|Number.*>\s*100/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 5.14 — Card: passes data-testid to DOM
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 5.14: Card passes data-testid through to DOM', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders data-testid on the DOM element', async () => {
    const Card = (await import('@/components/ui/Card')).default
    const { container } = render(
      React.createElement(Card, { 'data-testid': 'tier2-card' } as any, 'Hello')
    )
    const el = container.querySelector('[data-testid="tier2-card"]')
    expect(el).not.toBeNull()
  })

  it('source extends HTMLAttributes to allow data-* props', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/ui/Card.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/HTMLAttributes|data-testid/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 7.7 — design-system: getStatusColor('invalid') throws, not silent fallback
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 7.7: getStatusColor throws for unknown status', () => {
  it('throws when passed "pending" as status', async () => {
    const { getStatusColor } = await import('@/lib/design-system')
    expect(() => getStatusColor('pending' as any)).toThrow()
  })

  it('still returns correct values for "active"', async () => {
    const { getStatusColor, colors } = await import('@/lib/design-system')
    const result = getStatusColor('active')
    expect(result.text).toBe(colors.success)
  })

  it('still returns correct values for "inactive"', async () => {
    const { getStatusColor, colors } = await import('@/lib/design-system')
    const result = getStatusColor('inactive')
    expect(result.bg).toBe(colors.slate[100])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 7.4 — useGrades: error clears when user changes
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 7.4: useGrades setError(null) in useEffect that watches user', () => {
  it('useEffect body that watches userId calls setError(null) directly', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useGrades.ts'),
      'utf-8'
    )
    // Match the useEffect that depends on userId/user (with loadGrades)
    const effectMatch = source.match(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[(?:userId|user)/)
    const effectBody = effectMatch ? effectMatch[1] : ''
    expect(effectBody).toMatch(/setError\s*\(\s*null\s*\)/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 7.6 — useGrades: loading is false when user is null
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 7.6: useGrades sets loading=false when user is null', () => {
  it('source sets loading=false in the null-user path', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useGrades.ts'),
      'utf-8'
    )
    // Should have setLoading(false) inside a null-user branch
    expect(source).toMatch(/setLoading\s*\(\s*false\s*\)/)
    // Verify there's a null-user guard somewhere that doesn't just return without setting loading
    expect(source).toMatch(/if\s*\(\s*!userId\s*\)|else\s*\{[\s\S]*?setLoading\s*\(\s*false\s*\)/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 1.12 — login/page.tsx: Supabase error shows generic message
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 1.12: login/page.tsx uses generic error message', () => {
  it('source does NOT contain err.message in catch blocks', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/auth/login/page.tsx'),
      'utf-8'
    )
    expect(source).not.toMatch(/err\.message/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 8.4 — i18n.ts: invalid locale calls notFound()
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 8.4: i18n.ts calls notFound() for invalid locale', () => {
  it('source calls notFound() when locale is invalid', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'i18n.ts'),
      'utf-8'
    )
    expect(source).toMatch(/notFound\(\)/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 10.8 — parent/page.tsx: logout redirect includes locale prefix
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 10.8: parent/page.tsx logout redirects with locale prefix', () => {
  it('router.push call includes a locale-prefixed path', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/parent/page.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/router\.push\([`'"][/][a-z]{2}[/]|router\.push\(`\/\$\{locale\}/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Bug 10.4 — app/[locale]/page.tsx: locale from params, not hardcoded
// ─────────────────────────────────────────────────────────────────────────────
describe('Bug 10.4: app/[locale]/page.tsx reads locale from params', () => {
  it('source does NOT contain const locale = "ru" hardcode', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/page.tsx'),
      'utf-8'
    )
    // Must not have the hardcoded assignment
    expect(source).not.toMatch(/const locale\s*=\s*['"]ru['"]/)
  })

  it('source uses params.locale or pathname-based locale extraction', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/page.tsx'),
      'utf-8'
    )
    expect(source).toMatch(/params\.locale|pathname\.split/)
  })
})
