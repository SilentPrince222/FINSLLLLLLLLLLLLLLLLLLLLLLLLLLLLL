'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import { SUBJECTS, SEMESTER } from '@/lib/constants'

export default function TeacherProfilePage() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'teacher') { router.push('/dashboard'); return }
    }, [loading, user, effectiveRole, router])

    if (loading || !user) return <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
    if (effectiveRole && effectiveRole !== 'teacher') return null

    const meta = user.user_metadata as { full_name?: string; email?: string } | null
    const name = meta?.full_name ?? user.email ?? 'Преподаватель'
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]?.toUpperCase() ?? '').join('')

    return (
        <>
            <div className="g12">
                <div className="p-card span4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 32 }}>
                    <div
                        className="av"
                        style={{
                            width: 72, height: 72, fontSize: 'var(--p-t-xl)',
                            background: 'rgba(199,168,255,0.1)',
                            border: '1px solid rgba(199,168,255,0.3)',
                            color: 'var(--p-role-teacher)',
                        }}
                    >
                        {initials}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div className="t-h2">{name}</div>
                        <div className="t-meta" style={{ marginTop: 6 }}>Преподаватель · КТИ</div>
                        <div className="t-meta" style={{ marginTop: 4 }}>{user.email}</div>
                    </div>
                    <span className="pill magenta">Активен</span>
                </div>

                <div className="span8" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div className="p-card">
                        <div className="sec-head"><div className="sec-title">Информация</div></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="row-item">
                                <span className="t-meta">Кафедра</span>
                                <span className="t-label">Информационные системы</span>
                            </div>
                            <div className="row-item">
                                <span className="t-meta">Семестр</span>
                                <span className="t-label">{SEMESTER}</span>
                            </div>
                            <div className="row-item">
                                <span className="t-meta">Предметов</span>
                                <span className="t-label">{SUBJECTS.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-card">
                        <div className="sec-head"><div className="sec-title">Предметы</div></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {SUBJECTS.map(s => (
                                <div key={s} className="slot" style={{ marginBottom: 0 }}>
                                    <div className="slot-body"><div className="slot-subj">{s}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
