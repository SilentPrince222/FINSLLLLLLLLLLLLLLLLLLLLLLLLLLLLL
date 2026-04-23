'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import { TrendingUp, Users, BookOpen, CalendarCheck } from 'lucide-react'

const STATS = [
    { label: 'Студентов всего', value: '247', delta: '+12 за семестр', Icon: Users, color: 'var(--p-accent)' },
    { label: 'Средний балл', value: '76', delta: '+2.4 к прошлому', Icon: TrendingUp, color: 'var(--p-success)' },
    { label: 'Предметов', value: '18', delta: '6 кафедр', Icon: BookOpen, color: 'var(--p-role-teacher)' },
    { label: 'Посещаемость', value: '89%', delta: 'По колледжу', Icon: CalendarCheck, color: 'var(--p-role-parent)' },
]

export default function AdminStatsPage() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'admin') { router.push('/dashboard'); return }
    }, [loading, user, effectiveRole, router])

    if (loading || !user) return <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
    if (effectiveRole && effectiveRole !== 'admin') return null

    return (
        <>
            <div className="g4" style={{ marginBottom: 18 }}>
                {STATS.map(s => {
                    const Icon = s.Icon
                    return (
                        <div key={s.label} className="p-card">
                            <div className="clabel">{s.label}</div>
                            <div className="cvalue" style={{ color: s.color }}>{s.value}</div>
                            <div className="cdelta">{s.delta}</div>
                        </div>
                    )
                })}
            </div>

            <div className="p-card">
                <div className="sec-head" style={{ marginBottom: 18 }}>
                    <div className="sec-title">Успеваемость по специальностям</div>
                </div>
                {['ИС-22 · 1 курс', 'ИС-21 · 2 курс', 'ПО-22 · 1 курс', 'ПО-21 · 2 курс'].map((group, i) => {
                    const score = [78, 82, 74, 85][i]
                    const color = score >= 80 ? 'var(--p-success)' : score >= 70 ? 'var(--p-fg1)' : 'var(--p-amber)'
                    return (
                        <div key={group} className="row-item">
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="t-label">{group}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="p-num" style={{ color, minWidth: 32 }}>{score}</span>
                                <div className="bar-track" style={{ width: 120, marginTop: 0 }}>
                                    <div className="bar-fill" style={{ width: `${score}%`, background: color }} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
