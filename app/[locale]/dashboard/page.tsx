'use client'

import { useMemo, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/routing'
import { useAuth, getDashboardUrl } from '@/lib/auth'
import { useGrades, useTimetable, useEvents } from '@/hooks'
import {
  TrendingUp,
  BookOpen,
  BarChart2,
  Calendar as CalIcon,
  Library,
  ArrowUpRight,
} from 'lucide-react'

type News = { id: number; title: string; date: string }

const STATIC_NEWS: News[] = [
  { id: 1, title: 'Открытие AI-лаборатории', date: '2026-04-15' },
  { id: 2, title: 'Студенческие инновации 2026', date: '2026-04-10' },
  { id: 3, title: 'Международная конференция', date: '2026-04-05' },
]

const DAY_NAMES_RU = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
const MONTH_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function formatDayMonth(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return `${d.getDate()} ${MONTH_RU[d.getMonth()]}`
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

function gradeColorVar(score: number): string {
  if (score >= 85) return 'var(--p-success)'
  if (score >= 70) return 'var(--p-fg1)'
  return 'var(--p-amber)'
}

export default function StudentDashboard() {
    const { user, role, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) ?? 'ru'
    const { grades, loading: gradesLoading } = useGrades()
    const { entries: timetable, loading: timetableLoading } = useTimetable()
    const { events, loading: eventsLoading } = useEvents()

    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (authLoading) return
        if (!user) { router.push(`/auth/login`); return }
        if (role && role !== 'student') { router.push(getDashboardUrl(role)); return }
    }, [authLoading, user, role, router, locale])

    const todayClasses = useMemo(() => {
        if (!mounted) return []
        const todayName = DAY_NAMES_RU[new Date().getDay()]
        const todayEn = new Date().toLocaleDateString('en-US', { weekday: 'long' })
        return timetable
            .filter(t => t.day === todayName || t.day.toLowerCase() === todayEn.toLowerCase())
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
    }, [timetable, mounted])

    const nextClass = useMemo(() => {
        if (!mounted) return null
        const now = new Date().toTimeString().slice(0, 5)
        return todayClasses.find(t => t.start_time > now) ?? todayClasses[0] ?? null
    }, [todayClasses, mounted])

    const countdownMin = useMemo(() => {
        if (!mounted || !nextClass) return null
        const [h, m] = nextClass.start_time.split(':').map(Number)
        const target = new Date()
        target.setHours(h, m, 0, 0)
        const diff = Math.floor((target.getTime() - Date.now()) / 60000)
        return diff > 0 ? diff : 0
    }, [nextClass, mounted])

    const gpa = useMemo(() => {
        if (!grades.length) return 0
        const avg = grades.reduce((s, g) => s + g.score, 0) / grades.length
        return Math.round(avg * 10) / 10
    }, [grades])

    const gpa100 = useMemo(() => (gpa ? (gpa / 100) * 4 : 0), [gpa])

    const attendance = 94
    const prevMonth = 87

    const recentGrades = useMemo(() => {
        return [...grades]
            .sort((a, b) => {
                const ad = (a as any).created_at ?? ''
                const bd = (b as any).created_at ?? ''
                return bd.localeCompare(ad)
            })
            .slice(0, 4)
    }, [grades])

    const upcomingDeadlines = useMemo(() => {
        const now = Date.now()
        return events
            .filter(e => new Date(e.due_date).getTime() >= now)
            .sort((a, b) => a.due_date.localeCompare(b.due_date))
            .slice(0, 3)
    }, [events])

    if (authLoading || gradesLoading || timetableLoading || eventsLoading) {
        return (
            <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
        )
    }

    if (!user) return null

    return (
        <>
            <div className="g12" style={{ marginBottom: 18 }}>
                {/* Up Next */}
                <div className="p-card cyan span3">
                    <div className="sec-head" style={{ marginBottom: 14 }}>
                        <div className="t-eyebrow">Следующая пара</div>
                        <span className="pill cyan">Сегодня</span>
                    </div>
                    {nextClass ? (
                        <>
                            <div className="t-h3">{nextClass.subject}</div>
                            <div className="p-num t-meta" style={{ marginTop: 8 }}>
                                {nextClass.start_time}{nextClass.end_time ? ` — ${nextClass.end_time}` : ''}
                                {nextClass.room ? ` · Ауд. ${nextClass.room}` : ''}
                            </div>
                            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--p-border)' }}>
                                <div className="t-eyebrow">Через</div>
                                <div className="num-display" style={{ fontSize: 'var(--p-t-2xl)', color: 'var(--p-accent)', marginTop: 6 }}>
                                    {countdownMin === null ? '—' : countdownMin > 0 ? `${countdownMin} мин` : 'Идёт сейчас'}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="t-h3">Нет занятий</div>
                            <div className="t-meta" style={{ marginTop: 8 }}>Расписание на сегодня пусто</div>
                        </>
                    )}
                </div>

                {/* GPA */}
                <div className="p-card span3">
                    <div className="clabel">GPA · Семестр 2</div>
                    <div className="cvalue">{gpa ? gpa100.toFixed(2) : '—'}</div>
                    <div className="cdelta up"><TrendingUp /> +0.12 к прошлому</div>
                    <div className="mini-bars">
                        {[55, 62, 70, 68, 75, 80, 78, 88].map((h, i) => (
                            <div
                                key={i}
                                className="b"
                                style={{
                                    height: `${h}%`,
                                    background: i === 7 ? 'var(--p-accent)' : `rgba(110,231,245,${0.18 + (i / 8) * 0.22})`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Attendance */}
                <div className="p-card span3">
                    <div className="clabel">Посещаемость</div>
                    <div className="cvalue">
                        {attendance}
                        <span style={{ color: 'var(--p-fg4)' }}>%</span>
                    </div>
                    <div className="cdelta up"><TrendingUp /> Выше среднего</div>
                    <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="t-meta">Апрель</span>
                            <span className="p-num t-meta" style={{ color: 'var(--p-success)' }}>{attendance}%</span>
                        </div>
                        <div className="bar-track"><div className="bar-fill g" style={{ width: `${attendance}%` }} /></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                            <span className="t-meta">Март</span>
                            <span className="p-num t-meta" style={{ color: 'var(--p-amber)' }}>{prevMonth}%</span>
                        </div>
                        <div className="bar-track"><div className="bar-fill a" style={{ width: `${prevMonth}%` }} /></div>
                    </div>
                </div>

                {/* Deadlines */}
                <div className="p-card span3">
                    <div className="clabel">Дедлайны</div>
                    <div style={{ marginTop: 8 }}>
                        {upcomingDeadlines.length === 0 ? (
                            <div className="t-meta" style={{ padding: '12px 0' }}>Нет ближайших дедлайнов</div>
                        ) : (
                            upcomingDeadlines.map(ev => {
                                const d = daysUntil(ev.due_date)
                                const urgency = d <= 2 ? 'danger' : d <= 7 ? 'amber' : ''
                                const color = d <= 2 ? 'var(--p-danger)' : d <= 7 ? 'var(--p-amber)' : 'var(--p-fg3)'
                                return (
                                    <div className="row-item" key={ev.id}>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <div className="t-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {ev.title}
                                            </div>
                                            <div className="p-num t-meta" style={{ color, marginTop: 3 }}>
                                                {formatDayMonth(ev.due_date)} · {d > 0 ? `${d} дн` : 'сегодня'}
                                            </div>
                                        </div>
                                        <span className={`pill ${urgency}`}>
                                            {d <= 2 ? 'Срочно' : d <= 7 ? 'Скоро' : 'Норм'}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="g12">
                {/* Сегодня */}
                <div className="p-card span4">
                    <div className="sec-head">
                        <div className="sec-title">Сегодня</div>
                        <Link href="/dashboard/timetable" className="sec-link">Полное →</Link>
                    </div>
                    {todayClasses.length === 0 ? (
                        <div className="t-meta" style={{ padding: '12px 0' }}>Нет занятий</div>
                    ) : (
                        todayClasses.slice(0, 4).map(t => {
                            const now = new Date().toTimeString().slice(0, 5)
                            const isNow = t.start_time <= now && (t.end_time ?? t.start_time) >= now
                            return (
                                <div key={t.id} className={`slot${isNow ? ' now' : ''}`}>
                                    <div className="slot-time">{t.start_time}</div>
                                    <div className="slot-body">
                                        <div className="slot-subj">{t.subject}</div>
                                        <div className="slot-sub">Занятие</div>
                                    </div>
                                    {t.room && <div className="slot-room">Ауд. {t.room}</div>}
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Recent Grades */}
                <div className="p-card span4">
                    <div className="sec-head">
                        <div className="sec-title">Последние оценки</div>
                        <Link href="/dashboard/grades" className="sec-link">Все →</Link>
                    </div>
                    {recentGrades.length === 0 ? (
                        <div className="t-meta" style={{ padding: '12px 0' }}>Пока нет оценок</div>
                    ) : (
                        recentGrades.map(g => (
                            <div key={g.id} className="row-item">
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div className="t-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {g.subject}
                                    </div>
                                    <div className="p-num t-meta" style={{ marginTop: 3 }}>
                                        {(g as any).created_at ? formatDayMonth((g as any).created_at) : g.semester}
                                    </div>
                                </div>
                                <div className="num-display" style={{ fontSize: 'var(--p-t-xl)', color: gradeColorVar(g.score) }}>
                                    {g.score}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Quick links + News */}
                <div className="span4" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div className="p-card">
                        <div className="sec-head"><div className="sec-title">Быстрые ссылки</div></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                            <Link href="/dashboard/materials" className="qtile">
                                <BookOpen />
                                <div className="qtile-label">Материалы</div>
                            </Link>
                            <Link href="/dashboard/analytics" className="qtile">
                                <BarChart2 />
                                <div className="qtile-label">Аналитика</div>
                            </Link>
                            <Link href="/dashboard/events" className="qtile">
                                <CalIcon />
                                <div className="qtile-label">События</div>
                            </Link>
                            <Link href="/dashboard/library" className="qtile">
                                <Library />
                                <div className="qtile-label">Библиотека</div>
                            </Link>
                        </div>
                    </div>
                    <div className="p-card">
                        <div className="sec-head"><div className="sec-title">Новости</div></div>
                        {STATIC_NEWS.slice(0, 2).map(n => (
                            <div key={n.id} className="row-item">
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div className="t-label">{n.title}</div>
                                    <div className="p-num t-meta" style={{ marginTop: 3 }}>{formatDayMonth(n.date)}</div>
                                </div>
                                <ArrowUpRight style={{ width: 14, height: 14, color: 'var(--p-fg4)', strokeWidth: 1.75, flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
