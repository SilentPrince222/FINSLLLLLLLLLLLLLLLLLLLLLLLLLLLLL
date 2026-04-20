'use client'

import { useState } from 'react'

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        group: 'ИС-21',
        bio: 'Студент факультета информационных технологий. Интересуюсь программированием и искусственным интеллектом.',
        notifications: true,
        emailNotifications: true,
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        await new Promise(r => setTimeout(r, 1000))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Профиль</h1>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            👤
                        </div>
                        <h2 className="text-lg font-semibold">{formData.name}</h2>
                        <p className="text-gray-500">{formData.group}</p>
                        <button className="mt-4 text-sm text-blue-600 hover:underline">
                            Сменить фото
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 mt-4">
                        <h3 className="font-medium mb-3">Статистика</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Средний балл</span>
                                <span className="font-medium">82%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Предметов</span>
                                <span className="font-medium">8</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Событий</span>
                                <span className="font-medium">4</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">В системе с</span>
                                <span className="font-medium">Сен 2025</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h3 className="font-medium pb-2 border-b">Основная информация</h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Имя</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Телефон</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Группа</label>
                                <input
                                    type="text"
                                    value={formData.group}
                                    onChange={(e) => setFormData({...formData, group: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 mb-1">О себе</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full p-2 border rounded h-24 resize-none"
                            />
                        </div>

                        <h3 className="font-medium py-2 border-b mt-6">Настройки уведомлений</h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notifications}
                                    onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                                    className="w-4 h-4"
                                />
                                <span>Включить уведомления</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.emailNotifications}
                                    onChange={(e) => setFormData({...formData, emailNotifications: e.target.checked})}
                                    className="w-4 h-4"
                                />
                                <span>Email уведомления</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            {saved && (
                                <span className="py-2 text-green-600">✓ Сохранено</span>
                            )}
                        </div>
                    </form>

                    <div className="bg-white rounded-lg shadow p-6 mt-4">
                        <h3 className="font-medium pb-2 border-b mb-4">Безопасность</h3>
                        <button className="text-blue-600 hover:underline">
                            Сменить пароль
                        </button>
                        <button className="ml-4 text-red-600 hover:underline">
                            Удалить аккаунт
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}