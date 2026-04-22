'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getTimetable, createTimetableEntry, deleteTimetableEntry } from '@/lib/database'
import type { Database } from '@/types/database'

type TimetableEntry = Database['public']['Tables']['timetable']['Row']

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

    useEffect(() => {
        if (user) {
            loadTimetable()
        }
    }, [user, loadTimetable])

    async function handleAddEntry(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const { data } = await createTimetableEntry({
            user_id: user!.id,
            subject,
            day,
            start_time: startTime,
            end_time: endTime,
            room: room || null
        })

        if (data) {
            setEntries([...entries, data].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)))
            setSubject('')
            setRoom('')
        }

        setSaving(false)
    }

    async function handleDeleteEntry(id: number) {
        await deleteTimetableEntry(id)
        setEntries(entries.filter(e => e.id !== id))
    }

    function getEntriesForDay(dayName: string) {
        return entries
            .filter(e => e.day === dayName)
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Timetable</h1>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="font-bold mb-4">Add New Class</h3>
                <form onSubmit={handleAddEntry} className="flex gap-3 flex-wrap items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="w-36">
                        <label className="block text-sm mb-1">Day</label>
                        <select
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="w-28">
                        <label className="block text-sm mb-1">Start</label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="w-28">
                        <label className="block text-sm mb-1">End</label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-sm mb-1">Room</label>
                        <input
                            type="text"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {saving ? '...' : 'Add'}
                    </button>
                </form>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : entries.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-white rounded-lg">No classes scheduled</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DAYS.map(dayName => {
                        const dayEntries = getEntriesForDay(dayName)
                        return (
                            <div key={dayName} className="bg-white rounded-lg shadow p-4">
                                <h3 className="font-bold mb-3 border-b pb-2">{dayName}</h3>
                                {dayEntries.length === 0 ? (
                                    <div className="text-gray-400 text-sm py-2">No classes</div>
                                ) : (
                                    <div className="space-y-2">
                                        {dayEntries.map(entry => (
                                            <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div>
                                                    <div className="font-medium">{entry.subject}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {entry.start_time} - {entry.end_time}
                                                        {entry.room && ` • ${entry.room}`}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                    className="text-red-600 text-sm px-2"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}