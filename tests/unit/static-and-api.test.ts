import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { cn } from '@/lib/utils'
import { getGradeColor, getStatusColor, colors } from '@/lib/design-system'

vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ru/dashboard',
  Link: ({ children }: any) => children,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ru/dashboard',
  useParams: () => ({ locale: 'ru' }),
}))

vi.mock('@/lib/database', () => ({
  getProfile: vi.fn().mockResolvedValue({ data: null, error: null }),
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
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
        })),
        order: vi.fn(),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
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
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
        })),
        order: vi.fn(),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  },
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  })),
}))

const PROJECT_ROOT = path.resolve(__dirname, '../..')

// =====================================================
// GREEN: cn() utility works correctly
// =====================================================
describe('cn() utility', () => {
  it('filters null, undefined, empty string and returns only truthy classes', () => {
    expect(cn('foo', null, undefined, '', 'bar')).toBe('foo bar')
  })

  it('returns empty string for all falsy inputs', () => {
    expect(cn(null, undefined, '', false, 0)).toBe('')
  })

  it('merges tailwind classes properly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles arrays with mixed values', () => {
    const result = cn(['a', 'b'], 'c')
    expect(result).toContain('a')
    expect(result).toContain('b')
    expect(result).toContain('c')
  })
})

// =====================================================
// RED: getGradeColor has no bounds validation (Bugs: out-of-range)
// GREEN: getGradeColor works correctly within 0-100
// =====================================================
describe('getGradeColor', () => {
  it('returns danger for 0', () => {
    expect(getGradeColor(0)).toBe(colors.danger)
  })

  it('returns success for 100', () => {
    expect(getGradeColor(100)).toBe(colors.success)
  })

  it('returns warning for exactly 70', () => {
    expect(getGradeColor(70)).toBe(colors.warning)
  })

  it('returns primary for exactly 80', () => {
    expect(getGradeColor(80)).toBe(colors.primary)
  })

  it('returns success for 90', () => {
    expect(getGradeColor(90)).toBe(colors.success)
  })

  it('returns danger for 69', () => {
    expect(getGradeColor(69)).toBe(colors.danger)
  })

  it('BUG: should reject score > 100 but returns success for 150', () => {
    expect(getGradeColor(150)).not.toBe(colors.success)
  })

  it('BUG: should reject negative score but returns danger for -5', () => {
    expect(getGradeColor(-5)).not.toBe(colors.danger)
  })
})

// =====================================================
// GREEN: getStatusColor works for valid inputs
// RED: Bug 7.7 — getStatusColor silently returns inactive for invalid status
// =====================================================
describe('getStatusColor', () => {
  it('returns correct colors for active status', () => {
    const result = getStatusColor('active')
    expect(result.bg).toBe(`${colors.success}15`)
    expect(result.text).toBe(colors.success)
  })

  it('returns correct colors for inactive status', () => {
    const result = getStatusColor('inactive')
    expect(result.bg).toBe(colors.slate[100])
    expect(result.text).toBe(colors.slate[500])
  })

  it('BUG 7.7: should throw or return explicit error for unknown status, not silently return inactive colors', () => {
    expect(() => getStatusColor('pending' as any)).toThrow()
  })
})

// =====================================================
// GREEN: Auth pure functions work correctly
// =====================================================
describe('Auth pure functions', () => {
  let checkRole: any, getUserRole: any, getDashboardUrl: any

  beforeEach(async () => {
    const auth = await import('@/lib/auth')
    checkRole = auth.checkRole
    getUserRole = auth.getUserRole
    getDashboardUrl = auth.getDashboardUrl
  })

  it('checkRole returns false for null user', () => {
    expect(checkRole(null, 'student')).toBe(false)
  })

  it('checkRole returns true for matching role', () => {
    const user = { user_metadata: { role: 'teacher' } } as any
    expect(checkRole(user, 'teacher')).toBe(true)
  })

  it('checkRole returns false for non-matching role', () => {
    const user = { user_metadata: { role: 'student' } } as any
    expect(checkRole(user, 'admin')).toBe(false)
  })

  it('getUserRole returns student default for null user', () => {
    expect(getUserRole(null)).toBe('student')
  })

  it('getUserRole returns actual role from user_metadata', () => {
    const user = { user_metadata: { role: 'parent' } } as any
    expect(getUserRole(user)).toBe('parent')
  })

  it('getDashboardUrl maps admin to /admin', () => {
    expect(getDashboardUrl('admin')).toBe('/admin')
  })

  it('getDashboardUrl maps teacher to /teacher', () => {
    expect(getDashboardUrl('teacher')).toBe('/teacher')
  })

  it('getDashboardUrl maps parent to /parent', () => {
    expect(getDashboardUrl('parent')).toBe('/parent')
  })

  it('getDashboardUrl maps student to /dashboard', () => {
    expect(getDashboardUrl('student')).toBe('/dashboard')
  })

  it('getDashboardUrl defaults to /dashboard for unknown role', () => {
    expect(getDashboardUrl('unknown')).toBe('/dashboard')
  })
})

