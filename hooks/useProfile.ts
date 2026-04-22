import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getProfile } from '@/lib/database'

interface Profile {
  id: string
  email: string
  role: string
  full_name: string | null
  created_at: string
}

export function useProfile() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    setError(null)

    getProfile(userId).then(({ data, error: dbError }) => {
      if (!mounted) return
      if (dbError) {
        setError(dbError.message)
      } else {
        setProfile(data as Profile | null)
      }
      setLoading(false)
    })

    return () => { mounted = false }
  }, [userId])

  return { profile, loading, error }
}
