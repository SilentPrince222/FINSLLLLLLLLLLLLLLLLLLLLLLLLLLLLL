'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import { useTimetable } from '@/hooks/useTimetable'

export default function TeacherTimetablePage() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'teacher') { router.push('/dashboard'); return }
    }, [loading, user, effectiveRole, router])

    const { entries: timetable, loading: ttLoading } = useTimetable()

    if (loading || !user) return <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
    if (effectiveRole && effectiveRole !== 'teacher') return null

    return (
        <>
            <div className="p-card" style={{ marginBottom: 18 }}>
                <div className="sec-head">
                    <div className="sec-title">Расписание занятий</div>
                </div>
                {ttLoading ? (
                    <div className="t-muted" style={{ padding: 36, textAlign: 'center' }}>Загрузка…</div>
                ) : timetable.length === 0 ? (
                    <div className="t-muted" style={{ padding: 36, textAlign: 'center' }}>
                        Расписание не найдено
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {timetable.map(slot => (
                            <div key={slot.id} className="slot">
                                <div className="slot-time">{slot.day} {slot.start_time}</div>
                                <div className="slot-body">
                                    <div className="slot-subj">{slot.subject}</div>
                                </div>
                                {slot.room && <div className="slot-room">{slot.room}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
