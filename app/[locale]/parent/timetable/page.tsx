'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'

const TIMETABLE = [
    { subject: 'Математика', day: 'Пн', time: '09:00', room: '312' },
    { subject: 'Физика', day: 'Вт', time: '11:00', room: '214' },
    { subject: 'Программирование', day: 'Ср', time: '14:00', room: 'Лаб.2' },
    { subject: 'Английский язык', day: 'Чт', time: '10:00', room: '108' },
    { subject: 'История Казахстана', day: 'Пт', time: '13:00', room: '205' },
]

export default function ParentTimetablePage() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'parent') { router.push('/dashboard'); return }
    }, [loading, user, effectiveRole, router])

    if (loading || !user) return <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
    if (effectiveRole && effectiveRole !== 'parent') return null

    return (
        <>
            <div className="p-card">
                <div className="sec-head" style={{ marginBottom: 18 }}>
                    <div className="sec-title">Расписание — Асель Касымова</div>
                    <span className="pill success">ИС-21</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {TIMETABLE.map((t, i) => (
                        <div key={i} className="slot">
                            <div className="slot-time">{t.day} {t.time}</div>
                            <div className="slot-body">
                                <div className="slot-subj">{t.subject}</div>
                            </div>
                            <div className="slot-room">{t.room}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