// =====================================================
// GREEN: i18n keys match
// =====================================================
describe('i18n key parity (Bug 8.7)', () => {
  const ru = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'messages/ru.json'), 'utf-8'))
  const kk = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'messages/kk.json'), 'utf-8'))

  it('top-level keys match between ru.json and kk.json', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(kk).sort())
  })

  it('each section has matching keys', () => {
    for (const section of Object.keys(ru)) {
      expect(Object.keys(ru[section]).sort()).toEqual(Object.keys(kk[section]).sort())
    }
  })
})

// =====================================================
// GREEN: tsconfig is correct
// =====================================================
describe('tsconfig', () => {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'tsconfig.json'), 'utf-8'))

  it('BUG 8.3: target should be ES2020 or later for modern JS support', () => {
    const target = tsconfig.compilerOptions.target.toLowerCase()
    expect(target).toMatch(/es202/)
  })

  it('strict mode is enabled (Bug 8.6)', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true)
  })
})

// =====================================================
// RED: Bug 2.8 — database.ts has @ts-ignore comments
// =====================================================
describe('database.ts @ts-ignore audit (Bug 2.8)', () => {
  it('should have zero @ts-ignore comments', () => {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, 'lib/database.ts'), 'utf-8')
    expect(source).not.toContain('@ts-ignore')
  })
})

// =====================================================
// RED: Bug 7.9 — mock IDs in hooks are positive, should be negative
// =====================================================
describe('Mock IDs in hooks should be negative (Bug 7.9)', () => {
  it('useGrades.ts mock IDs should be negative to avoid DB collisions', () => {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, 'hooks/useGrades.ts'), 'utf-8')
    const ids = [...source.matchAll(/id:\s*(\d+)/g)].map(m => parseInt(m[1], 10))
    for (const id of ids) {
      expect(id).toBeLessThan(0)
    }
  })

  it('useEvents.ts mock IDs should be negative to avoid DB collisions', () => {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, 'hooks/useEvents.ts'), 'utf-8')
    const ids = [...source.matchAll(/id:\s*(\d+)/g)].map(m => parseInt(m[1], 10))
    for (const id of ids) {
      expect(id).toBeLessThan(0)
    }
  })

  it('useTimetable.ts mock IDs should be negative to avoid DB collisions', () => {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, 'hooks/useTimetable.ts'), 'utf-8')
    const ids = [...source.matchAll(/id:\s*(\d+)/g)].map(m => parseInt(m[1], 10))
    for (const id of ids) {
      expect(id).toBeLessThan(0)
    }
  })
})

// =====================================================
// GREEN: Route handler only exports POST
// =====================================================
describe('Route handler exports (Bug 3.11)', () => {
  it('exports POST but not GET', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/api/ai/analyze/route.ts'),
      'utf-8'
    )
    expect(source).toMatch(/export\s+async\s+function\s+POST/)
    expect(source).not.toMatch(/export\s+(async\s+)?function\s+GET/)
  })
})

// =====================================================
// GREEN: SUPABASE_SCHEMA.md has RLS (separate from Bug 2.7)
// =====================================================
describe('SUPABASE_SCHEMA.md has RLS policies', () => {
  it('contains RLS policy definitions', () => {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, 'SUPABASE_SCHEMA.md'), 'utf-8')
    expect(source).toMatch(/enable row level security/)
    expect(source).toMatch(/create policy/)
  })
})

// =====================================================
// RED: Bug 2.7 — user_id columns have no performance indexes
// =====================================================
describe('SUPABASE_SCHEMA.md indexes on user_id columns (Bug 2.7)', () => {
  it('BUG 2.7: should define CREATE INDEX on user_id columns for query performance', () => {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, 'SUPABASE_SCHEMA.md'), 'utf-8')
    expect(source).toMatch(/create index.*user_id/i)
  })
})

