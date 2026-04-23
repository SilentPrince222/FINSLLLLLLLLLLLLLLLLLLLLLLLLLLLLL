'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import { Bell } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Новое расписание', body: 'Расписание на следующую неделю обновлено', time: '10 мин назад', unread: true },
    { id: 2, title: 'Собрание кафедры', body: 'Собрание состоится в пятницу в 14:00 в ауд. 301', time: '2 ч назад', unread: true },
    { id: 3, title: 'Загрузка журнала', body: 'Не забудьте выставить оценки до конца недели', time: 'вчера', unread: false },
]

export default function TeacherNotificationsPage() {
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

    return (
        <>
            <div className="p-card">
                <div className="sec-head" style={{ marginBottom: 18 }}>
                    <div className="sec-title">Уведомления</div>
                    <span className="pill magenta">{MOCK_NOTIFICATIONS.filter(n => n.unread).length} новых</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {MOCK_NOTIFICATIONS.map(n => (
                        <div
                            key={n.id}
                            className="row-item"
                            style={{ opacity: n.unread ? 1 : 0.6 }}
                        >
                            <div
                                style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'rgba(199,168,255,0.1)',
                                    border: '1px solid rgba(199,168,255,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, color: 'var(--p-role-teacher)',
                                }}
                            >
                                <Bell style={{ width: 16, height: 16 }} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="t-label" style={{ fontWeight: n.unread ? 600 : 400 }}>{n.title}</div>
                                <div className="t-meta" style={{ marginTop: 3 }}>{n.body}</div>
                            </div>
                            <div className="p-num t-meta" style={{ flexShrink: 0 }}>{n.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
