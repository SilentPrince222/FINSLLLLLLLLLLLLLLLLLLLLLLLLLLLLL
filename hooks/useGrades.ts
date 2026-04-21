import { useState, useEffect, useCallback } from 'react'
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
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGrades = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await getGrades(user.id)
      if (dbError) throw dbError

      // If no data in database, use mock data for development
      if (!data || data.length === 0) {
        const mockGrades = [
          { id: 1, student_id: user.id, subject: 'Математика', score: 85, semester: '2026-1', created_at: '2026-04-10T10:00:00Z' },
          { id: 2, student_id: user.id, subject: 'Физика', score: 78, semester: '2026-1', created_at: '2026-04-09T10:00:00Z' },
          { id: 3, student_id: user.id, subject: 'Программирование', score: 92, semester: '2026-1', created_at: '2026-04-08T10:00:00Z' },
          { id: 4, student_id: user.id, subject: 'Английский', score: 88, semester: '2026-1', created_at: '2026-04-07T10:00:00Z' },
          { id: 5, student_id: user.id, subject: 'Математика', score: 90, semester: '2026-1', created_at: '2026-04-05T10:00:00Z' },
        ]
        setGrades(mockGrades)
      } else {
        setGrades(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grades')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadGrades()
    }
  }, [user, loadGrades])

  return {
    grades,
    loading,
    error,
    refetch: loadGrades
  }
}