// =====================================================
// API route tests
// =====================================================
describe('API route /api/ai/analyze', () => {
  const mockGetUser = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    process.env.GEMINI_API_KEY = 'test-key'
    const mockGeminiText = JSON.stringify({
      average: 80,
      level: 'Excellent',
      weakSubjects: [],
      strongSubjects: ['Math'],
      summary: 'Good performance',
      recommendations: ['Keep it up'],
    })
    vi.doMock('@google/genai', () => ({
      GoogleGenAI: class {
        models = { generateContent: vi.fn().mockResolvedValue({ text: mockGeminiText }) }
      },
    }))
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({
        auth: { getUser: mockGetUser },
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
    vi.doMock('next/headers', () => ({
      cookies: () => ({}),
    }))
    vi.doMock('next/server', () => {
      class NextResponse {
        body: any
        status: number
        constructor(body: any, init?: { status?: number }) {
          this.body = typeof body === 'string' ? JSON.parse(body) : body
          this.status = init?.status ?? 200
        }
        static json(data: any, init?: { status?: number }) {
          return new NextResponse(JSON.stringify(data), init)
        }
      }
      return { NextResponse }
    })
    mockGetUser.mockReset()
  })

  afterEach(() => {
    delete process.env.GEMINI_API_KEY
  })

  function makeRequest(body: any) {
    return { json: () => Promise.resolve(body) } as any as Request
  }

  // GREEN: valid request works
  it('returns 200 with correct analysis for valid grades', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeRequest({
      grades: [
        { subject: 'Math', score: 90 },
        { subject: 'Physics', score: 70 },
      ]
    }))

    expect(res.status).toBe(200)
    expect(res.body.average).toBe(80)
    expect(res.body.level).toBe('Excellent')
    expect(res.body.strongSubjects).toContain('Math')
    expect(res.body.weakSubjects).toEqual([])
    expect(res.body.recommendations.length).toBeGreaterThan(0)
  })

  // RED: Bug 3.4 — empty grades should return 400, not 200 with NaN
  it('BUG 3.4: should return 400 for empty grades array (division by zero)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u2-empty' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeRequest({ grades: [] }))

    expect(res.status).toBe(400)
  })

  // GREEN: unauthenticated rejected
  it('returns 401 for unauthenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeRequest({ grades: [{ subject: 'Math', score: 50 }] }))

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Unauthorized')
  })

  // GREEN: rate limiting works
  it('returns 429 after 5 requests from same user within rate limit window (Bug 3.2)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'rate-test-user' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const validBody = { grades: [{ subject: 'Math', score: 85 }] }

    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(200)
    }

    const sixth = await POST(makeRequest(validBody))
    expect(sixth.status).toBe(429)
    expect(sixth.body.error).toBe('Too many requests')
  })

  // GREEN: validation works for invalid score type
  it('returns 400 for grade with string score instead of number', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u3' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeRequest({
      grades: [{ subject: 'Math', score: 'eighty' }]
    }))

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid grade data')
  })

  // GREEN: validation works for score > 100
  it('returns 400 for grade with score > 100', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u4' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeRequest({
      grades: [{ subject: 'Math', score: 150 }]
    }))

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid grade data')
  })

  // GREEN: validation works for missing subject
  it('returns 400 for grade with missing subject', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u5' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeRequest({
      grades: [{ score: 85 }]
    }))

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid grade data')
  })

  // RED: Bug 3.7 — non-array grades returns 'Invalid request' instead of 'Invalid grade data'
  it('BUG 3.7: POST with non-array grades should return { error: "Invalid grade data" } for consistency', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-bug37' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const res = await POST(makeRequest({ grades: 'not-array' }))

    expect(res.status).toBe(400)
    // Route currently returns 'Invalid request' — this assertion FAILS (RED)
    expect(res.body.error).toBe('Invalid grade data')
  })

  // RED: Bug 3.5 — grades.length > 50 returns 'Invalid request' instead of 'Invalid grade data'
  it('BUG 3.5: POST with 51 grades should return { error: "Invalid grade data" } for consistency', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-bug35' } } })

    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const fiftyOneGrades = Array.from({ length: 51 }, (_, i) => ({ subject: `Subject${i}`, score: 80 }))
    const res = await POST(makeRequest({ grades: fiftyOneGrades }))

    expect(res.status).toBe(400)
    // Route currently returns 'Invalid request' — this assertion FAILS (RED)
    expect(res.body.error).toBe('Invalid grade data')
  })
})

// =====================================================
// RED: Bug 6.1 — DeadlinesSection crashes when events is null (default = [] only handles undefined)
// =====================================================
describe('BUG 6.1: DeadlinesSection null-guard on events prop', () => {
  it('should have explicit null coalescing for events prop (events ?? [] or events?.filter)', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/DeadlinesSection.tsx'),
      'utf-8'
    )
    // Default param `events = []` only handles undefined, not null.
    // A proper null-guard requires `events ?? []`, `(events || [])`, or `events?.filter`.
    expect(source).toMatch(/events\s*\?\?\s*\[\]|\(events\s*\|\|\s*\[\]\)|events\?\.filter/)
  })
})

