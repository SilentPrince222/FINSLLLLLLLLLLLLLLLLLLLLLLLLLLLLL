'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { toast } from 'sonner'
import { useAuth, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { createGrade } from '@/lib/database'
import { SEMESTER, SUBJECTS } from '@/lib/constants'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function TeacherDashboard() {
    const router = useRouter()
    const { user, role, loading } = useAuth()

    const [students, setStudents] = useState<Profile[]>([])
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0])
    const [newScore, setNewScore] = useState('')
    const [comment, setComment] = useState('')
    // Track which student id is currently saving so parallel submits can't race
    const [savingId, setSavingId] = useState<string | null>(null)
    const [loadingStudents, setLoadingStudents] = useState(true)

    // Route guard — redirect non-teachers to their dashboard
    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (role && role !== 'teacher') { router.push('/dashboard'); return }
    }, [loading, user, role, router])

    useEffect(() => {
        if (!user || role !== 'teacher') return
        let cancelled = false
        ;(async () => {
            setLoadingStudents(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .order('full_name')
            if (cancelled) return
            if (error) {
                toast.error('Не удалось загрузить студентов')
            } else {
                setStudents((data ?? []) as Profile[])
            }
            setLoadingStudents(false)
        })()
        return () => { cancelled = true }
    }, [user, role])

    if (loading || !user || role !== 'teacher') {
        return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
    }

    const getGradeColor = (score: number) => {
        if (score >= 85) return 'text-green-600'
        if (score >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    async function handleAddGrade(studentId: string) {
        // Reject if any save is already in flight for any student
        if (savingId) return
        const score = parseInt(newScore, 10)
        if (!Number.isFinite(score) || score < 0 || score > 100) {
            toast.error('Оценка должна быть от 0 до 100')
            return
        }
        setSavingId(studentId)
        const { data, error } = await createGrade({
            student_id: studentId,
            teacher_id: user!.id,  // RLS rejects if this lies
            subject: selectedSubject,
            score,
            semester: SEMESTER,
            comment: comment.trim() || null,
        })
        setSavingId(null)

        // createGrade returns { data: null, error: null } on PGRST116 — treat as failure
        if (error || !data) {
            toast.error('Не удалось сохранить оценку')
            return
        }
        toast.success(`Оценка ${score} сохранена (${selectedSubject})`)
        setNewScore('')
        setComment('')
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Панель преподавателя</h1>
                <button
                    onClick={() => { router.push('/auth/login'); signOut() }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Выход
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Студенты ({students.length})</h2>
                    </div>
                    {loadingStudents ? (
                        <div className="p-8 text-center text-gray-500">Загрузка студентов...</div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Студентов нет. Запусти `npm run seed`.</div>
                    ) : (
                        <div className="divide-y">
                            {students.map(student => (
                                <div key={student.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                                        >
                                            <div className="font-medium">{student.full_name ?? student.email}</div>
                                            <div className="text-sm text-gray-500">
                                                {student.group_name ?? '—'} · Посещ: {student.attendance_rate ?? '—'}%
                                            </div>
                                        </div>
                                    </div>

                                    {selectedStudent === student.id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                            <div className="flex gap-3 flex-wrap">
                                                <select
                                                    value={selectedSubject}
                                                    onChange={e => setSelectedSubject(e.target.value)}
                                                    className="p-2 border rounded"
                                                >
                                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={newScore}
                                                    onChange={e => setNewScore(e.target.value)}
                                                    placeholder="Оценка"
                                                    className="p-2 border rounded w-28"
                                                />
                                                <input
                                                    type="text"
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                    placeholder="Комментарий (необязательно)"
                                                    maxLength={200}
                                                    className="p-2 border rounded flex-1 min-w-[200px]"
                                                />
                                                <button
                                                    onClick={() => handleAddGrade(student.id)}
                                                    disabled={savingId !== null || !newScore}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {savingId === student.id ? '...' : 'Добавить'}
                                                </button>
                                            </div>
                                            <div className={`text-sm ${getGradeColor(parseInt(newScore || '0', 10))}`}>
                                                {newScore ? `Будет сохранено: ${newScore}%` : ' '}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-semibold mb-3">Семестр</h3>
                        <div className="text-sm text-gray-600">{SEMESTER}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-semibold mb-3">Предметы</h3>
                        <div className="space-y-2">
                            {SUBJECTS.map(s => (
                                <div key={s} className="p-2 bg-gray-50 rounded text-sm">{s}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
