import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getTimetable } from '@/lib/database'

interface TimetableEntry {
  id: number
  user_id: string
  subject: string
  day: string
  start_time: string
  end_time?: string
  room?: string
  created_at?: string
}

export function useTimetable() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTimetable = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getTimetable(user.id)
      if (dbError) throw dbError

      // If no data in database, use mock data for development
      if (!data || data.length === 0) {
        const mockTimetable = [
          { id: 1, user_id: user.id, subject: 'Математика', day: 'Monday', start_time: '09:00', end_time: '10:30', room: '101' },
          { id: 2, user_id: user.id, subject: 'Физика', day: 'Tuesday', start_time: '11:00', end_time: '12:30', room: '203' },
          { id: 3, user_id: user.id, subject: 'Программирование', day: 'Wednesday', start_time: '14:00', end_time: '15:30', room: '305' },
          { id: 4, user_id: user.id, subject: 'Английский', day: 'Thursday', start_time: '10:00', end_time: '11:30', room: '102' },
          { id: 5, user_id: user.id, subject: 'Математика', day: 'Friday', start_time: '13:00', end_time: '14:30', room: '101' },
        ]
        setEntries(mockTimetable)
      } else {
        setEntries(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadTimetable()
    }
  }, [user, loadTimetable])

  return {
    entries,
    loading,
    error,
    refetch: loadTimetable
  }
}