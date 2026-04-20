'use client'

import { useState } from 'react'

type Event = {
    id: number
    title: string
    date: string
    time: string
    description: string
    type: 'exam' | 'homework' | 'activity' | 'holiday'
}

const mockEvents: Event[] = [
    { id: 1, title: 'Экзамен по Математике', date: '2026-05-15', time: '09:00', description: 'Аудитория 201', type: 'exam' },
    { id: 2, title: 'Сдача курсовой', date: '2026-05-20', time: '23:59', description: 'В LMS', type: 'homework' },
    { id: 3, title: 'День открытых дверей', date: '2026-05-10', time: '14:00', description: 'Главный корпус', type: 'activity' },
    { id: 4, title: 'Весенние каникулы', date: '2026-05-01', time: '00:00', description: 'По 9 мая', type: 'holiday' },
]

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const typeColors: Record<Event['type'], string> = {
    exam: 'bg-red-100 text-red-700 border-red-300',
    homework: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    activity: 'bg-blue-100 text-blue-700 border-blue-300',
    holiday: 'bg-green-100 text-green-700 border-green-300',
}

const typeLabels: Record<Event['type'], string> = {
    exam: 'Экзамен',
    homework: 'Домашка',
    activity: 'Мероприятие',
    holiday: 'Каникулы',
}

export default function EventsPage() {
    const [currentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [events] = useState<Event[]>(mockEvents)

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days: (number | null)[] = []
    for (let i = 0; i < firstDay - 1; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    const getEventsForDay = (day: number) => events.filter(e => {
        const d = new Date(e.date)
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
    })

    const formatDate = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Календарь событий</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => {
                            const dayEvents = day ? getEventsForDay(day) : null
                            const isToday = day === currentDate.getDate()
                            const isSelected = day && selectedDate === formatDate(day)
                            const hasEvents = dayEvents && dayEvents.length > 0

                            return (
                                <div
                                    key={i}
                                    onClick={() => day && setSelectedDate(isSelected ? null : formatDate(day))}
                                    className={`
                                        min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                                        ${day ? 'hover:bg-gray-50' : 'bg-gray-50'}
                                        ${hasEvents ? 'bg-blue-50' : ''}
                                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                                    `}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>{day}</div>
                                            {hasEvents && (
                                                <div className="text-xs text-gray-500 truncate">
                                                    {dayEvents![0].title}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-4">События {selectedDate ? new Date(selectedDate).toLocaleDateString('ru') : 'в этом месяце'}</h3>
                    
                    {selectedDate ? (
                        <div className="space-y-3">
                            {events.filter(e => e.date === selectedDate).length === 0 ? (
                                <p className="text-gray-500 text-sm">Нет событий</p>
                            ) : (
                                events.filter(e => e.date === selectedDate).map(event => (
                                    <div key={event.id} className={`p-3 rounded-lg border ${typeColors[event.type]}`}>
                                        <div className="font-medium">{event.title}</div>
                                        <div className="text-sm">{event.time}</div>
                                        <div className="text-sm">{event.description}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map(event => (
                                <div key={event.id} className={`p-3 rounded-lg border ${typeColors[event.type]}`}>
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-sm">{new Date(event.date).toLocaleDateString('ru')} {event.time}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4">Легенда</h3>
                <div className="flex flex-wrap gap-4">
                    {(['exam', 'homework', 'activity', 'holiday'] as Event['type'][]).map(type => (
                        <div key={type} className={`px-3 py-1 rounded border ${typeColors[type]}`}>
                            {typeLabels[type]}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}