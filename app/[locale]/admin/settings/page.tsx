'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { SEMESTER } from '@/lib/constants'

export default function AdminSettingsPage() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)
    const [semester, setSemester] = useState<string>(SEMESTER)
    const [collegeName, setCollegeName] = useState('KTI Academy')

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'admin') { router.push('/dashboard'); return }
    }, [loading, user, effectiveRole, router])

    if (loading || !user) return <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
    if (effectiveRole && effectiveRole !== 'admin') return null

    return (
        <>
            <div className="g12">
                <div className="p-card span6">
                    <div className="sec-head"><div className="sec-title">Основные настройки</div></div>
                    <div className="p-field">
                        <label>Название учреждения</label>
                        <input
                            className="p-inp"
                            value={collegeName}
                            onChange={e => setCollegeName(e.target.value)}
                        />
                    </div>
                    <div className="p-field" style={{ marginTop: 12 }}>
                        <label>Текущий семестр</label>
                        <input
                            className="p-inp"
                            value={semester}
                            onChange={e => setSemester(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="p-btn p-btn-cyan"
                        style={{ marginTop: 16, justifyContent: 'center' }}
                        onClick={() => toast.success('Настройки сохранены')}
                    >
                        Сохранить
                    </button>
                </div>

                <div className="p-card span6">
                    <div className="sec-head"><div className="sec-title">Безопасность</div></div>
                    <div className="p-field">
                        <label>Новый пароль администратора</label>
                        <input className="p-inp" type="password" placeholder="••••••••" />
                    </div>
                    <div className="p-field" style={{ marginTop: 12 }}>
                        <label>Подтвердить пароль</label>
                        <input className="p-inp" type="password" placeholder="••••••••" />
                    </div>
                    <button
                        type="button"
                        className="p-btn p-btn-ghost"
                        style={{ marginTop: 16, justifyContent: 'center' }}
                        onClick={() => toast.info('Пароль обновлён')}
                    >
                        Сменить пароль
                    </button>
                </div>
            </div>
        </>
    )
}
