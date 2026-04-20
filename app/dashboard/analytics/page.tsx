'use client'

import { useState } from 'react'

type GradeData = { subject: string; score: number; date: string }
type AttendanceData = { month: string; percent: number }

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

const mockAttendance: AttendanceData[] = [
    { month: 'Сен', percent: 95 },
    { month: 'Окт', percent: 92 },
    { month: 'Ноя', percent: 88 },
    { month: 'Дек', percent: 85 },
    { month: 'Янв', percent: 90 },
    { month: 'Фев', percent: 93 },
    { month: 'Мар', percent: 96 },
    { month: 'Апр', percent: 94 },
]

const subjects = ['Математика', 'Физика', 'Программирование', 'Английский']
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']

function BarChart({ data, max = 100 }: { data: { label: string; value: number }[], max?: number }) {
    return (
        <div className="flex items-end gap-1 h-40">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(d.value / max) * 100}%` }} />
                    <div className="text-xs mt-1 text-gray-500">{d.label}</div>
                </div>
            ))}
        </div>
    )
}

function LineChart({ data }: { data: { label: string; value: number }[] }) {
    const max = Math.max(...data.map(d => d.value))
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (d.value / max) * 100
    }))
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    return (
        <div className="h-40 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={path + ' L 100 100 L 0 100 Z'} fill="url(#gradient)" />
                <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
                ))}
            </svg>
            <div className="flex justify-between mt-2">
                {data.map((d, i) => (
                    <div key={i} className="text-xs text-gray-500">{d.label}</div>
                ))}
            </div>
        </div>
    )
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let cumulative = 0

    return (
        <div className="relative h-32 w-32 mx-auto">
            <svg viewBox="0 0 36 36" className="transform -rotate-90">
                {data.map((d, i) => {
                    const offset = cumulative
                    cumulative += (d.value / total) * 100
                    return (
                        <circle
                            key={i}
                            cx="18"
                            cy="18"
                            r="15.91549430918954"
                            fill="transparent"
                            stroke={d.color}
                            strokeDasharray={`${(d.value / total) * 100} ${100 - (d.value / total) * 100}`}
                            strokeDashoffset={-offset}
                        />
                    )
                })}
            </svg>
        </div>
    )
}

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('4')
    
    const subjectAverages = subjects.map(subject => {
        const grades = mockGrades.filter(g => g.subject === subject)
        return {
            label: subject,
            value: Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
        }
    })
    
    const totalAvg = Math.round(subjectAverages.reduce((sum, s) => sum + s.value, 0) / subjectAverages.length)
    
    const progressData = months.slice(0, parseInt(period)).map((month, i) => {
        const monthGrades = mockGrades.filter(g => g.date.startsWith(months[i].toLowerCase()))
        return {
            label: month,
            value: monthGrades.length > 0 
                ? Math.round(monthGrades.reduce((sum, g) => sum + g.score, 0) / monthGrades.length)
                : 0
        }
    })

    const subjectColors = subjects.map((s, i) => {
        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
        return { label: s, value: subjectAverages.find(sa => sa.label === s)!.value, color: colors[i] }
    })

    const getGradeLevel = (avg: number) => {
        if (avg >= 85) return { label: 'Отлично', color: 'text-green-600' }
        if (avg >= 70) return { label: 'Хорошо', color: 'text-blue-600' }
        if (avg >= 50) return { label: 'Средне', color: 'text-yellow-600' }
        return { label: 'Низко', color: 'text-red-600' }
    }

    const level = getGradeLevel(totalAvg)

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Аналитика</h1>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="4">За 4 месяца</option>
                    <option value="6">За 6 месяцев</option>
                    <option value="8">За год</option>
                </select>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">Средний балл</div>
                    <div className="text-3xl font-bold text-blue-600">{totalAvg}%</div>
                    <div className={`text-sm ${level.color}`}>{level.label}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">Всего оценок</div>
                    <div className="text-3xl font-bold text-green-600">{mockGrades.length}</div>
                    <div className="text-sm text-gray-500">за период</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">Посещаемость</div>
                    <div className="text-3xl font-bold text-purple-600">
                        {Math.round(mockAttendance.reduce((s, a) => s + a.percent, 0) / mockAttendance.length)}%
                    </div>
                    <div className="text-sm text-gray-500">средняя</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">Предметов</div>
                    <div className="text-3xl font-bold text-orange-600">{subjects.length}</div>
                    <div className="text-sm text-gray-500">в изучении</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-4">Прогресс по месяцам</h3>
                    <LineChart data={progressData} />
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-4">Оценки по предметам</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <BarChart data={subjectAverages} />
                        <div className="space-y-2">
                            {subjectColors.map((s, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span className="text-sm">{s.label}</span>
                                    </div>
                                    <span className="font-medium">{s.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-4">Распределение оценок</h3>
                    <DonutChart data={subjectColors} />
                    <div className="mt-4 space-y-2">
                        {subjectColors.map((s, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-sm">{s.label}</span>
                                </div>
                                <span className="text-sm">{s.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
                    <h3 className="font-semibold mb-4">Посещаемость по месяцам</h3>
                    <BarChart data={mockAttendance.map(m => ({ label: m.month, value: m.percent }))} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mt-6">
                <h3 className="font-semibold mb-4">Рекомендации</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-700">Сильные стороны</div>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>✓ Программирование - ваш лучший предмет ({subjectAverages.find(s => s.label === 'Программирование')?.value}%)</li>
                            <li>✓ Стабильная посещаемость</li>
                            <li>✓ Хороший прогресс в математике</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="font-medium text-yellow-700">Рекомендации</div>
                        <ul className="mt-2 text-sm space-y-1">
                            <li>→ Уделить больше внимания физике</li>
                            <li>→ Стабильнее посещать занятия в ноябре-декабре</li>
                            <li>→ Подтянуть английский язык</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}