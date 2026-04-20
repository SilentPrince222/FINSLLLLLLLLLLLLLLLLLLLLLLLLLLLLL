'use client'

import { useState } from 'react'

export type Notification = {
    id: number
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    read: boolean
    date: string
}

const mockNotifications: Notification[] = [
    { id: 1, title: 'Новая оценка', message: 'Вы получили 85 баллов за экзамен по Математике', type: 'success', read: false, date: '2026-04-20' },
    { id: 2, title: 'Напоминание', message: 'Домашняя работа по Физике до 25 апреля', type: 'warning', read: false, date: '2026-04-19' },
    { id: 3, title: 'Расписание изменено', message: 'Занятие по Программированию перенесено на 14:00', type: 'info', read: true, date: '2026-04-18' },
    { id: 4, title: 'Дедлайн', message: 'Курсовая работа через 3 дня', type: 'error', read: false, date: '2026-04-17' },
]

const typeStyles: Record<Notification['type'], { bg: string, text: string, icon: string }> = {
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: 'ℹ️' },
    warning: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: '⚠️' },
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: '✅' },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '❌' },
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const [showAll, setShowAll] = useState(false)

    const unreadCount = notifications.filter(n => !n.read).length
    const visible = showAll ? notifications : notifications.filter(n => !n.read)

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <h3 className="font-medium">Уведомления</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline">
                        Отметить все как прочитанные
                    </button>
                )}
            </div>

            <div className="divide-y max-h-96 overflow-y-auto">
                {visible.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Нет новых уведомлений</div>
                ) : (
                    visible.map(notification => {
                        const style = typeStyles[notification.type]
                        return (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${style.bg} ${!notification.read ? 'font-medium' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">{style.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className={style.text}>{notification.title}</div>
                                            <div className="text-xs text-gray-400">{notification.date}</div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {unreadCount > 0 && (
                <div className="p-3 border-t text-center">
                    <button onClick={() => setShowAll(!showAll)} className="text-sm text-blue-600 hover:underline">
                        {showAll ? 'Скрыть прочитанные' : `Показать все уведомления (${notifications.length})`}
                    </button>
                </div>
            )}
        </div>
    )
}