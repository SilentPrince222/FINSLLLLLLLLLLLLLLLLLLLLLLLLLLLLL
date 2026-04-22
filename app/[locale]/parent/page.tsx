'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Child = {
    id: number
    name: string
    group: string
    avgGrade: number
    attendance: number
    grades: { subject: string; score: number; date: string }[]
    timetable: { subject: string; day: string; time: string }[]
}

const mockChild: Child = {
    id: 1,
    name: 'Иван Иванов',
    group: 'ИС-21',
    avgGrade: 82,
    attendance: 95,
    grades: [
        { subject: 'Математика', score: 85, date: '2026-04-15' },
        { subject: 'Физика', score: 78, date: '2026-04-14' },
        { subject: 'Программирование', score: 90, date: '2026-04-13' },
        { subject: 'Английский', score: 82, date: '2026-04-12' },
        { subject: 'Математика', score: 80, date: '2026-04-10' },
    ],
    timetable: [
        { subject: 'Математика', day: 'Понедельник', time: '09:00' },
        { subject: 'Физика', day: 'Вторник', time: '11:00' },
        { subject: 'Программирование', day: 'Среда', time: '14:00' },
        { subject: 'Английский', day: 'Четверг', time: '10:00' },
    ],
}

export default function ParentDashboard({ params }: { params?: { locale?: string } }) {
    const router = useRouter()
    // Bug 10.8: use locale from params so logout redirects to /ru/ or /kk/ prefix
    const locale = (params && params.locale) || 'ru'
    const [child] = useState<Child>(mockChild)
    const [showAllGrades, setShowAllGrades] = useState(false)

    const getGradeColor = (score: number) => {
        if (score >= 85) return 'bg-green-100 text-green-700'
        if (score >= 70) return 'bg-yellow-100 text-yellow-700'
        return 'bg-red-100 text-red-700'
    }

    // Bug 10.8: logout redirects to locale-prefixed path
    const handleLogout = () => {
        if (locale === 'kk') {
            router.push('/kk/auth/login')
        } else {
            router.push('/ru/auth/login')
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Панель родителя</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Выход
                </button>
            </div>

            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">👤</div>
                    <div>
                        <h2 className="text-xl font-semibold">{child.name}</h2>
                        <p className="text-gray-500">{child.group}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 p-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{child.avgGrade}%</div>
                        <div className="text-sm text-gray-500">Средний балл</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{child.attendance}%</div>
                        <div className="text-sm text-gray-500">Посещаемость</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">5</div>
                        <div className="text-sm text-gray-500">Предметов</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Оценки</h3>
                        <button
                            onClick={() => setShowAllGrades(!showAllGrades)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {showAllGrades ? 'Скрыть' : 'Показать все'}
                        </button>
                    </div>
                    <div className="p-4">
                        {(showAllGrades ? child.grades : child.grades.slice(0, 5)).map((grade, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                <div>
                                    <div className="font-medium">{grade.subject}</div>
                                    <div className="text-xs text-gray-400">{grade.date}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full font-medium ${getGradeColor(grade.score)}`}>
                                    {grade.score}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Расписание на неделю</h3>
                    </div>
                    <div className="p-4">
                        {child.timetable.map((t, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                <div className="font-medium">{t.subject}</div>
                                <div className="text-sm text-gray-500">{t.day}, {t.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow mt-6 p-4">
                <h3 className="font-semibold mb-3">📧 Связаться с преподавателем</h3>
                <p className="text-sm text-gray-500 mb-3">У вас есть вопросы? Напишите сообщение куратору группы.</p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Ваше сообщение..."
                        className="flex-1 p-2 border rounded"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Отправить
                    </button>
                </div>
            </div>
        </div>
    )
}