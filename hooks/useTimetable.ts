import { useState, useEffect, useCallback, useRef } from 'react'
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
  // Bug 7.3 / 7.5: depend on userId primitive, not user object reference
  const userId = user?.id ?? null

  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Bug 7.3: mounted ref to prevent state updates after unmount
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadTimetable = useCallback(async () => {
    if (!userId) return

    const abortController = new AbortController()
    const currentUserId = userId

    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getTimetable(currentUserId)

      if (!mountedRef.current || abortController.signal.aborted) return

      if (dbError) throw dbError

      setEntries(data ?? [])
    } catch (err) {
      if (!mountedRef.current || abortController.signal.aborted) return
      setError(err instanceof Error ? err.message : 'Failed to load timetable')
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoading(false)
      }
    }

    return () => abortController.abort()
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadTimetable()
    } else {
      setEntries([])
      setLoading(false)
    }
  }, [userId, loadTimetable])

  return {
    entries,
    loading,
    error,
    refetch: loadTimetable
  }
}
