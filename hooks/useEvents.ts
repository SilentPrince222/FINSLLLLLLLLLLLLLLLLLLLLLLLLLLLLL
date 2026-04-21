import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getEvents } from '@/lib/database'

interface Event {
  id: number
  user_id: string
  title: string
  due_date: string
  description: string | null
  type: string
  priority: string
  created_at: string
}

export function useEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getEvents(user.id)
      if (dbError) throw dbError

      // If no data in database, use mock data for development
      if (!data || data.length === 0) {
        const mockEvents = [
          { id: 1, user_id: user.id, title: 'Сдать лабораторную работу по физике', due_date: '2026-04-16T23:59:00Z', description: 'Лабораторная работа №3', type: 'homework', priority: 'high', created_at: '2026-04-10T10:00:00Z' },
          { id: 2, user_id: user.id, title: 'Подготовиться к экзамену по математике', due_date: '2026-04-18T09:00:00Z', description: 'Экзамен по алгебре и геометрии', type: 'exam', priority: 'high', created_at: '2026-04-10T10:00:00Z' },
          { id: 3, user_id: user.id, title: 'Сдать проект по программированию', due_date: '2026-04-20T17:00:00Z', description: 'Финальный проект курса', type: 'homework', priority: 'medium', created_at: '2026-04-10T10:00:00Z' },
          { id: 4, user_id: user.id, title: 'Пройти тест по английскому', due_date: '2026-04-22T14:00:00Z', description: 'Тест на знание грамматики', type: 'exam', priority: 'low', created_at: '2026-04-10T10:00:00Z' },
        ]
        setEvents(mockEvents)
      } else {
        setEvents(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user, loadEvents])

  return {
    events,
    loading,
    error,
    refetch: loadEvents
  }
}