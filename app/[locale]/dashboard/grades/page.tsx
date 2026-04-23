'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getGrades, createGrade, deleteGrade } from '@/lib/database'
import { Trash2, Plus, BookOpen, BarChart2, Target } from 'lucide-react'
import type { Database } from '@/types/database'

type Grade = Database['public']['Tables']['grades']['Row']

function gradeColorVar(score: number): string {
    if (score >= 85) return 'var(--p-success)'
    if (score >= 70) return 'var(--p-fg1)'
    return 'var(--p-amber)'
}

export default function GradesPage() {
    const { user } = useAuth()
    const [grades, setGrades] = useState<Grade[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [subject, setSubject] = useState('')
    const [score, setScore] = useState('')
    const [semester, setSemester] = useState('Spring 2026')
    const [saving, setSaving] = useState(false)

    const loadGrades = useCallback(async () => {
        if (!user) return
        setLoading(true)
        setError(null)
        try {
            const { data, error: dbError } = await getGrades(user.id)
            if (dbError) throw dbError
            if (data) setGrades(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось загрузить')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => { if (user) loadGrades() }, [user, loadGrades])

    async function handleAddGrade(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const previousGrades = grades
        try {
            const { data, error: createError } = await createGrade({
                student_id: user!.id,
                subject,
                score: parseInt(score),
                semester,
            })
            if (createError) throw createError
            if (data) {
                setGrades(prev => [data as Grade, ...prev])
                setSubject(''); setScore('')
            }
        } catch {
            setGrades(previousGrades)
        } finally {
            setSaving(false)
        }
    }

    async function handleDeleteGrade(id: number) {
        const previousGrades = grades
        setGrades(grades.filter(g => g.id !== id))
        try {
            const { error: deleteError } = await deleteGrade(id)
            if (deleteError) throw deleteError
        } catch {
            setGrades(previousGrades)
        }
    }

    const average = grades.length
        ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length)
        : 0

    return (
        <>
            <div className="g4" style={{ marginBottom: 18 }}>
                <div className="p-card cyan">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <BookOpen style={{ width: 16, height: 16, color: 'var(--p-accent)', strokeWidth: 1.75 }} />
                        <div className="clabel">Всего оценок</div>
                    </div>
                    <div className="cvalue">{grades.length}</div>
                </div>
                <div className="p-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <Target style={{ width: 16, height: 16, color: 'var(--p-fg3)', strokeWidth: 1.75 }} />
                        <div className="clabel">Средний балл</div>
                    </div>
                    <div className="cvalue" style={{ color: gradeColorVar(average) }}>{average || '—'}</div>
                </div>
                <div className="p-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <BarChart2 style={{ width: 16, height: 16, color: 'var(--p-fg3)', strokeWidth: 1.75 }} />
                        <div className="clabel">Лучший балл</div>
                    </div>
                    <div className="cvalue">{grades.length ? Math.max(...grades.map(g => g.score)) : '—'}</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Текущий семестр</div>
                    <div className="t-h3" style={{ marginTop: 10 }}>{semester}</div>
                </div>
            </div>

            <div className="p-card" style={{ marginBottom: 18 }}>
                <div className="sec-head"><div className="sec-title">Новая оценка</div></div>
                <form onSubmit={handleAddGrade}>
                    <div className="g12" style={{ gap: 12 }}>
                        <div className="p-field span4" style={{ marginBottom: 0 }}>
                            <label>Предмет</label>
                            <input type="text" className="p-inp" value={subject} onChange={e => setSubject(e.target.value)} required />
                        </div>
                        <div className="p-field span2" style={{ marginBottom: 0 }}>
                            <label>Балл</label>
                            <input type="number" min={0} max={100} className="p-inp" value={score} onChange={e => setScore(e.target.value)} required />
                        </div>
                        <div className="p-field span3" style={{ marginBottom: 0 }}>
                            <label>Семестр</label>
                            <select className="p-inp" value={semester} onChange={e => setSemester(e.target.value)}>
                                <option>Spring 2026</option>
                                <option>Fall 2026</option>
                            </select>
                        </div>
                        <div className="span3" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="p-btn p-btn-cyan" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                                <Plus /> {saving ? 'Добавление…' : 'Добавить'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="p-card t-muted" style={{ textAlign: 'center', padding: 36 }}>Загрузка…</div>
            ) : error ? (
                <div className="p-card" style={{ textAlign: 'center', padding: 36 }}>
                    <div style={{ color: 'var(--p-danger)' }} className="t-label">{error}</div>
                </div>
            ) : grades.length === 0 ? (
                <div className="p-card" style={{ textAlign: 'center', padding: 36 }}>
                    <div className="t-label">Пока нет оценок</div>
                    <div className="t-meta" style={{ marginTop: 6 }}>Добавьте первую оценку сверху</div>
                </div>
            ) : (
                <div className="p-card" style={{ padding: 0 }}>
                    <table className="p-tbl">
                        <thead>
                            <tr>
                                <th>Предмет</th>
                                <th>Семестр</th>
                                <th>Балл</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map(g => (
                                <tr key={g.id}>
                                    <td>
                                        <span style={{ fontWeight: 500, color: 'var(--p-fg1)' }}>{g.subject}</span>
                                    </td>
                                    <td><span className="t-muted">{g.semester}</span></td>
                                    <td>
                                        <span className="num-display" style={{ fontSize: 'var(--p-t-xl)', color: gradeColorVar(g.score) }}>
                                            {g.score}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button type="button" className="p-btn p-btn-danger p-btn-sm p-btn-icon" onClick={() => handleDeleteGrade(g.id)} title="Удалить">
                                            <Trash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}
