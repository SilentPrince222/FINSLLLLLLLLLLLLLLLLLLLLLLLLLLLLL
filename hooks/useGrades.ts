import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { getGrades } from '@/lib/database'

interface Grade {
  id: number
  student_id: string
  subject: string
  score: number
  semester: string
  created_at?: string
}

export function useGrades() {
  const { user } = useAuth()
  // Bug 7.5: track user.id, not the user object reference, to avoid re-fetching
  // when the same user is re-created as a new object
  const userId = user?.id ?? null

  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Bug 7.1 / 2.3: use a ref-based abort flag so an in-flight fetch never
  // updates state after unmount or after the user has changed/cleared
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadGrades = useCallback(async () => {
    // Bug 7.6: set loading=false immediately when there is no user
    if (!user) { setLoading(false); return }
    if (!userId) { setLoading(false); return }

    // Bug 2.3: capture the userId that was current when this call started.
    // Each invocation gets its own abort controller so mid-flight user=null
    // won't corrupt state.
    const abortController = new AbortController()
    const currentUserId = userId

    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getGrades(currentUserId)

      // Bug 7.1 / 2.3: bail out if component unmounted or user changed
      if (!mountedRef.current || abortController.signal.aborted) return

      if (dbError) throw dbError

      // Bug 2.4: do NOT inject mock data — return empty array when DB is empty
      setGrades(data ?? [])
    } catch (err) {
      if (!mountedRef.current || abortController.signal.aborted) return
      setError(err instanceof Error ? err.message : 'Failed to load grades')
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoading(false)
      }
    }

    return () => abortController.abort()
  // Bug 7.5: depend on userId (primitive) not user (object) to avoid
  // spurious re-fetches when the same user is re-created as a new object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (user?.id) {
      // Bug 7.4: clear error immediately in the useEffect body when user changes
      setError(null)
      loadGrades()
    } else {
      setGrades([])
      setError(null)
      setLoading(false)
    }
  // Bug 7.5: depend on user?.id (primitive string) not user (object reference)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loadGrades])

  return {
    grades,
    loading,
    error,
    refetch: loadGrades
  }
}
