'use client'

import { useState } from 'react'
import { BarChart, LineChart, DonutChart } from '@/components/charts'

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
const monthMap: Record<string, string> = {
    'Янв': '01', 'Фев': '02', 'Мар': '03', 'Апр': '04', 'Май': '05', 'Июн': '06',
    'Июл': '07', 'Авг': '08', 'Сен': '09', 'Окт': '10', 'Ноя': '11', 'Дек': '12',
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
        const monthNum = monthMap[months[i]]
        const monthGrades = mockGrades.filter(g => monthNum ? g.date.endsWith(`-${monthNum}`) : false)
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