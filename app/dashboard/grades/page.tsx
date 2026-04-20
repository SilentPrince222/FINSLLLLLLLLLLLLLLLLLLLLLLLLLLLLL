'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getGrades, createGrade, deleteGrade } from '@/lib/database'
import type { Database } from '@/types/database'

type Grade = Database['public']['Tables']['grades']['Row']

export default function GradesPage() {
    const { user } = useAuth()
    const [grades, setGrades] = useState<Grade[]>([])
    const [loading, setLoading] = useState(true)

    const [subject, setSubject] = useState('')
    const [score, setScore] = useState('')
    const [semester, setSemester] = useState('Fall 2026')
    const [saving, setSaving] = useState(false)

    const loadGrades = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data } = await getGrades(user.id)
        if (data) setGrades(data)
        setLoading(false)
    }, [user])

    useEffect(() => {
        if (user) {
            loadGrades()
        }
    }, [user, loadGrades])

    async function handleAddGrade(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const { data } = await createGrade({
            student_id: user!.id,
            subject,
            score: parseInt(score),
            semester
        })

        if (data) {
            setGrades([data, ...grades])
            setSubject('')
            setScore('')
        }

        setSaving(false)
    }

    async function handleDeleteGrade(id: number) {
        await deleteGrade(id)
        setGrades(grades.filter(g => g.id !== id))
    }

    const averageScore = grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
        : 0

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-2xl font-semibold text-foreground">Grades</h1>
                    <p className="text-muted-foreground mt-2">Manage your academic performance</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    <div className="card p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <span className="text-accent">📚</span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Subjects</p>
                                <p className="text-3xl font-semibold text-foreground mt-1">{grades.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <span className="text-accent">📊</span>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Average Score</p>
                                <p className={`text-3xl font-semibold mt-1 ${averageScore >= 70 ? 'text-success' : averageScore >= 50 ? 'text-amber-500' : 'text-danger'}`}>
                                    {averageScore}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Grade Form */}
                <div className="card p-8 mb-12">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Add New Grade</h3>
                    <form onSubmit={handleAddGrade} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="input sm:col-span-2"
                            required
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Score"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="input"
                            required
                        />
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="input"
                        >
                            <option>Fall 2026</option>
                            <option>Spring 2026</option>
                        </select>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary sm:col-start-4"
                        >
                            {saving ? 'Adding...' : 'Add Grade'}
                        </button>
                    </form>
                </div>

                {/* Grades List */}
                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading...</div>
                ) : grades.length === 0 ? (
                    <div className="card p-16 text-center">
                        <div className="text-muted-foreground">
                            <p className="font-medium text-lg">No grades yet</p>
                            <p className="text-sm mt-2">Add your first grade above to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="divide-y divide-border">
                            {grades.map((grade) => (
                                <div key={grade.id} className="p-6 flex items-center justify-between gap-6 hover:bg-muted/30 transition-colors duration-200">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{grade.subject}</p>
                                        <p className="text-sm text-muted-foreground">{grade.semester}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`text-xl font-semibold min-w-[60px] text-right ${grade.score >= 70 ? 'text-success' : grade.score >= 50 ? 'text-amber-500' : 'text-danger'}`}>
                                            {grade.score}%
                                        </span>
                                        <button
                                            onClick={() => handleDeleteGrade(grade.id)}
                                            className="btn-danger text-sm px-4 py-2"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}