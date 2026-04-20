'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Student = {
    id: number
    name: string
    group: string
    avgGrade: number
    attendance: number
}

const mockStudents: Student[] = [
    { id: 1, name: 'Алексей Петров', group: 'ИС-21', avgGrade: 85, attendance: 95 },
    { id: 2, name: 'Мария Иванова', group: 'ИС-21', avgGrade: 92, attendance: 100 },
    { id: 3, name: 'Дмитрий Сидоров', group: 'ИС-21', avgGrade: 78, attendance: 88 },
    { id: 4, name: 'Елена Смирнова', group: 'ИС-22', avgGrade: 88, attendance: 92 },
    { id: 5, name: 'Иван Иванов', group: 'ИС-22', avgGrade: 72, attendance: 85 },
]

type Grade = {
    id: number
    studentId: number
    subject: string
    score: number
    date: string
}

export default function TeacherDashboard() {
    const router = useRouter()
    const [students] = useState<Student[]>(mockStudents)
    const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
    const [grades, setGrades] = useState<Grade[]>([])
    const [selectedSubject, setSelectedSubject] = useState('Математика')
    const [newScore, setNewScore] = useState('')

    const subjects = ['Математика', 'Физика', 'Программирование', 'Английский']

    const getGradeColor = (score: number) => {
        if (score >= 85) return 'text-green-600'
        if (score >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    const addGrade = (studentId: number) => {
        if (!newScore) return
        setGrades([...grades, {
            id: Date.now(),
            studentId,
            subject: selectedSubject,
            score: parseInt(newScore),
            date: new Date().toISOString().split('T')[0]
        }])
        setNewScore('')
    }

    const getAvgGrade = (studentId: number) => {
        const studentGrades = grades.filter(g => g.studentId === studentId)
        if (studentGrades.length === 0) return students.find(s => s.id === studentId)?.avgGrade || 0
        return Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Панель преподавателя</h1>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Выход
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Студенты</h2>
                    </div>
                    <div className="divide-y">
                        {students.map(student => (
                            <div key={student.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}>
                                        <div className="font-medium">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.group}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold text-lg ${getGradeColor(getAvgGrade(student.id))}`}>
                                            {getAvgGrade(student.id)}%
                                        </div>
                                        <div className="text-xs text-gray-400">Посещ: {student.attendance}%</div>
                                    </div>
                                </div>
                                
                                {selectedStudent === student.id && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex gap-3 mb-3">
                                            <select
                                                value={selectedSubject}
                                                onChange={(e) => setSelectedSubject(e.target.value)}
                                                className="p-2 border rounded"
                                            >
                                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={newScore}
                                                onChange={(e) => setNewScore(e.target.value)}
                                                placeholder="Оценка"
                                                className="p-2 border rounded w-24"
                                            />
                                            <button
                                                onClick={() => addGrade(student.id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Добавить
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-semibold mb-3">Статистика группы</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Всего студентов</span>
                                <span className="font-medium">{students.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Средний балл</span>
                                <span className="font-medium">{Math.round(students.reduce((sum, s) => sum + s.avgGrade, 0) / students.length)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Средняя посещаемость</span>
                                <span className="font-medium">{Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-semibold mb-3">Мои предметы</h3>
                        <div className="space-y-2">
                            {subjects.map(s => (
                                <div key={s} className="p-2 bg-gray-50 rounded text-sm">{s}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}