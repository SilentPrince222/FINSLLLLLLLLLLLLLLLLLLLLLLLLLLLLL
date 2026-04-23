'use client'

import { useState } from 'react'

type GradeData = { subject: string; score: number; date: string }

const mockGrades: GradeData[] = [
    { subject: 'Математика', score: 85, date: '2026-01' },
    { subject: 'Математика', score: 78, date: '2026-02' },
    { subject: 'Математика', score: 92, date: '2026-03' },
    { subject: 'Математика', score: 88, date: '2026-04' },
    { subject: 'Физика', score: 72, date: '2026-01' },
    { subject: 'Физика', score: 80, date: '2026-02' },
    { subject: 'Физика', score: 85, date: '2026-03' },
    { subject: 'Физика', score: 78, date: '2026-04' },
    { subject: 'Программирование', score: 90, date: '2026-01' },
    { subject: 'Программирование', score: 88, date: '2026-02' },
    { subject: 'Программирование', score: 95, date: '2026-03' },
    { subject: 'Программирование', score: 92, date: '2026-04' },
    { subject: 'Английский', score: 82, date: '2026-01' },
    { subject: 'Английский', score: 85, date: '2026-02' },
    { subject: 'Английский', score: 88, date: '2026-03' },
    { subject: 'Английский', score: 84, date: '2026-04' },
]

const mockAttendance = [
    { month: 'Сен', percent: 95 }, { month: 'Окт', percent: 92 }, { month: 'Ноя', percent: 88 },
    { month: 'Дек', percent: 85 }, { month: 'Янв', percent: 90 }, { month: 'Фев', percent: 93 },
    { month: 'Мар', percent: 96 }, { month: 'Апр', percent: 94 },
]

const subjects = ['Математика', 'Физика', 'Программирование', 'Английский']

const subjectAccents: Record<string, string> = {
    'Математика': 'var(--p-accent)',
    'Физика': 'var(--p-role-teacher)',
    'Программирование': 'var(--p-success)',
    'Английский': 'var(--p-amber)',
}

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('4')

    const subjectAverages = subjects.map(s => {
        const grades = mockGrades.filter(g => g.subject === s)
        return { label: s, value: Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) }
    })

    const totalAvg = Math.round(subjectAverages.reduce((sum, s) => sum + s.value, 0) / subjectAverages.length)
    const attendanceAvg = Math.round(mockAttendance.reduce((s, a) => s + a.percent, 0) / mockAttendance.length)
    const maxSubj = Math.max(...subjectAverages.map(s => s.value))
    const maxAtt = Math.max(...mockAttendance.map(a => a.percent))

    return (
        <>
            <div className="sec-head">
                <div className="sec-title">Аналитика</div>
                <select className="p-inp" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
                    <option value="4">4 месяца</option>
                    <option value="6">6 месяцев</option>
                    <option value="8">Год</option>
                </select>
            </div>

            <div className="g4" style={{ marginBottom: 18 }}>
                <div className="p-card cyan">
                    <div className="clabel">Средний балл</div>
                    <div className="cvalue">{totalAvg}<span style={{ color: 'var(--p-fg4)' }}>%</span></div>
                </div>
                <div className="p-card">
                    <div className="clabel">Всего оценок</div>
                    <div className="cvalue">{mockGrades.length}</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Посещаемость</div>
                    <div className="cvalue">{attendanceAvg}<span style={{ color: 'var(--p-fg4)' }}>%</span></div>
                </div>
                <div className="p-card">
                    <div className="clabel">Предметов</div>
                    <div className="cvalue">{subjects.length}</div>
                </div>
            </div>

            <div className="g12" style={{ marginBottom: 18 }}>
                <div className="p-card span6">
                    <div className="sec-head"><div className="sec-title">Оценки по предметам</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {subjectAverages.map(s => (
                            <div key={s.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span className="t-label">{s.label}</span>
                                    <span className="p-num t-label" style={{ color: subjectAccents[s.label] }}>{s.value}%</span>
                                </div>
                                <div className="bar-track" style={{ height: 6 }}>
                                    <div className="bar-fill" style={{ width: `${(s.value / maxSubj) * 100}%`, background: subjectAccents[s.label] }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-card span6">
                    <div className="sec-head"><div className="sec-title">Посещаемость по месяцам</div></div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160 }}>
                        {mockAttendance.map(m => (
                            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${(m.percent / maxAtt) * 100}%`,
                                        background: 'var(--p-accent)',
                                        borderRadius: 4,
                                        opacity: 0.85,
                                    }}
                                />
                                <span className="t-meta">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="g2">
                <div className="p-card success">
                    <div className="sec-head"><div className="sec-title">Сильные стороны</div></div>
                    <div className="row-item">
                        <span className="t-label">Программирование — ваш лучший предмет</span>
                        <span className="pill success">{subjectAverages.find(s => s.label === 'Программирование')?.value}%</span>
                    </div>
                    <div className="row-item"><span className="t-label">Стабильная посещаемость</span></div>
                    <div className="row-item"><span className="t-label">Хороший прогресс в математике</span></div>
                </div>
                <div className="p-card amber">
                    <div className="sec-head"><div className="sec-title">Рекомендации</div></div>
                    <div className="row-item"><span className="t-label">Уделить больше внимания физике</span></div>
                    <div className="row-item"><span className="t-label">Стабильнее посещать занятия</span></div>
                    <div className="row-item"><span className="t-label">Подтянуть английский язык</span></div>
                </div>
            </div>
        </>
    )
}
