'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import { BrainCircuit, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'

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
    { subject: 'Ағылшын тілі', score: 82, date: '2026-01' },
    { subject: 'Ағылшын тілі', score: 85, date: '2026-02' },
    { subject: 'Ағылшын тілі', score: 88, date: '2026-03' },
    { subject: 'Ағылшын тілі', score: 84, date: '2026-04' },
    { subject: 'История', score: 70, date: '2026-01' },
    { subject: 'История', score: 74, date: '2026-02' },
    { subject: 'История', score: 77, date: '2026-03' },
    { subject: 'История', score: 73, date: '2026-04' },
]

const mockAttendance = [
    { month: 'Сен', percent: 95 }, { month: 'Окт', percent: 92 }, { month: 'Ноя', percent: 88 },
    { month: 'Дек', percent: 85 }, { month: 'Янв', percent: 90 }, { month: 'Фев', percent: 93 },
    { month: 'Мар', percent: 96 }, { month: 'Апр', percent: 94 },
]

const subjects = ['Математика', 'Физика', 'Программирование', 'Ағылшын тілі', 'История']

const subjectAccents: Record<string, string> = {
    'Математика': 'var(--p-accent)',
    'Физика': 'var(--p-role-teacher)',
    'Программирование': 'var(--p-success)',
    'Ағылшын тілі': 'var(--p-amber)',
    'История': 'var(--p-danger)',
}

interface AIResult {
    average: number
    level: string
    weakSubjects: string[]
    strongSubjects: string[]
    summary: string
    recommendations: string[]
}

const LEVEL_LABEL: Record<string, string> = {
    'Excellent': 'Отлично',
    'Good': 'Хорошо',
    'Average': 'Средне',
    'Below Average': 'Ниже среднего',
}

const LEVEL_COLOR: Record<string, string> = {
    'Excellent': 'var(--p-success)',
    'Good': 'var(--p-accent)',
    'Average': 'var(--p-amber)',
    'Below Average': 'var(--p-danger)',
}

