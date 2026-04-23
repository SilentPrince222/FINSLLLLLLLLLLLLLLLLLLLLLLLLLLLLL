'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { SUBJECTS, SEMESTER } from '@/lib/constants'
import { BrainCircuit, X, TrendingUp, TrendingDown } from 'lucide-react'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Grade = Database['public']['Tables']['grades']['Row']

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

function scoreColor(score: number | null): string {
    if (score === null) return 'var(--p-fg4)'
    if (score >= 85) return 'var(--p-success)'
    if (score >= 70) return 'var(--p-fg1)'
    return 'var(--p-danger)'
}

function attendanceColor(pct: number): string {
    if (pct >= 85) return 'var(--p-success)'
    if (pct >= 70) return 'var(--p-amber)'
    return 'var(--p-danger)'
}

function initials(name: string | null | undefined): string {
    if (!name) return '??'
    return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('')
}

export default function TeacherGradesPage() {
    const router = useRouter()
    const locale = useLocale()
    const { user, role, loading } = useAuth()
    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    const [students, setStudents] = useState<Profile[]>([])
    const [grades, setGrades] = useState<Grade[]>([])
    const [loadingData, setLoadingData] = useState(true)

    const [aiStudent, setAiStudent] = useState<Profile | null>(null)
    const [aiResult, setAiResult] = useState<AIResult | null>(null)
    const [aiLoading, setAiLoading] = useState(false)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'teacher') { router.push('/dashboard'); return }
    }, [loading, user, effectiveRole, router])

    useEffect(() => {
        if (!user || effectiveRole !== 'teacher') return
        let cancelled = false
        ;(async () => {
            setLoadingData(true)
            const [studentsRes, gradesRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('role', 'student').order('full_name'),
                supabase.from('grades').select('*').eq('semester', SEMESTER).order('created_at', { ascending: false }),
            ])
            if (cancelled) return
            if (studentsRes.error) toast.error('Не удалось загрузить студентов')
            else setStudents(studentsRes.data ?? [])
            if (!gradesRes.error) setGrades(gradesRes.data ?? [])
            setLoadingData(false)
        })()
        return () => { cancelled = true }
    }, [user, effectiveRole])

    if (loading || !user) return <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
    if (effectiveRole && effectiveRole !== 'teacher') return null

    // Build grade lookup: studentId → subject → score (first in desc order = latest)
    const gradeMap = new Map<string, Map<string, number>>()
    for (const g of grades) {
        if (!gradeMap.has(g.student_id)) gradeMap.set(g.student_id, new Map())
        const sMap = gradeMap.get(g.student_id)!
        if (!sMap.has(g.subject)) sMap.set(g.subject, g.score)
    }

    async function runAI(student: Profile) {
        const subjMap = gradeMap.get(student.id)
        if (!subjMap || subjMap.size === 0) {
            toast.error('У студента нет оценок для анализа')
            return
        }

        setAiStudent(student)
        setAiResult(null)
        setAiLoading(true)

        const gradesPayload = Array.from(subjMap.entries()).map(([subject, score]) => ({ subject, score }))

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
            setAiStudent(null)
        } finally {
            setAiLoading(false)
        }
    }

    // Summary stats
    const totalStudents = students.length
    const allAvgs = students.map(s => {
        const sm = gradeMap.get(s.id)
        if (!sm || sm.size === 0) return null
        const vals = Array.from(sm.values())
        return vals.reduce((a, b) => a + b, 0) / vals.length
    }).filter(Boolean) as number[]
    const classAvg = allAvgs.length ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) : null
    const attAvg = students.length
        ? Math.round(students.reduce((s, p) => s + (p.attendance_rate ?? 0), 0) / students.length)
        : null

    return (
        <>
            {/* Summary cards */}
            <div className="g4" style={{ marginBottom: 18 }}>
                <div className="p-card magenta">
                    <div className="clabel">Студентов</div>
                    <div className="cvalue">{totalStudents}</div>
                    <div className="cdelta">В журнале</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Средний балл группы</div>
                    <div className="cvalue" style={{ color: classAvg ? scoreColor(classAvg) : undefined }}>
                        {classAvg ?? '—'}
                    </div>
                    <div className="cdelta">{SEMESTER}</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Ср. посещаемость</div>
                    <div className="cvalue" style={{ color: attAvg ? attendanceColor(attAvg) : undefined }}>
                        {attAvg ?? '—'}<span style={{ color: 'var(--p-fg4)' }}>%</span>
                    </div>
                    <div className="cdelta">По группе</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Предметов</div>
                    <div className="cvalue">{SUBJECTS.length}</div>
                    <div className="cdelta">В семестре</div>
                </div>
            </div>

            {/* AI result panel */}
            {aiStudent && (
                <div
                    className="p-card"
                    style={{ marginBottom: 18, border: '1px solid rgba(199,168,255,0.4)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                            <div className="sec-title" style={{ color: 'var(--p-role-teacher)' }}>
                                ИИ-анализ студента
                            </div>
                            <div className="t-meta" style={{ marginTop: 3 }}>
                                {aiStudent.full_name ?? aiStudent.email} · Gemini · {SEMESTER}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="p-btn p-btn-ghost p-btn-sm p-btn-icon"
                            onClick={() => { setAiStudent(null); setAiResult(null) }}
                        >
                            <X />
                        </button>
                    </div>

                    {aiLoading && (
                        <div style={{ padding: '24px 0', textAlign: 'center' }}>
                            <div className="t-muted" style={{ marginBottom: 8 }}>Gemini анализирует успеваемость…</div>
                            <div className="bar-track" style={{ width: 200, margin: '0 auto' }}>
                                <div className="bar-fill m" style={{ width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            </div>
                        </div>
                    )}

                    {!aiLoading && aiResult && (
                        <div className="g12">
                            {/* Score + level */}
                            <div className="span3">
                                <div
                                    className="p-card"
                                    style={{
                                        textAlign: 'center', padding: '20px 12px',
                                        background: `${LEVEL_COLOR[aiResult.level]}14`,
                                        border: `1px solid ${LEVEL_COLOR[aiResult.level]}40`,
                                    }}
                                >
                                    <div
                                        className="cvalue"
                                        style={{ color: LEVEL_COLOR[aiResult.level], fontSize: 'var(--p-t-3xl)' }}
                                    >
                                        {aiResult.average.toFixed(1)}
                                    </div>
                                    <div className="clabel" style={{ marginTop: 4 }}>средний балл</div>
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

                            {/* Summary + subjects */}
                            <div className="span5">
                                <p className="t-label" style={{ lineHeight: 1.65, marginBottom: 14 }}>
                                    {aiResult.summary}
                                </p>
                                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                    {aiResult.strongSubjects.length > 0 && (
                                        <div>
                                            <div className="t-meta" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <TrendingUp style={{ width: 12, height: 12, color: 'var(--p-success)' }} />
                                                Сильные предметы
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
                                                <TrendingDown style={{ width: 12, height: 12, color: 'var(--p-danger)' }} />
                                                Нуждается в помощи
                                            </div>
                                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                {aiResult.weakSubjects.map(s => (
                                                    <span key={s} className="pill danger">{s}</span>
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

            {/* Grades + attendance table */}
            <div className="p-card">
                <div className="sec-head" style={{ marginBottom: 18 }}>
                    <div className="sec-title">Успеваемость и посещаемость</div>
                    <span className="pill magenta">Семестр {SEMESTER}</span>
                </div>

                {loadingData ? (
                    <div className="t-muted" style={{ padding: 36, textAlign: 'center' }}>Загрузка…</div>
                ) : students.length === 0 ? (
                    <div className="t-muted" style={{ padding: 36, textAlign: 'center' }}>
                        Студентов нет. Запустите `npm run seed`.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', margin: '0 -14px' }}>
                        <table className="p-tbl">
                            <thead>
                                <tr>
                                    <th style={{ minWidth: 180 }}>Студент</th>
                                    <th>Группа</th>
                                    <th>Посещ.</th>
                                    {SUBJECTS.map(s => (
                                        <th key={s} style={{ minWidth: 80, whiteSpace: 'nowrap' }}>{s}</th>
                                    ))}
                                    <th>Ср. балл</th>
                                    <th>ИИ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => {
                                    const subjMap = gradeMap.get(s.id)
                                    const scores = SUBJECTS.map(subj => subjMap?.get(subj) ?? null)
                                    const validScores = scores.filter(v => v !== null) as number[]
                                    const avg = validScores.length
                                        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                                        : null
                                    const att = s.attendance_rate ?? 0
                                    const isSelected = aiStudent?.id === s.id

                                    return (
                                        <tr
                                            key={s.id}
                                            style={isSelected ? { background: 'rgba(199,168,255,0.06)' } : undefined}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="av" style={{ width: 26, height: 26, flexShrink: 0 }}>
                                                        {initials(s.full_name)}
                                                    </div>
                                                    <span style={{ fontWeight: 500, color: 'var(--p-fg1)', whiteSpace: 'nowrap' }}>
                                                        {s.full_name ?? s.email}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="pill">{s.group_name ?? '—'}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span className="p-num" style={{ color: attendanceColor(att), minWidth: 30 }}>
                                                        {att}%
                                                    </span>
                                                    <div className="bar-track" style={{ width: 50, marginTop: 0 }}>
                                                        <div
                                                            className="bar-fill"
                                                            style={{ width: `${att}%`, background: attendanceColor(att) }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            {scores.map((score, i) => (
                                                <td key={SUBJECTS[i]} style={{ textAlign: 'center' }}>
                                                    {score !== null
                                                        ? <span className="p-num" style={{ color: scoreColor(score) }}>{score}</span>
                                                        : <span className="t-muted" style={{ fontSize: 'var(--p-t-sm)' }}>—</span>
                                                    }
                                                </td>
                                            ))}
                                            <td style={{ textAlign: 'center' }}>
                                                {avg !== null
                                                    ? <span className="p-num" style={{ color: scoreColor(avg), fontWeight: 700 }}>{avg}</span>
                                                    : <span className="t-muted" style={{ fontSize: 'var(--p-t-sm)' }}>—</span>
                                                }
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={`p-btn p-btn-sm ${isSelected ? 'p-btn-cyan' : 'p-btn-ghost'}`}
                                                    onClick={() => runAI(s)}
                                                    disabled={aiLoading}
                                                    title="ИИ-анализ студента"
                                                    style={{ gap: 5 }}
                                                >
                                                    <BrainCircuit style={{ width: 14, height: 14 }} />
                                                    {isSelected ? 'Выбран' : 'Анализ'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}
