'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        name: 'Айдар Алимов',
        email: 'aidar.alimov@demo.edu',
        phone: '+7 (701) 123-45-67',
        group: 'ИС-22',
        bio: 'Студент факультета информационных технологий. Интересуюсь программированием и искусственным интеллектом.',
        notifications: true,
        emailNotifications: true,
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        await new Promise(r => setTimeout(r, 1000))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const initials = formData.name.split(' ').slice(0, 2).map(s => s[0]).join('')

    return (
        <div className="g12">
            <div className="span4" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="p-card" style={{ textAlign: 'center', padding: 28 }}>
                    <div
                        className="av"
                        style={{
                            width: 88, height: 88, fontSize: 22,
                            background: 'rgba(110,231,245,0.1)',
                            border: '1px solid rgba(110,231,245,0.3)',
                            color: 'var(--p-accent)',
                            margin: '0 auto 14px',
                        }}
                    >
                        {initials}
                    </div>
                    <div className="t-h3">{formData.name}</div>
                    <div className="p-num t-meta" style={{ marginTop: 6 }}>{formData.group}</div>
                    <button type="button" className="p-btn p-btn-ghost p-btn-sm" style={{ marginTop: 14 }}>
                        Сменить фото
                    </button>
                </div>

                <div className="p-card">
                    <div className="sec-head"><div className="sec-title">Статистика</div></div>
                    <div className="row-item"><span className="t-meta">Средний балл</span><span className="p-num t-label">82%</span></div>
                    <div className="row-item"><span className="t-meta">Предметов</span><span className="p-num t-label">8</span></div>
                    <div className="row-item"><span className="t-meta">Событий</span><span className="p-num t-label">4</span></div>
                    <div className="row-item"><span className="t-meta">В системе с</span><span className="p-num t-label">Сен 2025</span></div>
                </div>
            </div>

            <div className="span8">
                <form onSubmit={handleSubmit} className="p-card">
                    <div className="sec-head"><div className="sec-title">Основная информация</div></div>
                    <div className="g2">
                        <div className="p-field">
                            <label>Имя</label>
                            <input type="text" className="p-inp" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="p-field">
                            <label>Email</label>
                            <input type="email" className="p-inp" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="p-field">
                            <label>Телефон</label>
                            <input type="tel" className="p-inp" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="p-field">
                            <label>Группа</label>
                            <input type="text" className="p-inp" value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value })} />
                        </div>
                    </div>
                    <div className="p-field">
                        <label>О себе</label>
                        <textarea className="p-inp" rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                    </div>

                    <div className="sec-head" style={{ marginTop: 18 }}><div className="sec-title">Уведомления</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.notifications} onChange={e => setFormData({ ...formData, notifications: e.target.checked })} />
                            <span className="t-label">Включить уведомления</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.emailNotifications} onChange={e => setFormData({ ...formData, emailNotifications: e.target.checked })} />
                            <span className="t-label">Email-уведомления</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 20 }}>
                        <button type="submit" className="p-btn p-btn-cyan" disabled={saving}>
                            {saving ? 'Сохранение…' : 'Сохранить'}
                        </button>
                        {saved && (
                            <span className="p-num t-meta" style={{ color: 'var(--p-success)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Check style={{ width: 13, height: 13 }} /> Сохранено
                            </span>
                        )}
                    </div>
                </form>

                <div className="p-card" style={{ marginTop: 18 }}>
                    <div className="sec-head"><div className="sec-title">Безопасность</div></div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button type="button" className="p-btn p-btn-ghost p-btn-sm">Сменить пароль</button>
                        <button type="button" className="p-btn p-btn-danger p-btn-sm">Удалить аккаунт</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