// =====================================================
// RED: Bug 6.4 — AIInsightsSection crashes when grades is null
// =====================================================
describe('BUG 6.4: AIInsightsSection null-guard on grades prop', () => {
  it('should have explicit null coalescing for grades prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/AIInsightsSection.tsx'),
      'utf-8'
    )
    // grades has no default and no null-guard; grades.length on null throws
    expect(source).toMatch(/grades\s*\?\?\s*\[\]|\(grades\s*\|\|\s*\[\]\)|grades\?\.length|grades\?\.reduce/)
  })
})

// =====================================================
// RED: Bug 6.6 — GradesSummarySection crashes when grades is null
// =====================================================
describe('BUG 6.6: GradesSummarySection null-guard on grades prop', () => {
  it('should have explicit null coalescing for grades prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/GradesSummarySection.tsx'),
      'utf-8'
    )
    // grades has no default and no null-guard; grades.length, grades.reduce, grades.filter all throw
    expect(source).toMatch(/grades\s*\?\?\s*\[\]|\(grades\s*\|\|\s*\[\]\)|grades\?\.length|grades\?\.reduce/)
  })
})

// =====================================================
// RED: Bug 6.7 — AnnouncementsSection crashes when announcements is null
// =====================================================
describe('BUG 6.7: AnnouncementsSection null-guard on announcements prop', () => {
  it('should have explicit null coalescing for announcements prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/AnnouncementsSection.tsx'),
      'utf-8'
    )
    // announcements has no default and no null-guard; .map() on null throws
    expect(source).toMatch(/announcements\s*\?\?\s*\[\]|\(announcements\s*\|\|\s*\[\]\)|announcements\?\.map/)
  })
})

// =====================================================
// RED: Bug 6.8 — GradesSection crashes when grades is null
// =====================================================
describe('BUG 6.8: GradesSection null-guard on grades prop', () => {
  it('should have explicit null coalescing for grades prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/GradesSection.tsx'),
      'utf-8'
    )
    // grades has no default and no null-guard; .slice() on null throws
    expect(source).toMatch(/grades\s*\?\?\s*\[\]|\(grades\s*\|\|\s*\[\]\)|grades\?\.slice/)
  })
})

// =====================================================
// RED: Bug 6.9 — TimetableSection crashes when timetable is null
// =====================================================
describe('BUG 6.9: TimetableSection null-guard on timetable prop', () => {
  it('should have explicit null coalescing for timetable prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/TimetableSection.tsx'),
      'utf-8'
    )
    // timetable has no default and no null-guard; .slice() on null throws
    expect(source).toMatch(/timetable\s*\?\?\s*\[\]|\(timetable\s*\|\|\s*\[\]\)|timetable\?\.slice/)
  })
})

// =====================================================
// RED: Bug 6.11 — NewsFeedSection crashes when news is null
// =====================================================
describe('BUG 6.11: NewsFeedSection null-guard on news prop', () => {
  it('should have explicit null coalescing for news prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/NewsFeedSection.tsx'),
      'utf-8'
    )
    // news has no default and no null-guard; .slice() on null throws
    expect(source).toMatch(/news\s*\?\?\s*\[\]|\(news\s*\|\|\s*\[\]\)|news\?\.slice/)
  })
})

// =====================================================
// RED: Bug 6.12 — AchievementsSection crashes when achievements is null
// =====================================================
describe('BUG 6.12: AchievementsSection null-guard on achievements prop', () => {
  it('should guard against null achievements object (achievements?.students or achievements ?? {})', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/AchievementsSection.tsx'),
      'utf-8'
    )
    // achievements is an object; when null, destructuring or property access crashes.
    // Optional chaining like achievements?.students would be the guard.
    // Note: achievements.students?.toLocaleString() guards toLocaleString but NOT the null achievements itself.
    expect(source).toMatch(/achievements\s*\?\?\s*\{|\(achievements\s*\|\|\s*\{\}\)|achievements\s*&&\s*achievements\./)
  })
})

// =====================================================
// RED: Bug 6.13 — UpNextSection crashes when timetable is null
// =====================================================
describe('BUG 6.13: UpNextSection null-guard on timetable prop', () => {
  it('should have explicit null coalescing for timetable prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/UpNextSection.tsx'),
      'utf-8'
    )
    // timetable has no default and no null-guard; .filter() on null throws
    expect(source).toMatch(/timetable\s*\?\?\s*\[\]|\(timetable\s*\|\|\s*\[\]\)|timetable\?\.filter/)
  })
})

// =====================================================
// RED: Bug 6.14 — NewsSection crashes when news is null
// =====================================================
describe('BUG 6.14: NewsSection null-guard on news prop', () => {
  it('should have explicit null coalescing for news prop', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/NewsSection.tsx'),
      'utf-8'
    )
    // news has no default and no null-guard; .map() on null throws
    expect(source).toMatch(/news\s*\?\?\s*\[\]|\(news\s*\|\|\s*\[\]\)|news\?\.map/)
  })
})

