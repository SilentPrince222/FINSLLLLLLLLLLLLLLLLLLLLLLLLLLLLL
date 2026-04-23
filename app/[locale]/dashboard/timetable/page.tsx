'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getTimetable, createTimetableEntry, deleteTimetableEntry } from '@/lib/database'
import { X, Plus } from 'lucide-react'
import type { Database } from '@/types/database'

type TimetableEntry = Database['public']['Tables']['timetable']['Row']

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_RU: Record<string, string> = {
    Monday: 'Пн', Tuesday: 'Вт', Wednesday: 'Ср', Thursday: 'Чт', Friday: 'Пт', Saturday: 'Сб',
}

export default function TimetablePage() {
    const { user } = useAuth()
    const [entries, setEntries] = useState<TimetableEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [subject, setSubject] = useState('')
    const [day, setDay] = useState('Monday')
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:30')
    const [room, setRoom] = useState('')
    const [saving, setSaving] = useState(false)

    const loadTimetable = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data } = await getTimetable(user.id)
        if (data) setEntries(data)
        setLoading(false)
    }, [user])

    useEffect(() => { if (user) loadTimetable() }, [user, loadTimetable])

    async function handleAddEntry(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const { data } = await createTimetableEntry({
            user_id: user!.id, subject, day, start_time: startTime, end_time: endTime, room: room || null,
        })
        if (data) {
            setEntries(prev => [...prev, data as TimetableEntry].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)))
            setSubject(''); setRoom('')
        }
        setSaving(false)
    }

    async function handleDeleteEntry(id: number) {
        await deleteTimetableEntry(id)
        setEntries(entries.filter(e => e.id !== id))
    }

    function getEntriesForDay(dayName: string) {
        return entries.filter(e => e.day === dayName).sort((a, b) => a.start_time.localeCompare(b.start_time))
    }

    return (
        <>
            <div className="p-card" style={{ marginBottom: 18 }}>
                <div className="sec-head"><div className="sec-title">Добавить занятие</div></div>
                <form onSubmit={handleAddEntry}>
                    <div className="g12" style={{ gap: 12 }}>
                        <div className="p-field span4" style={{ marginBottom: 0 }}>
                            <label>Предмет</label>
                            <input type="text" className="p-inp" value={subject} onChange={e => setSubject(e.target.value)} required />
                        </div>
                        <div className="p-field span2" style={{ marginBottom: 0 }}>
                            <label>День</label>
                            <select className="p-inp" value={day} onChange={e => setDay(e.target.value)}>
                                {DAYS.map(d => <option key={d} value={d}>{DAYS_RU[d]}</option>)}
                            </select>
                        </div>
                        <div className="p-field span2" style={{ marginBottom: 0 }}>
                            <label>Начало</label>
                            <input type="time" className="p-inp" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                        </div>
                        <div className="p-field span2" style={{ marginBottom: 0 }}>
                            <label>Конец</label>
                            <input type="time" className="p-inp" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                        </div>
                        <div className="p-field span2" style={{ marginBottom: 0 }}>
                            <label>Ауд.</label>
                            <input type="text" className="p-inp" value={room} onChange={e => setRoom(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <button type="submit" className="p-btn p-btn-cyan" disabled={saving}>
                            <Plus /> {saving ? 'Добавление…' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <div className="p-card t-muted" style={{ textAlign: 'center', padding: 36 }}>Загрузка…</div>
            ) : entries.length === 0 ? (
                <div className="p-card" style={{ textAlign: 'center', padding: 36 }}>
                    <div className="t-label">Нет занятий</div>
                    <div className="t-meta" style={{ marginTop: 6 }}>Добавьте первое занятие сверху</div>
                </div>
            ) : (
                <div className="g3">
                    {DAYS.map(dayName => {
                        const dayEntries = getEntriesForDay(dayName)
                        return (
                            <div key={dayName} className="p-card">
                                <div className="sec-head"><div className="sec-title">{DAYS_RU[dayName]}</div></div>
                                {dayEntries.length === 0 ? (
                                    <div className="t-meta" style={{ padding: '8px 0' }}>Нет занятий</div>
                                ) : (
                                    dayEntries.map(entry => (
                                        <div key={entry.id} className="slot">
                                            <div className="slot-time">{entry.start_time}</div>
                                            <div className="slot-body">
                                                <div className="slot-subj">{entry.subject}</div>
                                                <div className="slot-sub">
                                                    {entry.end_time ?? ''}{entry.room ? ` · ${entry.room}` : ''}
                                                </div>
                                            </div>
                                            <button type="button" className="p-btn p-btn-danger p-btn-sm p-btn-icon" onClick={() => handleDeleteEntry(entry.id)} title="Удалить">
                                                <X />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}
