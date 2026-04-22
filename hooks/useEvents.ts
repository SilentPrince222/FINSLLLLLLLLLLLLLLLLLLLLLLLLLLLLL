import { useState, useEffect, useCallback, useRef } from 'react'
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
  // Bug 7.2 / 7.5: depend on userId primitive, not user object reference
  const userId = user?.id ?? null

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Bug 7.2: mounted ref to prevent state updates after unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadEvents = useCallback(async () => {
    if (!userId) return

    const abortController = new AbortController()
    const currentUserId = userId

    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getEvents(currentUserId)

      if (!mountedRef.current || abortController.signal.aborted) return

      if (dbError) throw dbError

      setEvents(data ?? [])
    } catch (err) {
      if (!mountedRef.current || abortController.signal.aborted) return
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoading(false)
      }
    }

    return () => abortController.abort()
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadEvents()
    } else {
      setEvents([])
      setLoading(false)
    }
  }, [userId, loadEvents])

  return {
    events,
    loading,
    error,
    refetch: loadEvents
  }
}