// =====================================================
// RED: Bug 4.8 — grades/page.tsx has no null-guard before mapping grades
// =====================================================
describe('BUG 4.8: grades/page.tsx null-guard before mapping grades', () => {
  it('should use grades?.map or explicit null check before mapping', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/grades/page.tsx'),
      'utf-8'
    )
    // The file uses grades.map(...) directly with no optional chain or null check
    expect(source).toMatch(/grades\?\.map|grades\s*===\s*null|grades\s*!==\s*null\s*&&|\(grades\s*\?\?\s*\[\]\)\.map/)
  })
})

// =====================================================
// RED: Bug 10.10 — ESLint reports unused-vars violations
// =====================================================
describe('BUG 10.10: ESLint unused-vars should produce zero warnings', () => {
  it('spawnSync eslint --rule no-unused-vars:error exits with code 0', () => {
    const { spawnSync } = require('child_process')
    const result = spawnSync(
      'npx',
      ['eslint', '.', '--rule', '{"no-unused-vars": "error"}', '--ext', '.ts,.tsx', '--max-warnings', '0'],
      { cwd: PROJECT_ROOT, encoding: 'utf-8' }
    )
    // Expect exit code 0 (no violations) — will FAIL because unused vars exist
    expect(result.status).toBe(0)
  })
})

// =====================================================
// RED: Bug 3.1 — POST without matching Content-Type should return 415
// =====================================================
describe('BUG 3.1: /api/ai/analyze missing Content-Type returns 415', () => {
  const mockGetUser3_1 = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({
        auth: { getUser: mockGetUser3_1 },
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
    vi.doMock('next/headers', () => ({ cookies: () => ({}) }))
    vi.doMock('next/server', () => {
      class NextResponse {
        body: any
        status: number
        constructor(body: any, init?: { status?: number }) {
          this.body = typeof body === 'string' ? JSON.parse(body) : body
          this.status = init?.status ?? 200
        }
        static json(data: any, init?: { status?: number }) {
          return new NextResponse(JSON.stringify(data), init)
        }
      }
      return { NextResponse }
    })
    mockGetUser3_1.mockReset()
  })

  it('BUG 3.1: request with text/plain Content-Type should return 415 Unsupported Media Type', async () => {
    mockGetUser3_1.mockResolvedValue({ data: { user: { id: 'u-bug-3-1' } } })
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    const req = {
      json: () => Promise.resolve({ grades: [{ subject: 'Math', score: 80 }] }),
      headers: { get: (h: string) => h === 'content-type' ? 'text/plain' : null },
    } as any
    const res = await POST(req)
    // Route ignores Content-Type and returns 200 — assertion FAILS (RED)
    expect(res.status).toBe(415)
  })
})

