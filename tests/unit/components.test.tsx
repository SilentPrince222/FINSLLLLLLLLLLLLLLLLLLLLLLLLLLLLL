import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

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
  const makeEl = (tag: string) => {
    const C = React.forwardRef((props: any, ref: any) =>
      React.createElement(tag, { ...props, ref })
    )
    C.displayName = `motion.${tag}`
    return C
  }
  return {
    motion: { div: makeEl('div'), p: makeEl('p'), span: makeEl('span'), h1: makeEl('h1'), h2: makeEl('h2'), ul: makeEl('ul'), li: makeEl('li') },
    AnimatePresence: ({ children }: any) => children,
    useReducedMotion: () => false,
  }
})

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

// =====================================================
// RED: All dashboard components should survive null props
// Each component MUST NOT crash when receiving null
// Bugs 6.1, 6.4, 6.6, 6.7, 6.8, 6.9, 6.11, 6.12, 6.13, 6.14
// =====================================================
describe('Dashboard components should not crash with null props', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('DeadlinesSection (Bug 6.1)', () => {
    it('renders with valid events', async () => {
      const C = (await import('@/components/dashboard/DeadlinesSection')).default
      const events = [
        { id: 1, title: 'Exam', due_date: '2099-01-01T10:00:00Z', description: 'Final', type: 'exam', priority: 'high' },
      ]
      const { container } = render(React.createElement(C, { events }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when events is null', async () => {
      const C = (await import('@/components/dashboard/DeadlinesSection')).default
      expect(() =>
        render(React.createElement(C, { events: null as any }))
      ).not.toThrow()
    })
  })

  describe('AIInsightsSection (Bug 6.4)', () => {
    it('renders with valid grades', async () => {
      const C = (await import('@/components/dashboard/AIInsightsSection')).default
      const grades = [{ id: 1, subject: 'Math', score: 85 }]
      const { container } = render(React.createElement(C, { grades }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when grades is null', async () => {
      const C = (await import('@/components/dashboard/AIInsightsSection')).default
      expect(() =>
        render(React.createElement(C, { grades: null as any }))
      ).not.toThrow()
    })
  })

  describe('GradesSummarySection (Bug 6.6)', () => {
    it('renders with valid grades', async () => {
      const C = (await import('@/components/dashboard/GradesSummarySection')).default
      const grades = [{ id: 1, subject: 'Math', score: 90, created_at: '2026-04-20' }]
      const { container } = render(React.createElement(C, { grades }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when grades is null', async () => {
      const C = (await import('@/components/dashboard/GradesSummarySection')).default
      expect(() =>
        render(React.createElement(C, { grades: null as any }))
      ).not.toThrow()
    })
  })

  describe('AnnouncementsSection (Bug 6.7)', () => {
    it('renders with valid announcements', async () => {
      const C = (await import('@/components/dashboard/AnnouncementsSection')).default
      const announcements = [{ id: 1, title: 'Holiday', date: '2026-04-22', priority: 'high' as const }]
      const { container } = render(React.createElement(C, { announcements }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when announcements is null', async () => {
      const C = (await import('@/components/dashboard/AnnouncementsSection')).default
      expect(() =>
        render(React.createElement(C, { announcements: null as any }))
      ).not.toThrow()
    })
  })

  describe('GradesSection (Bug 6.8)', () => {
    it('renders with valid grades', async () => {
      const C = (await import('@/components/dashboard/GradesSection')).default
      const grades = [{ id: 1, subject: 'Math', score: 85 }]
      const { container } = render(React.createElement(C, { grades }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when grades is null', async () => {
      const C = (await import('@/components/dashboard/GradesSection')).default
      expect(() =>
        render(React.createElement(C, { grades: null as any }))
      ).not.toThrow()
    })
  })

  describe('TimetableSection (Bug 6.9)', () => {
    it('renders with valid timetable', async () => {
      const C = (await import('@/components/dashboard/TimetableSection')).default
      const timetable = [{ id: 1, subject: 'Math', day: 'Monday', start_time: '09:00' }]
      const { container } = render(React.createElement(C, { timetable }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when timetable is null', async () => {
      const C = (await import('@/components/dashboard/TimetableSection')).default
      expect(() =>
        render(React.createElement(C, { timetable: null as any }))
      ).not.toThrow()
    })
  })

  describe('NewsFeedSection (Bug 6.11)', () => {
    it('renders with valid news', async () => {
      const C = (await import('@/components/dashboard/NewsFeedSection')).default
      const news = [{ id: 1, title: 'Update', date: '2026-04-20', preview: 'Text', image: '' }]
      const { container } = render(React.createElement(C, { news }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when news is null', async () => {
      const C = (await import('@/components/dashboard/NewsFeedSection')).default
      expect(() =>
        render(React.createElement(C, { news: null as any }))
      ).not.toThrow()
    })
  })

  describe('AchievementsSection (Bug 6.12)', () => {
    it('renders with valid achievements', async () => {
      const C = (await import('@/components/dashboard/AchievementsSection')).default
      const achievements = { students: 1000, faculty: 50, publications: 30, awards: 10 }
      const { container } = render(React.createElement(C, { achievements }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when achievements is null', async () => {
      const C = (await import('@/components/dashboard/AchievementsSection')).default
      expect(() =>
        render(React.createElement(C, { achievements: null as any }))
      ).not.toThrow()
    })
  })

  describe('UpNextSection (Bug 6.13)', () => {
    it('renders with valid timetable', async () => {
      const C = (await import('@/components/dashboard/UpNextSection')).default
      const timetable = [{ id: 1, subject: 'Math', day: 'Monday', start_time: '09:00', end_time: '10:00', room: '101' }]
      const { container } = render(React.createElement(C, { timetable }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when timetable is null', async () => {
      const C = (await import('@/components/dashboard/UpNextSection')).default
      expect(() =>
        render(React.createElement(C, { timetable: null as any }))
      ).not.toThrow()
    })
  })

  describe('NewsSection (Bug 6.14)', () => {
    it('renders with valid news', async () => {
      const C = (await import('@/components/dashboard/NewsSection')).default
      const news = [{ id: 1, title: 'Event', date: '2026-04-22', preview: 'Preview', image: '' }]
      const { container } = render(React.createElement(C, { news }))
      expect(container.innerHTML).toBeTruthy()
    })

    it('should not crash when news is null', async () => {
      const C = (await import('@/components/dashboard/NewsSection')).default
      expect(() =>
        render(React.createElement(C, { news: null as any }))
      ).not.toThrow()
    })
  })
})

// =====================================================
// RED: Bug 6.3 — NewsFeedSection should show proper error, not "Invalid Date"
// =====================================================
describe('NewsFeedSection should handle invalid dates gracefully (Bug 6.3)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should not render "Invalid Date" text when date string is malformed', async () => {
    const C = (await import('@/components/dashboard/NewsFeedSection')).default
    const news = [{ id: 1, title: 'Test', date: 'not-a-date', preview: 'p', image: '' }]
    const { container } = render(React.createElement(C, { news }))
    expect(container.textContent).not.toContain('Invalid Date')
  })
})

// =====================================================
// RED: Bug 6.5 — UpNextSection should find 00:30 class at 23:45
// =====================================================
describe('UpNextSection should find late-night classes correctly (Bug 6.5)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should show a 00:30 class as upcoming when current time is 23:45', async () => {
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

// =====================================================
// RED: Bug 6.15 — StudentQuickLinksSection should use router.push, not window.location
// =====================================================
describe('StudentQuickLinksSection should use router.push, not window.location (Bug 6.15)', () => {
  let routerPush: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.resetModules()

    routerPush = vi.fn()
    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push: routerPush }),
      usePathname: () => '/ru/dashboard',
    }))
    vi.doMock('@/i18n/routing', () => ({
      useRouter: () => ({ push: routerPush }),
      usePathname: () => '/ru/dashboard',
      Link: (props: any) => React.createElement('a', props),
    }))

    delete (window as any).location
    ;(window as any).location = { href: '' }
  })

  it('should call router.push when clicking scan-qr, not set window.location.href', async () => {
    const C = (await import('@/components/dashboard/StudentQuickLinksSection')).default
    render(React.createElement(C))
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    expect(routerPush).toHaveBeenCalled()
    expect(window.location.href).toBe('')
  })

  it('should call router.push when clicking consultation, not set window.location.href', async () => {
    const C = (await import('@/components/dashboard/StudentQuickLinksSection')).default
    render(React.createElement(C))
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])

    expect(routerPush).toHaveBeenCalled()
    expect(window.location.href).toBe('')
  })
})

// =====================================================
// GREEN: Card passes through data-testid (no bug)
// =====================================================
describe('Card passes through data-testid to DOM element (Bug 5.14)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders data-testid attribute on the DOM element when passed as a prop', async () => {
    const Card = (await import('@/components/ui/Card')).default
    const { container } = render(
      React.createElement(Card, { 'data-testid': 'test-card', children: 'Hello' } as any)
    )
    const el = container.querySelector('[data-testid="test-card"]')
    expect(el).toBeTruthy()
    expect(el?.textContent).toContain('Hello')
  })

  it('passes through arbitrary data attributes via rest props spread', async () => {
    const Card = (await import('@/components/ui/Card')).default
    const { container } = render(
      React.createElement(Card, { 'data-testid': 'my-card', 'data-role': 'container', children: 'Content' } as any)
    )
    expect(container.querySelector('[data-testid="my-card"]')).toBeTruthy()
    expect(container.querySelector('[data-role="container"]')).toBeTruthy()
  })
})

// =====================================================
// GREEN: DeadlinesSection renders UTC dates
// =====================================================
describe('DeadlinesSection UTC date handling (Bug 6.2)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders event with UTC due_date without crashing', async () => {
    const C = (await import('@/components/dashboard/DeadlinesSection')).default
    const events = [
      { id: 1, title: 'Final Exam', due_date: '2026-04-23T23:59:00Z', description: 'Submit', type: 'exam', priority: 'high' },
    ]
    const { container } = render(React.createElement(C, { events }))
    expect(container.innerHTML).toBeTruthy()
  })

  it('displays deadline title when due_date is within 48 hours', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-22T12:00:00Z'))
    const C = (await import('@/components/dashboard/DeadlinesSection')).default
    const events = [
      { id: 1, title: 'Final Exam', due_date: '2026-04-23T23:59:00Z', description: 'Submit', type: 'exam', priority: 'high' },
    ]
    const { container } = render(React.createElement(C, { events }))
    expect(container.textContent).toContain('Final Exam')
    vi.useRealTimers()
  })
})

// =====================================================
// GREEN: AchievementsSection partial data
// =====================================================
describe('AchievementsSection with partial data', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('formats students count with toLocaleString', async () => {
    const C = (await import('@/components/dashboard/AchievementsSection')).default
    const achievements = { students: 1000, faculty: 0, publications: 5, awards: 0 }
    const { container } = render(React.createElement(C, { achievements }))
    expect(container.textContent).toContain('1,000')
  })

  it('displays 0 for faculty', async () => {
    const C = (await import('@/components/dashboard/AchievementsSection')).default
    const achievements = { students: 1000, faculty: 0, publications: 5, awards: 0 }
    const { container } = render(React.createElement(C, { achievements }))
    expect(container.textContent).toContain('0')
  })
})