export default function AnalyticsPage() {
    const locale = useLocale()
    const [period, setPeriod] = useState('4')
    const [aiResult, setAiResult] = useState<AIResult | null>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const subjectAverages = subjects.map(s => {
        const grades = mockGrades.filter(g => g.subject === s)
        return { label: s, value: Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) }
    })

    const totalAvg = Math.round(subjectAverages.reduce((sum, s) => sum + s.value, 0) / subjectAverages.length)
    const attendanceAvg = Math.round(mockAttendance.reduce((s, a) => s + a.percent, 0) / mockAttendance.length)
    const maxSubj = Math.max(...subjectAverages.map(s => s.value))
    const maxAtt = Math.max(...mockAttendance.map(a => a.percent))

    async function runAI() {
        setAiLoading(true)
        setAiResult(null)
        const gradesPayload = subjectAverages.map(s => ({ subject: s.label, score: s.value }))
        try {
            const res = await fetch(`/${locale}/api/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grades: gradesPayload }),
            })
            if (!res.ok) throw new Error('AI error')
            setAiResult(await res.json())
        } catch {
            toast.error('ИИ временно недоступен')
        } finally {
            setAiLoading(false)
        }
    }

    return (
        <>
            <div className="sec-head">
                <div className="sec-title">Аналитика успеваемости</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select className="p-inp" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="4">4 месяца</option>
                        <option value="6">6 месяцев</option>
                        <option value="8">Год</option>
                    </select>
                    <button
                        type="button"
                        className="p-btn p-btn-cyan"
                        onClick={runAI}
                        disabled={aiLoading}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <BrainCircuit style={{ width: 15, height: 15 }} />
                        {aiLoading ? 'Анализирую…' : 'ИИ-анализ'}
                    </button>
                </div>
            </div>

            {/* Summary cards */}
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

            {/* Charts */}
            <div className="g12" style={{ marginBottom: 18 }}>
                <div className="p-card span6">
                    <div className="sec-head"><div className="sec-title">Оценки по предметам</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {subjectAverages.map(s => (
                            <div key={s.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span className="t-label">{s.label}</span>
                                    <span className="p-num t-label" style={{ color: subjectAccents[s.label] }}>{s.value}</span>
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

            {/* AI Result block */}
            {(aiLoading || aiResult) && (
                <div
                    className="p-card"
                    style={{ marginBottom: 18, border: '1px solid rgba(110,231,245,0.3)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <Sparkles style={{ width: 16, height: 16, color: 'var(--p-accent)' }} />
                        <div className="sec-title" style={{ color: 'var(--p-accent)' }}>Анализ от Gemini AI</div>
                    </div>

                    {aiLoading && (
                        <div style={{ padding: '20px 0', textAlign: 'center' }}>
                            <div className="t-muted" style={{ marginBottom: 10 }}>Gemini анализирует вашу успеваемость…</div>
                            <div className="bar-track" style={{ width: 220, margin: '0 auto' }}>
                                <div className="bar-fill m" style={{ width: '55%' }} />
                            </div>
                        </div>
                    )}

                    {!aiLoading && aiResult && (
                        <div className="g12">
                            {/* Score block */}
                            <div className="span3">
                                <div
                                    className="p-card"
                                    style={{
                                        textAlign: 'center', padding: '20px 12px',
                                        background: `${LEVEL_COLOR[aiResult.level]}12`,
                                        border: `1px solid ${LEVEL_COLOR[aiResult.level]}35`,
                                    }}
                                >
                                    <div
                                        className="cvalue"
                                        style={{ color: LEVEL_COLOR[aiResult.level], fontSize: 'var(--p-t-3xl)' }}
                                    >
                                        {aiResult.average.toFixed(1)}
                                    </div>
                                    <div className="clabel" style={{ marginTop: 4 }}>GPA (100-балл.)</div>
                                    <div
                                        className="pill"
                                        style={{
                                            marginTop: 10, display: 'inline-block',
                                            color: LEVEL_COLOR[aiResult.level],
                                            background: `${LEVEL_COLOR[aiResult.level]}18`,
                                            border: `1px solid ${LEVEL_COLOR[aiResult.level]}40`,
                                        }}
                                    >
                                        {LEVEL_LABEL[aiResult.level] ?? aiResult.level}
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="span5">
                                <p className="t-label" style={{ lineHeight: 1.7, marginBottom: 16 }}>
                                    {aiResult.summary}
                                </p>
                                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                    {aiResult.strongSubjects.length > 0 && (
                                        <div>
                                            <div className="t-meta" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <TrendingUp style={{ width: 12, height: 12, color: 'var(--p-success)' }} />
                                                Сильные стороны
                                            </div>
                                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                {aiResult.strongSubjects.map(s => (
                                                    <span key={s} className="pill success">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {aiResult.weakSubjects.length > 0 && (
                                        <div>
                                            <div className="t-meta" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <TrendingDown style={{ width: 12, height: 12, color: 'var(--p-amber)' }} />
                                                Нужно улучшить
                                            </div>
                                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                {aiResult.weakSubjects.map(s => (
                                                    <span key={s} className="pill amber">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="span4">
                                <div className="t-meta" style={{ marginBottom: 8 }}>Рекомендации</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {aiResult.recommendations.map((r, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 8,
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid var(--p-border)',
                                                fontSize: 'var(--p-t-sm)',
                                                color: 'var(--p-fg2)',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {r}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Static insights (shown when no AI result yet) */}
            {!aiResult && !aiLoading && (
                <div className="g2">
                    <div className="p-card success">
                        <div className="sec-head"><div className="sec-title">Сильные стороны</div></div>
                        <div className="row-item">
                            <span className="t-label">Программирование — лучший предмет</span>
                            <span className="pill success">{subjectAverages.find(s => s.label === 'Программирование')?.value}</span>
                        </div>
                        <div className="row-item"><span className="t-label">Стабильная посещаемость</span></div>
                        <div className="row-item"><span className="t-label">Хороший прогресс в математике</span></div>
                    </div>
                    <div className="p-card amber">
                        <div className="sec-head"><div className="sec-title">Рекомендации</div></div>
                        <div className="row-item"><span className="t-label">Уделить больше внимания истории</span></div>
                        <div className="row-item"><span className="t-label">Нажмите «ИИ-анализ» для персональных рекомендаций</span></div>
                    </div>
                </div>
            )}
        </>
    )
}