// =====================================================
// RED: Bug 3.10 — unauthenticated request does not trigger console.warn
// =====================================================
describe('BUG 3.10: /api/ai/analyze should console.warn on unauthenticated access', () => {
  const mockGetUser3_10 = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.doMock('@supabase/auth-helpers-nextjs', () => ({
      createRouteHandlerClient: () => ({
        auth: { getUser: mockGetUser3_10 },
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
    vi.doMock('next/headers', () => ({ cookies: () => ({}) }))
    vi.doMock('next/server', () => {
      class NextResponse {
        body: any
        status: number
        constructor(body: any, init?: { status?: number }) {
          this.body = typeof body === 'string' ? JSON.parse(body) : body
          this.status = init?.status ?? 200
        }
        static json(data: any, init?: { status?: number }) {
          return new NextResponse(JSON.stringify(data), init)
        }
      }
      return { NextResponse }
    })
    mockGetUser3_10.mockReset()
  })

  it('BUG 3.10: should call console.warn when user is null (unauthenticated)', async () => {
    mockGetUser3_10.mockResolvedValue({ data: { user: null } })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { POST } = await import('@/app/[locale]/api/ai/analyze/route')
    await POST({ json: () => Promise.resolve({ grades: [{ subject: 'Math', score: 80 }] }) } as any)
    // Route returns 401 silently — console.warn is never called — assertion FAILS (RED)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

// =====================================================
// RED: Bug 4.1 — grades/page.tsx catch block must set error state
// =====================================================
describe('BUG 4.1: grades/page.tsx catch block should set error state', () => {
  it('should have setError called inside a catch block', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/grades/page.tsx'),
      'utf-8'
    )
    // File has no try/catch around getGrades and no error state variable at all
    expect(source).toMatch(/catch[\s\S]{0,200}setError|setError[\s\S]{0,200}catch/)
  })
})

// =====================================================
// RED: Bug 4.3 — analyze/page.tsx loadGrades has no rejection handler
// =====================================================
describe('BUG 4.3: analyze/page.tsx loadGrades fetch has no rejection handler', () => {
  it('loadGrades body should contain try/catch or .catch() around getGrades', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/analyze/page.tsx'),
      'utf-8'
    )
    // Extract just the loadGrades callback (between "const loadGrades" and its closing brace)
    const match = source.match(/const loadGrades[\s\S]*?\}, \[user\]\)/)
    expect(match).not.toBeNull()
    const block = match![0]
    // loadGrades calls getGrades without try/catch — assertion FAILS (RED)
    expect(block).toMatch(/try\s*\{|\.catch\s*\(/)
  })
})

// =====================================================
// RED: Bug 4.5 — dashboard/page.tsx useEffect missing cleanup return
// =====================================================
describe('BUG 4.5: dashboard/page.tsx useEffect missing cleanup return function', () => {
  it('useEffect should return a cleanup function', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/page.tsx'),
      'utf-8'
    )
    // The useEffect that populates news/announcements/achievements has no cleanup
    expect(source).toMatch(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?return\s*\(\s*\)\s*=>/)
  })
})


// =====================================================
// RED: Bug 2.5 — grades/page.tsx handleDeleteGrade missing rollback on failure
// =====================================================
describe('BUG 2.5: grades/page.tsx handleDeleteGrade missing rollback', () => {
  it('catch block after deleteGrade should restore previous grades state', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/grades/page.tsx'),
      'utf-8'
    )
    // handleDeleteGrade: await deleteGrade(id); setGrades(filter) — no try/catch at all
    // Pattern requires a catch that calls setGrades to restore prior state
    expect(source).toMatch(/deleteGrade[\s\S]{0,600}catch[\s\S]{0,300}setGrades/)
  })
})

// =====================================================
// RED: Bug 2.9 — grades/page.tsx handleAddGrade missing rollback on createGrade failure
// =====================================================
describe('BUG 2.9: grades/page.tsx handleAddGrade missing rollback on createGrade failure', () => {
  it('catch block after createGrade should rollback optimistically added grade', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/dashboard/grades/page.tsx'),
      'utf-8'
    )
    // handleAddGrade calls createGrade without try/catch — no rollback exists
    expect(source).toMatch(/createGrade[\s\S]{0,600}catch[\s\S]{0,300}setGrades/)
  })
})

// RED: Bug 6.3 — NewsFeedSection date not validated with isNaN
describe('BUG 6.3: NewsFeedSection date validation missing isNaN check', () => {
  it('should validate date with isNaN(new Date(...)) before rendering', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/NewsFeedSection.tsx'),
      'utf-8'
    )
    // The component calls new Date(item.date).toLocaleDateString() with no isNaN guard.
    // An invalid date string silently renders "Invalid Date".
    expect(source).toContain('isNaN(new Date(')
  })
})

// RED: Bug 6.5 — UpNextSection has no midnight-crossing logic
describe('BUG 6.5: UpNextSection missing midnight-crossing time comparison', () => {
  it('should handle end_time < start_time scenario (midnight crossing)', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/UpNextSection.tsx'),
      'utf-8'
    )
    // A class starting at 23:30 ending at 00:30 is never handled.
    // The component does simple string comparison with no wrap-around guard.
    expect(source).toMatch(/end_time.*<.*start_time|midnight|wrap|crossing|00:00/)
  })
})


// RED: Bug 6.15 — StudentQuickLinksSection uses window.location instead of router.push
describe('BUG 6.15: StudentQuickLinksSection uses window.location instead of router.push', () => {
  it('should NOT contain window.location (use router.push for locale-aware navigation)', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/StudentQuickLinksSection.tsx'),
      'utf-8'
    )
    // window.location.href bypasses Next.js router and loses locale prefix.
    // This fails RED because window.location IS present in the file.
    expect(source).not.toContain('window.location')
  })
})

// RED: Bug 6.16 — UpNextSection new Date() in render body is not memoized
describe('BUG 6.16: UpNextSection new Date() called in render without useMemo/useRef', () => {
  it('should wrap new Date() in useMemo or useRef to avoid stale time on re-renders', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/dashboard/UpNextSection.tsx'),
      'utf-8'
    )
    // new Date() is called at top of render with no memoization.
    // Assert memoization is present — it won't be.
    expect(source).toMatch(/useMemo|useRef/)
  })
})

