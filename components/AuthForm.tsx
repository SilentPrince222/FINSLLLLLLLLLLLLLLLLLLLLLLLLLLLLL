'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await signIn(email, password)
            if (error) throw error
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-6 text-center">
                Вход
            </h1>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Пароль</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 pr-12 border rounded input"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>



                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 btn-primary"
                >
                    {loading ? 'Загрузка...' : 'Войти'}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">Только для демонстрации</p>
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        router.push('/dashboard')
                    }}
                    className="w-full py-2 btn-ghost text-sm"
                >
                    🔓 Быстрый вход (посмотреть сайт)
                </button>
            </div>
        </div>
    )
}