'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

export default function ParentContactPage() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'parent') { router.push('/dashboard'); return }
    }, [loading, user, effectiveRole, router])

    if (loading || !user) return <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
    if (effectiveRole && effectiveRole !== 'parent') return null

    const send = () => {
        if (!message.trim()) return
        toast.success('Сообщение отправлено куратору')
        setMessage('')
    }

    return (
        <>
            <div className="g12">
                <div className="p-card span4">
                    <div className="sec-head"><div className="sec-title">Куратор</div></div>
                    <div
                        style={{
                            padding: '16px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--p-border)',
                            marginBottom: 16,
                        }}
                    >
                        <div className="t-label">Жанар Мұратқызы</div>
                        <div className="t-meta" style={{ marginTop: 4 }}>Куратор · ИС-21</div>
                        <div className="t-meta" style={{ marginTop: 4 }}>teacher@demo.edu</div>
                    </div>
                </div>

                <div className="p-card span8">
                    <div className="sec-head"><div className="sec-title">Написать сообщение</div></div>
                    <textarea
                        className="p-inp"
                        rows={6}
                        placeholder="Ваше сообщение куратору…"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{ resize: 'none', marginBottom: 12 }}
                    />
                    <button
                        type="button"
                        className="p-btn p-btn-cyan"
                        onClick={send}
                        style={{ justifyContent: 'center' }}
                    >
                        <Send /> Отправить сообщение
                    </button>
                </div>
            </div>
        </>
    )
}
