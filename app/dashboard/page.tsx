'use client'

import { useEffect, useState } from 'react'
import { useAuth, signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { getGrades, getTimetable } from '@/lib/database'

export default function Dashboard() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [grades, setGrades] = useState<any[]>([])
    const [timetable, setTimetable] = useState<any[]>([])

    useEffect(() => {
        loadDashboardData()
    }, [])

    async function loadDashboardData() {
        // Демонстрационные данные
        setGrades([
            { id: 1, subject: 'Математика', score: 85 },
            { id: 2, subject: 'Физика', score: 72 },
            { id: 3, subject: 'Программирование', score: 90 },
        ])
        setTimetable([
            { id: 1, subject: 'Математика', day: 'Понедельник', start_time: '09:00' },
            { id: 2, subject: 'Физика', day: 'Вторник', start_time: '11:00' },
            { id: 3, subject: 'Программирование', day: 'Среда', start_time: '14:00' },
        ])
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Пожалуйста, войдите в систему</p>
            </div>
        )
    }

    const role = user.user_metadata?.role || 'student'

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-border">
                <div className="p-6">
                    <h1 className="text-xl font-semibold text-foreground mb-8">College Portal</h1>
                    <nav className="space-y-2">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full text-left px-4 py-2 text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/grades')}
                            className="w-full text-left px-4 py-2 text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                        >
                            📚 Grades
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/timetable')}
                            className="w-full text-left px-4 py-2 text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                        >
                            📅 Timetable
                        </button>
                        <button
                            onClick={() => signOut().then(() => router.push('/'))}
                            className="w-full text-left px-4 py-2 text-foreground hover:bg-accent/10 rounded-lg transition-colors mt-8"
                        >
                            🚪 Sign Out
                        </button>
                    </nav>
                </div>
            </aside>

            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Grades Overview */}
                        <div className="relative">
                            <div className="card p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <span className="text-accent">📊</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Grades</h3>
                                        <p className="text-sm text-muted-foreground">Your performance</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {grades.slice(0, 3).map(g => (
                                        <div key={g.id} className="flex justify-between items-center">
                                            <span className="text-sm text-foreground">{g.subject}</span>
                                            <span className={`text-sm font-semibold ${g.score >= 70 ? 'text-success' : 'text-danger'}`}>
                                                {g.score}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/grades')}
                                    className="w-full mt-4 text-accent text-sm hover:text-accent/80 transition-colors"
                                >
                                    View all →
                                </button>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="relative">
                            <div className="card p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <span className="text-accent">🤖</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
                                        <p className="text-sm text-muted-foreground">Smart analysis</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Average Score</p>
                                        <p className="text-xl font-semibold text-foreground">
                                            {grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) : 0}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Trend</p>
                                        <p className="text-sm text-foreground">
                                            {grades.length > 1 ? '📈 Stable' : '📊 Add more data'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timetable */}
                        <div className="relative">
                            <div className="card p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <span className="text-accent">📅</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Timetable</h3>
                                        <p className="text-sm text-muted-foreground">Today&apos;s schedule</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {timetable.slice(0, 3).map(t => (
                                        <div key={t.id} className="flex justify-between items-center">
                                            <span className="text-sm text-foreground">{t.subject}</span>
                                            <span className="text-sm text-muted-foreground">{t.start_time}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/timetable')}
                                    className="w-full mt-4 text-accent text-sm hover:text-accent/80 transition-colors"
                                >
                                    View full schedule →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