// RED: Bug 5.14 — Card component does not spread data-testid or other HTML attrs
describe('BUG 5.14: Card component does not spread rest props (data-testid not forwarded)', () => {
  it('should extend HTMLAttributes or explicitly accept data-testid to support test selectors', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/ui/Card.tsx'),
      'utf-8'
    )
    // CardProps does not extend HTMLAttributes, so data-testid passed by consumers is silently dropped.
    // Assert HTMLAttributes extension or explicit data-testid prop — it won't exist.
    expect(source).toMatch(/HTMLAttributes|data-testid/)
  })
})

// RED: Bug 5.15 — GradesCalendar form submit has no empty/trim validation on subject
describe('BUG 5.15: GradesCalendar form submit missing trim/empty guard on subject', () => {
  it('should validate subject is not whitespace-only before submitting', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/ui/GradesCalendar.tsx'),
      'utf-8'
    )
    // handleAddLesson checks `formData.subject` truthiness — whitespace strings pass.
    // Assert .trim() or explicit empty-string check — it won't exist.
    expect(source).toMatch(/\.trim\(\)|subject\.length|subject\s*!==\s*['"]/)
  })
})

// RED: Bug 5.16 — GradesCalendar score input has no JS-level score > 100 validation
describe('BUG 5.16: GradesCalendar has no JS validation for score > 100', () => {
  it('should validate score > 100 in handleAddLesson JS logic, not just HTML max attr', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/ui/GradesCalendar.tsx'),
      'utf-8'
    )
    // HTML max="100" can be bypassed; handleAddLesson has no parseInt > 100 guard.
    // Assert JS-level guard — it won't exist.
    expect(source).toMatch(/parseInt.*>\s*100|score\s*>\s*100|grade\s*>\s*100|Number.*>\s*100/)
  })
})

// RED: Bug 8.4 — i18n.ts does not call notFound() for invalid locale (silently falls back)
describe('BUG 8.4: i18n.ts missing notFound() call for invalid locale', () => {
  it('should call notFound() when locale is not in routing.locales (not silently fall back)', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'i18n.ts'),
      'utf-8'
    )
    // File imports notFound but never invokes it — silently falls back to defaultLocale.
    // Assert notFound() is called — it won't be.
    expect(source).toMatch(/notFound\(\)/)
  })
})

// RED: Bug 10.4 — app/[locale]/page.tsx locale is hardcoded 'ru' instead of reading from params
describe('BUG 10.4: app/[locale]/page.tsx locale hardcoded instead of reading from params', () => {
  it('should read locale from params, not use a hardcoded string literal', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/page.tsx'),
      'utf-8'
    )
    // `const locale = 'ru'` is hardcoded — /kk/ route also redirects to /ru/.
    // Assert params.locale is used — it won't be.
    expect(source).toMatch(/params\.locale|params\['locale'\]/)
  })
})

// RED: Bug 10.8 — parent/page.tsx logout uses router.push('/') without locale prefix
describe('BUG 10.8: parent/page.tsx logout does not redirect to a locale-prefixed path', () => {
  it('should redirect to /{locale}/... on logout, not to bare /', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/parent/page.tsx'),
      'utf-8'
    )
    // Logout calls router.push('/') which drops locale prefix.
    // Assert locale-aware logout redirect pattern — it won't match.
    expect(source).toMatch(/router\.push\(['"`]\/[a-z]{2}\/|redirect\(['"`]\/[a-z]{2}\//)
  })
})

// RED: Bug 7.1 — useProfile.ts hook does not exist
describe('BUG 7.1: useProfile hook missing from hooks/ directory', () => {
  it('hooks/useProfile.ts should exist', () => {
    const exists = fs.existsSync(path.join(PROJECT_ROOT, 'hooks/useProfile.ts'))
    // File does not exist — assertion FAILS (RED)
    expect(exists).toBe(true)
  })
})

// RED: Bug 7.2 — useEvents.ts has no isMounted flag or AbortController
describe('BUG 7.2: useEvents missing unmount cleanup (isMounted/AbortController)', () => {
  it('should have isMounted flag or AbortController in useEffect cleanup', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useEvents.ts'),
      'utf-8'
    )
    // useEffect calls loadEvents() with no cleanup guard against state-after-unmount.
    expect(source).toMatch(/isMounted|AbortController|controller\.abort/)
  })
})

// RED: Bug 7.3 — useTimetable.ts has no isMounted flag or AbortController
describe('BUG 7.3: useTimetable missing unmount cleanup (isMounted/AbortController)', () => {
  it('should have isMounted flag or AbortController in useEffect cleanup', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useTimetable.ts'),
      'utf-8'
    )
    // Same pattern — no cleanup guard for async state updates after unmount.
    expect(source).toMatch(/isMounted|AbortController|controller\.abort/)
  })
})

