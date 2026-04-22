'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Button from '@/components/Button'
import ErrorMessage from '@/components/ErrorMessage'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn, refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) throw error

      // Refresh user state and redirect
      setTimeout(() => {
        refreshUser()
        router.push('/')
      }, 100)
    } catch (_err: any) {
      // Bug 1.12: show a generic message — never expose raw Supabase error to users
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'student' | 'teacher' | 'admin') => {
    setLoading(true)
    setError('')

    const demoCredentials = {
      student: { email: 'student@demo.com', password: 'demo123' },
      teacher: { email: 'teacher@demo.com', password: 'demo123' },
      admin: { email: 'admin@demo.com', password: 'demo123' }
    }

    try {
      const { error } = await signIn(demoCredentials[role].email, demoCredentials[role].password)
      if (error) throw error

      // Refresh user state and redirect
      setTimeout(() => {
        refreshUser()
        router.push('/')
      }, 100)
    } catch (_err: any) {
      // Bug 1.12: show a generic message — never expose raw Supabase error to users
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">College Portal</h1>
          <p className="mt-2 text-sm text-slate-600">Войдите в свою учетную запись</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Демо аккаунты</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('student')}
                disabled={loading}
                className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
              >
                Студент
              </button>
              <button
                onClick={() => handleDemoLogin('teacher')}
                disabled={loading}
                className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
              >
                Преподаватель
              </button>
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100 disabled:opacity-50"
              >
                Админ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}