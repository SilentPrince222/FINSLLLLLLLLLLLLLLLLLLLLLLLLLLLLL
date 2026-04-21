'use client'

import { useState } from 'react'
import { signUp } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import LoadingSpinner from './LoadingSpinner'

export default function RegisterForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<'student' | 'teacher' | 'parent' | 'admin'>('student')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await signUp(email, password, role)
            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="card p-8 max-w-md mx-auto text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2">Регистрация успешна</h3>
                <p className="text-muted">Перенаправляем на дашборд...</p>
            </div>
        )
    }

    return (
        <div className="card p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Регистрация
            </h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">ФИО</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input"
                        required
                        placeholder="Введите ваше имя"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        required
                        placeholder="example@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        required
                        minLength={6}
                        placeholder="Минимум 6 символов"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Выберите роль</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: 'student', label: 'Студент', icon: '🎓' },
                            { value: 'teacher', label: 'Преподаватель', icon: '👨‍🏫' },
                            { value: 'parent', label: 'Родитель', icon: '👨‍👩‍👧' },
                            { value: 'admin', label: 'Администратор', icon: '⚙️' },
                        ].map((r) => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setRole(r.value as any)}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${role === r.value
                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="text-lg">{r.icon}</div>
                                <div className="text-sm font-medium mt-1">{r.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 btn-primary mt-2"
                >
                    {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Зарегистрироваться'}
                </button>
            </form>
        </div>
    )
}