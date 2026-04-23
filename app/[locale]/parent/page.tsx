'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import PortalShell from '@/components/portal/PortalShell'
import { Send } from 'lucide-react'

type Child = {
    id: number
    name: string
    group: string
    avgGrade: number
    attendance: number
    grades: { subject: string; score: number; date: string }[]
    timetable: { subject: string; day: string; time: string; room?: string }[]
}

const mockChild: Child = {
    id: 1,
    name: 'Асель Касымова',
    group: 'ИС-21 · 2 курс · KTI Academy',
    avgGrade: 82,
    attendance: 95,
    grades: [
        { subject: 'Математика', score: 85, date: '15 апр' },
        { subject: 'Физика', score: 78, date: '14 апр' },
        { subject: 'Программирование', score: 90, date: '13 апр' },
        { subject: 'Английский язык', score: 82, date: '12 апр' },
        { subject: 'История Казахстана', score: 76, date: '10 апр' },
    ],
    timetable: [
        { subject: 'Математика', day: 'Пн', time: '09:00', room: '312' },
        { subject: 'Физика', day: 'Вт', time: '11:00', room: '214' },
        { subject: 'Программирование', day: 'Ср', time: '14:00', room: 'Лаб.2' },
        { subject: 'Английский язык', day: 'Чт', time: '10:00', room: '108' },
        { subject: 'История Казахстана', day: 'Пт', time: '13:00', room: '205' },
    ],
}

function gradeColorVar(score: number): string {
  if (score >= 85) return 'var(--p-success)'
  if (score >= 70) return 'var(--p-fg1)'
  return 'var(--p-amber)'
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('')
}

export default function ParentDashboard() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const [child] = useState<Child>(mockChild)
    const [showAllGrades, setShowAllGrades] = useState(false)
    const [message, setMessage] = useState('')

    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'parent') { router.push('/dashboard'); return }
    }, [user, effectiveRole, loading, router])

    if (loading || !user) {
        return (
            <PortalShell role="parent" title="Кабинет родителя">
                <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
            </PortalShell>
        )
    }
    if (effectiveRole && effectiveRole !== 'parent') return null

    const visible = showAllGrades ? child.grades : child.grades.slice(0, 3)
    const parentName = (user.user_metadata as any)?.full_name ?? 'Родитель'

    const sendMessage = () => {
        if (!message.trim()) return
        toast.success('Сообщение отправлено куратору')
        setMessage('')
    }

    return (
        <PortalShell role="parent" title="Кабинет родителя" userName={parentName} userSub="Родитель · ИС-21">
            {/* Child card */}
            <div className="p-card success" style={{ marginBottom: 18, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div
                        className="av"
                        style={{
                            width: 56, height: 56, fontSize: 'var(--p-t-md)',
                            background: 'rgba(134,229,182,0.1)',
                            border: '1px solid rgba(134,229,182,0.3)',
                            color: 'var(--p-role-parent)',
                        }}
                    >
                        {initials(child.name)}
                    </div>
                    <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                        <div className="t-h2">{child.name}</div>
                        <div className="p-num t-meta" style={{ marginTop: 6 }}>{child.group}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div className="stat-box">
                            <div className="stat-val" style={{ color: 'var(--p-success)' }}>
                                {child.avgGrade}<span style={{ color: 'var(--p-fg4)' }}>%</span>
                            </div>
                            <div className="stat-lbl">Ср. балл</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-val" style={{ color: 'var(--p-accent)' }}>
                                {child.attendance}<span style={{ color: 'var(--p-fg4)' }}>%</span>
                            </div>
                            <div className="stat-lbl">Посещ.</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-val">5</div>
                            <div className="stat-lbl">Предметов</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="g12">
                {/* Grades */}
                <div className="p-card span5">
                    <div className="sec-head">
                        <div className="sec-title">Оценки</div>
                        <button type="button" className="sec-link" onClick={() => setShowAllGrades(v => !v)}>
                            {showAllGrades ? 'Скрыть' : 'Показать все'}
                        </button>
                    </div>
                    <div>
                        {visible.map((g, i) => (
                            <div key={i} className="row-item">
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div className="t-label">{g.subject}</div>
                                    <div className="p-num t-meta" style={{ marginTop: 3 }}>{g.date}</div>
                                </div>
                                <div className="num-display" style={{ fontSize: 'var(--p-t-xl)', color: gradeColorVar(g.score) }}>
                                    {g.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timetable */}
                <div className="p-card span4">
                    <div className="sec-head"><div className="sec-title">Расписание</div></div>
                    {child.timetable.map((t, i) => (
                        <div key={i} className="slot">
                            <div className="slot-time">{t.day} {t.time}</div>
                            <div className="slot-body">
                                <div className="slot-subj">{t.subject}</div>
                            </div>
                            {t.room && <div className="slot-room">{t.room}</div>}
                        </div>
                    ))}
                </div>

                {/* Curator message */}
                <div className="p-card span3">
                    <div className="sec-head"><div className="sec-title">Куратор</div></div>
                    <div
                        style={{
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--p-border)',
                            marginBottom: 14,
                        }}
                    >
                        <div className="t-label">Жанар Мұратқызы</div>
                        <div className="t-meta" style={{ marginTop: 4 }}>Куратор · ИС-21</div>
                    </div>
                    <textarea
                        className="p-inp"
                        rows={4}
                        placeholder="Ваше сообщение…"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{ resize: 'none' }}
                    />
                    <button
                        type="button"
                        className="p-btn p-btn-cyan"
                        onClick={sendMessage}
                        style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                    >
                        <Send /> Отправить
                    </button>
                </div>
            </div>
        </PortalShell>
    )
}