// RED: Bug 7.4 — useGrades.ts error state not reset directly in user-change useEffect
describe('BUG 7.4: useGrades error state not reset directly in the user-change useEffect', () => {
  it('should call setError(null) inside the useEffect body that watches user', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useGrades.ts'),
      'utf-8'
    )
    // The useEffect only calls loadGrades(); setError(null) is inside loadGrades itself.
    // A stale error can persist briefly before loadGrades runs.
    // Assert setError(null) appears in the useEffect's immediate body — it won't.
    const effectMatch = source.match(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[user/)
    const effectBody = effectMatch ? effectMatch[1] : ''
    expect(effectBody).toMatch(/setError\s*\(\s*null\s*\)/)
  })
})

// RED: Bug 7.5 — useGrades.ts useEffect dependency uses whole [user] not [user?.id]
describe('BUG 7.5: useGrades useEffect depends on whole [user] object instead of [user?.id]', () => {
  it('should use [user?.id] as dependency in the useEffect array, not the whole user object', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useGrades.ts'),
      'utf-8'
    )
    // The useEffect dependency array should track userId (primitive) not the user object,
    // either via [user?.id, ...] directly or via a derived userId const.
    expect(source).toMatch(/,\s*\[\s*user\?\.id|const userId|userId,/)
  })
})

// RED: Bug 7.6 — useGrades.ts does not setLoading(false) when user is null
describe('BUG 7.6: useGrades does not set loading=false when user is null', () => {
  it('should call setLoading(false) immediately when user is null/falsy', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useGrades.ts'),
      'utf-8'
    )
    // When user/userId is null, setLoading(false) must be reached.
    // Accept both: `if (!user) { setLoading(false) }` and the else-branch pattern.
    expect(source).toMatch(/if\s*\(\s*!user(Id)?\s*\)[^}]*setLoading\s*\(\s*false\s*\)|else\s*\{[\s\S]*?setLoading\s*\(\s*false\s*\)/)
  })
})

// RED: Bug 2.1 — database.ts .single() calls have no null data check
describe('BUG 2.1: database.ts missing null data check after .single()', () => {
  it('should check for data === null after .single() to handle 0-row results', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'lib/database.ts'),
      'utf-8'
    )
    // .single() returns { data: null, error: null } for 0-row results in some Supabase configs.
    // No code in database.ts checks `if (data === null)`.
    expect(source).toMatch(/data\s*===\s*null|data\s*==\s*null|PGRST116/)
  })
})

// RED: Bug 2.3 — useGrades.ts has no race condition protection
describe('BUG 2.3: useGrades missing race condition protection for mid-flight user change', () => {
  it('should have abort/cleanup mechanism to cancel in-flight requests on user change', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useGrades.ts'),
      'utf-8'
    )
    // If user changes while getGrades() is awaiting, the old response can overwrite new state.
    // No AbortController, no currentUser closure, no ignore flag.
    expect(source).toMatch(/AbortController|ignore\s*=|currentUser|isCurrent/)
  })
})

// RED: Bug 2.4 — useGrades.ts injects mock data when DB returns empty array
describe('BUG 2.4: useGrades injects mock data when DB returns empty array', () => {
  it('should NOT contain mockGrades injection for empty DB results', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'hooks/useGrades.ts'),
      'utf-8'
    )
    // When data.length === 0, mock grades are silently injected — masking empty state.
    // Assertion fails RED because mockGrades IS present in the file.
    expect(source).not.toContain('mockGrades')
  })
})

// RED: Bug 2.6 — CreateEventModal passes `date` field instead of `due_date` to onCreate
describe('BUG 2.6: CreateEventModal passes date field instead of due_date to onCreate', () => {
  it('should pass due_date key in the onCreate callback argument, not date', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'components/ui/CreateEventModal.tsx'),
      'utf-8'
    )
    // formData uses `date` key; onCreate receives { title, date, description }.
    // The Event interface requires due_date — the callback shape is wrong.
    // Assert due_date is passed to onCreate — it won't be; date IS passed instead.
    expect(source).toMatch(/onCreate\s*\(\s*\{[^}]*due_date/)
  })
})



// RED: Bug 1.12 — login/page.tsx displays raw err.message to user
describe('BUG 1.12: login/page.tsx exposes raw err.message in UI', () => {
  it('should NOT use err.message directly (use a generic error message instead)', () => {
    const source = fs.readFileSync(
      path.join(PROJECT_ROOT, 'app/[locale]/auth/login/page.tsx'),
      'utf-8'
    )
    // catch block: setError(err.message || 'Failed to sign in')
    // This exposes raw Supabase error messages (e.g. "Invalid login credentials") to users.
    // Assertion fails RED because err.message IS present in the catch block.
    expect(source).not.toMatch(/err\.message/)
  })
})
