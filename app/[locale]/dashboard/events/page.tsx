'use client'

import { useState } from 'react'
import { Plus, Heart, MessageSquare, Calendar, Clock } from 'lucide-react'

type Event = {
    id: number
    title: string
    date: string
    time: string
    description: string
    type: 'exam' | 'homework' | 'activity' | 'holiday' | 'social'
    author?: string
    likes?: number
    comments?: number
}

const mockEvents: Event[] = [
    { id: 1, title: 'Экзамен по математике', date: '2026-05-15', time: '09:00', description: 'Аудитория 201 — не забудьте калькулятор', type: 'exam', author: 'Жанар Мұратқызы', likes: 12, comments: 5 },
    { id: 2, title: 'Курсовая работа', date: '2026-05-20', time: '23:59', description: 'Сдача через LMS. Поздние сдачи не принимаются.', type: 'homework', author: 'Д-р Смит', likes: 8, comments: 3 },
    { id: 3, title: 'День открытых дверей', date: '2026-05-10', time: '14:00', description: 'Встреча с преподавателями и тур по кампусу.', type: 'activity', author: 'Admin Team', likes: 45, comments: 12 },
    { id: 4, title: 'Весенние каникулы!', date: '2026-05-01', time: '00:00', description: 'Занятия возобновляются 9 мая.', type: 'holiday', author: 'Academic Office', likes: 67, comments: 23 },
    { id: 5, title: 'Кино-ночь', date: '2026-04-25', time: '20:00', description: 'Показ в актовом зале. Попкорн!', type: 'social', author: 'Студ-совет', likes: 89, comments: 34 },
]

const TYPE_PILL: Record<Event['type'], string> = {
    exam: 'danger',
    homework: 'amber',
    activity: 'cyan',
    holiday: 'success',
    social: 'magenta',
}

const TYPE_LABEL: Record<Event['type'], string> = {
    exam: 'Экзамен',
    homework: 'Дедлайн',
    activity: 'Событие',
    holiday: 'Каникулы',
    social: 'Соц',
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>(mockEvents)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', date: '', description: '' })

    const handleLike = (id: number) => {
        setEvents(events.map(e => e.id === id ? { ...e, likes: (e.likes ?? 0) + 1 } : e))
    }

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        const [date, time] = (form.date || '2026-01-01T00:00').split('T')
        setEvents([
            { id: Date.now(), title: form.title, date, time: time ?? '00:00', description: form.description, type: 'social', author: 'Вы', likes: 0, comments: 0 },
            ...events,
        ])
        setForm({ title: '', date: '', description: '' })
        setShowForm(false)
    }

    return (
        <>
            <div className="sec-head">
                <div className="sec-title">События</div>
                <button type="button" className="p-btn p-btn-cyan p-btn-sm" onClick={() => setShowForm(v => !v)}>
                    <Plus /> Создать
                </button>
            </div>

            {showForm && (
                <div className="p-card" style={{ marginBottom: 18 }}>
                    <form onSubmit={handleCreate}>
                        <div className="g2">
                            <div className="p-field">
                                <label>Название</label>
                                <input className="p-inp" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="p-field">
                                <label>Дата и время</label>
                                <input type="datetime-local" className="p-inp" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                            </div>
                        </div>
                        <div className="p-field">
                            <label>Описание</label>
                            <textarea className="p-inp" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" className="p-btn p-btn-ghost" onClick={() => setShowForm(false)}>Отмена</button>
                            <button type="submit" className="p-btn p-btn-cyan">Создать событие</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {events.map(ev => (
                    <div key={ev.id} className="p-card">
                        <div className="sec-head" style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                <span className={`pill ${TYPE_PILL[ev.type]}`}>{TYPE_LABEL[ev.type]}</span>
                                <div className="t-h3" style={{ margin: 0 }}>{ev.title}</div>
                            </div>
                            {ev.author && <span className="t-meta">{ev.author}</span>}
                        </div>
                        <div className="t-body" style={{ marginBottom: 12, color: 'var(--p-fg3)' }}>{ev.description}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} className="p-num t-meta">
                                <Calendar style={{ width: 13, height: 13 }} /> {ev.date}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} className="p-num t-meta">
                                <Clock style={{ width: 13, height: 13 }} /> {ev.time}
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                <button type="button" className="p-btn p-btn-ghost p-btn-sm" onClick={() => handleLike(ev.id)}>
                                    <Heart /> <span className="p-num">{ev.likes ?? 0}</span>
                                </button>
                                <button type="button" className="p-btn p-btn-ghost p-btn-sm">
                                    <MessageSquare /> <span className="p-num">{ev.comments ?? 0}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
