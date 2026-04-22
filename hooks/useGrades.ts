import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { getGrades } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Grade = Database['public']['Tables']['grades']['Row']

const PULSE_DURATION_MS = 6000
const POLL_GRACE_MS = 10_000
const POLL_INTERVAL_MS = 3_000

export function useGrades() {
  const { user } = useAuth()
  // Track user.id (primitive) — not user (object) — to avoid spurious re-fetches
  const userId = user?.id ?? null

  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // §7.4 pulse: transient Set of grade ids that just arrived over Realtime
  const [recentIds, setRecentIds] = useState<Set<number>>(new Set())

  const mountedRef = useRef(true)
  // Monotonic load id — older fetches can tell they've been superseded
  const activeLoadId = useRef(0)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadGrades = useCallback(async () => {
    if (!userId) { setLoading(false); return }

    const myLoadId = ++activeLoadId.current
    const currentUserId = userId

    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getGrades(currentUserId)
      if (!mountedRef.current || myLoadId !== activeLoadId.current) return
      if (dbError) throw dbError
      setGrades((data ?? []) as Grade[])
    } catch (err) {
      if (!mountedRef.current || myLoadId !== activeLoadId.current) return
      setError(err instanceof Error ? err.message : 'Failed to load grades')
    } finally {
      if (mountedRef.current && myLoadId === activeLoadId.current) {
        setLoading(false)
      }
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      setError(null)
      loadGrades()
    } else {
      setGrades([])
      setError(null)
      setLoading(false)
    }
  }, [userId, loadGrades])

  // §7.2/7.3 — Realtime subscription + polling fallback.
  useEffect(() => {
    if (!userId) return

    let pollInterval: ReturnType<typeof setInterval> | null = null
    let graceTimer: ReturnType<typeof setTimeout> | null = null
    let isClosed = false

    const startPolling = () => {
      if (pollInterval || !isClosed || !mountedRef.current) return
      pollInterval = setInterval(() => { loadGrades() }, POLL_INTERVAL_MS)
    }

    const handleInsert = (payload: { new: Grade }) => {
      if (!mountedRef.current) return
      const newGrade = payload.new
      // Dedup by id — a polling refetch could have pre-populated it
      setGrades(prev =>
        prev.some(g => g.id === newGrade.id) ? prev : [newGrade, ...prev]
      )
      setRecentIds(prev => {
        const next = new Set(prev)
        next.add(newGrade.id)
        return next
      })
      setTimeout(() => {
        if (!mountedRef.current) return
        setRecentIds(prev => {
          if (!prev.has(newGrade.id)) return prev
          const next = new Set(prev)
          next.delete(newGrade.id)
          return next
        })
      }, PULSE_DURATION_MS)
      toast.success(`Жаңа баға: ${newGrade.subject} — ${newGrade.score}`)
    }

    const channel = supabase
      .channel(`grades:${userId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'grades',
          filter: `student_id=eq.${userId}`,
        },
        handleInsert as any
      )
      .subscribe(status => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Status callback fires once per transition — schedule the poll start
          // after the grace window rather than waiting for another callback.
          isClosed = true
          if (!graceTimer && !pollInterval) {
            graceTimer = setTimeout(() => {
              graceTimer = null
              startPolling()
            }, POLL_GRACE_MS)
          }
        } else if (status === 'SUBSCRIBED') {
          isClosed = false
          if (graceTimer) { clearTimeout(graceTimer); graceTimer = null }
          if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
          // Close the gap between last poll tick and first Realtime delivery
          loadGrades()
        }
      })

    return () => {
      if (graceTimer) clearTimeout(graceTimer)
      if (pollInterval) clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [userId, loadGrades])

  return {
    grades,
    loading,
    error,
    recentIds,
    refetch: loadGrades
  }
}
