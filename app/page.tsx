'use client'

import { useRouter } from 'next/navigation'

const roles = [
    { role: 'student', label: 'Студент', icon: '🎓', desc: 'Просмотр оценок, расписания, материалов', href: '/dashboard' },
    { role: 'teacher', label: 'Преподаватель', icon: '👨‍🏫', desc: 'Управление оценками, студентами', href: '/teacher' },
    { role: 'parent', label: 'Родитель', icon: '👨‍👩‍👧', desc: 'Просмотр успеваемости ребёнка', href: '/parent' },
    { role: 'admin', label: 'Админ', icon: '⚙️', desc: 'Управление системой', href: '/admin' },
]

export default function Home() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <h1 className="text-4xl font-bold text-center mb-2">College Management System</h1>
            <p className="text-lg text-gray-600 text-center mb-8">Система управления учебным процессом</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                {roles.map(r => (
                    <button
                        key={r.role}
                        onClick={() => router.push(r.href)}
                        className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                        <div className="text-4xl mb-3">{r.icon}</div>
                        <div className="text-xl font-semibold mb-1">{r.label}</div>
                        <div className="text-sm text-gray-500">{r.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    )
}