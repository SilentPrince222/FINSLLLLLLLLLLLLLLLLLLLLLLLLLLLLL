'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'

type User = {
    id: number
    name: string
    email: string
    role: 'student' | 'teacher' | 'parent' | 'admin'
    group?: string
    status: 'active' | 'inactive'
}

const mockUsers: User[] = [
    { id: 1, name: 'Айдар Алимов', email: 'aidar.alimov@demo.edu', role: 'student', group: 'IT-21', status: 'active' },
    { id: 2, name: 'Айгерим Серикбаева', email: 'aigerim.serikbaeva@demo.edu', role: 'student', group: 'IT-21', status: 'active' },
    { id: 3, name: 'Жанар Мұратқызы', email: 'teacher@demo.edu', role: 'teacher', status: 'active' },
    { id: 4, name: 'Асель Касымова', email: 'asel.kasymova@demo.edu', role: 'parent', status: 'active' },
    { id: 5, name: 'Әкімші', email: 'admin@demo.edu', role: 'admin', status: 'active' },
]

const roleLabels: Record<User['role'], { label: string; color: string }> = {
    student: { label: 'Студент', color: 'bg-blue-100 text-blue-700' },
    teacher: { label: 'Преподаватель', color: 'bg-purple-100 text-purple-700' },
    parent: { label: 'Родитель', color: 'bg-green-100 text-green-700' },
    admin: { label: 'Админ', color: 'bg-red-100 text-red-700' },
}

export default function AdminDashboard() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const [users, setUsers] = useState<User[]>(mockUsers)
    const [filter, setFilter] = useState<string>('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (!loading && (!user || role !== 'admin')) {
            router.push('/')
        }
    }, [user, role, loading, router])

    if (loading || !user || role !== 'admin') return null

    const filteredUsers = users.filter(u => {
        if (filter !== 'all' && u.role !== filter) return false
        if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        parents: users.filter(u => u.role === 'parent').length,
    }

    const deleteUser = (id: number) => {
        if (confirm('Удалить пользователя?')) {
            setUsers(users.filter(u => u.id !== id))
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Админ-панель</h1>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Выход
                </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-500">Всего пользователей</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-3xl font-bold text-green-600">{stats.students}</div>
                    <div className="text-sm text-gray-500">Студентов</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-3xl font-bold text-purple-600">{stats.teachers}</div>
                    <div className="text-sm text-gray-500">Преподавателей</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-3xl font-bold text-yellow-600">{stats.parents}</div>
                    <div className="text-sm text-gray-500">Родителей</div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 border rounded flex-1 min-w-[200px]"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="all">Все роли</option>
                        <option value="student">Студенты</option>
                        <option value="teacher">Преподаватели</option>
                        <option value="parent">Родители</option>
                        <option value="admin">Админы</option>
                    </select>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        + Добавить
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left text-sm font-medium">Имя</th>
                                <th className="p-3 text-left text-sm font-medium">Email</th>
                                <th className="p-3 text-left text-sm font-medium">Роль</th>
                                <th className="p-3 text-left text-sm font-medium">Группа</th>
                                <th className="p-3 text-left text-sm font-medium">Статус</th>
                                <th className="p-3 text-left text-sm font-medium">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">{user.name}</td>
                                    <td className="p-3 text-gray-500">{user.email}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${roleLabels[user.role].color}`}>
                                            {roleLabels[user.role].label}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-500">{user.group || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button className="text-blue-600 hover:underline mr-2">Изменить</button>
                                        <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:underline">Удалить</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">Пользователи не найдены</div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Добавить пользователя</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Имя</label>
                                <input type="text" className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Email</label>
                                <input type="email" className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Роль</label>
                                <select className="w-full p-2 border rounded">
                                    <option value="student">Студент</option>
                                    <option value="teacher">Преподаватель</option>
                                    <option value="parent">Родитель</option>
                                    <option value="admin">Админ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Группа</label>
                                <input type="text" className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Пароль</label>
                                <input type="password" className="w-full p-2 border rounded" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border rounded"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}