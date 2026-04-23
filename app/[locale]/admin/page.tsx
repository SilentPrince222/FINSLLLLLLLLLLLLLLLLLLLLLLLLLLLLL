'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import PortalShell from '@/components/portal/PortalShell'
import { TrendingUp, Plus, Search, Pencil, Trash2 } from 'lucide-react'

type Role = 'student' | 'teacher' | 'parent' | 'admin'

type User = {
    id: number
    name: string
    email: string
    role: Role
    group?: string
    status: 'active' | 'inactive'
}

const mockUsers: User[] = [
    { id: 1, name: 'Айдар Алимов', email: 'aidar.alimov@demo.edu', role: 'student', group: 'ИС-22', status: 'active' },
    { id: 2, name: 'Айгерим Серикбаева', email: 'aigerim.s@demo.edu', role: 'student', group: 'ИС-22', status: 'active' },
    { id: 3, name: 'Болат Нұрмағамбет', email: 'bolat@demo.edu', role: 'student', group: 'ИС-22', status: 'active' },
    { id: 4, name: 'Жанар Мұратқызы', email: 'teacher@demo.edu', role: 'teacher', status: 'active' },
    { id: 5, name: 'Асель Касымова', email: 'asel.kasymova@demo.edu', role: 'parent', status: 'active' },
    { id: 6, name: 'Нурлан Сейтжан', email: 'admin@demo.edu', role: 'admin', status: 'active' },
    { id: 7, name: 'Дана Абенова', email: 'dana@demo.edu', role: 'teacher', status: 'inactive' },
]

type RoleMeta = { label: string; pill: string; bg: string; border: string; color: string }
const ROLE_META: Record<Role, RoleMeta> = {
    student: { label: 'Студент', pill: 'cyan', bg: 'rgba(110,231,245,0.06)', border: 'rgba(110,231,245,0.28)', color: 'var(--p-accent)' },
    teacher: { label: 'Преподаватель', pill: 'magenta', bg: 'rgba(199,168,255,0.06)', border: 'rgba(199,168,255,0.28)', color: 'var(--p-role-teacher)' },
    parent: { label: 'Родитель', pill: 'success', bg: 'rgba(134,229,182,0.06)', border: 'rgba(134,229,182,0.28)', color: 'var(--p-role-parent)' },
    admin: { label: 'Администратор', pill: 'amber', bg: 'rgba(233,196,139,0.06)', border: 'rgba(233,196,139,0.28)', color: 'var(--p-role-admin)' },
}

function initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('')
}

export default function AdminDashboard() {
    const router = useRouter()
    const { user, role, loading } = useAuth()
    const [users, setUsers] = useState<User[]>(mockUsers)
    const [filter, setFilter] = useState<string>('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [search, setSearch] = useState('')

    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (effectiveRole && effectiveRole !== 'admin') { router.push('/dashboard'); return }
    }, [user, effectiveRole, loading, router])

    if (loading || !user) {
        return (
            <PortalShell role="admin" title="Админ-панель">
                <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
            </PortalShell>
        )
    }
    if (effectiveRole && effectiveRole !== 'admin') return null

    const filteredUsers = users.filter(u => {
        if (filter !== 'all' && u.role !== filter) return false
        if (search && !u.name.toLowerCase().includes(search.toLowerCase())
            && !u.email.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        parents: users.filter(u => u.role === 'parent').length,
    }

    const deleteUser = (id: number) => {
        if (confirm('Удалить пользователя?')) setUsers(users.filter(u => u.id !== id))
    }

    const adminName = (user.user_metadata as any)?.full_name ?? 'Администратор'

    return (
        <PortalShell role="admin" title="Админ-панель" userName={adminName} userSub="Администратор · CMS">
            {/* Stat cards */}
            <div className="g4" style={{ marginBottom: 18 }}>
                <div className="p-card cyan">
                    <div className="clabel">Всего пользователей</div>
                    <div className="cvalue">{stats.total}</div>
                    <div className="cdelta up"><TrendingUp /> +42 за семестр</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Студентов</div>
                    <div className="cvalue">{stats.students}</div>
                    <div className="cdelta">4 специальности</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Преподавателей</div>
                    <div className="cvalue">{stats.teachers}</div>
                    <div className="cdelta up"><TrendingUp /> +3 в семестре</div>
                </div>
                <div className="p-card">
                    <div className="clabel">Родителей</div>
                    <div className="cvalue">{stats.parents}</div>
                    <div className="cdelta">Активных аккаунтов</div>
                </div>
            </div>

            {/* Users table */}
            <div className="p-card">
                <div className="sec-head" style={{ marginBottom: 18 }}>
                    <div className="sec-title">Управление пользователями</div>
                    <button type="button" className="p-btn p-btn-cyan p-btn-sm" onClick={() => setShowAddModal(true)}>
                        <Plus /> Добавить
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                        <Search
                            style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)',
                                width: 14, height: 14,
                                color: 'var(--p-fg4)', pointerEvents: 'none', strokeWidth: 1.75,
                            }}
                        />
                        <input
                            className="p-inp"
                            placeholder="Поиск по имени или email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 36 }}
                        />
                    </div>
                    <select
                        className="p-inp"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ width: 'auto', minWidth: 160 }}
                    >
                        <option value="all">Все роли</option>
                        <option value="student">Студенты</option>
                        <option value="teacher">Преподаватели</option>
                        <option value="parent">Родители</option>
                        <option value="admin">Администраторы</option>
                    </select>
                </div>

                <div style={{ overflowX: 'auto', margin: '0 -14px' }}>
                    <table className="p-tbl">
                        <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Группа</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => {
                                const r = ROLE_META[u.role]
                                const statusPill = u.status === 'active' ? 'success' : 'danger'
                                const statusLabel = u.status === 'active' ? 'Активен' : 'Заблокирован'
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                                                <div
                                                    className="av"
                                                    style={{ width: 28, height: 28, background: r.bg, border: `1px solid ${r.border}`, color: r.color }}
                                                >
                                                    {initials(u.name)}
                                                </div>
                                                <span style={{ fontWeight: 500, color: 'var(--p-fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {u.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td><span className="p-num t-meta">{u.email}</span></td>
                                        <td><span className={`pill ${r.pill}`}>{r.label}</span></td>
                                        <td><span className="t-muted">{u.group ?? '—'}</span></td>
                                        <td><span className={`pill ${statusPill}`}>{statusLabel}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                                                <button type="button" className="p-btn p-btn-ghost p-btn-sm p-btn-icon" title="Изменить">
                                                    <Pencil />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="p-btn p-btn-danger p-btn-sm p-btn-icon"
                                                    onClick={() => deleteUser(u.id)}
                                                    title="Удалить"
                                                >
                                                    <Trash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="t-meta" style={{ padding: 36, textAlign: 'center' }}>Пользователи не найдены</div>
                )}
            </div>

            {showAddModal && (
                <div className="modal-bg" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Добавить пользователя</h3>
                        <div className="p-field">
                            <label>Имя</label>
                            <input className="p-inp" type="text" placeholder="Полное имя" />
                        </div>
                        <div className="p-field">
                            <label>Email</label>
                            <input className="p-inp" type="email" placeholder="name@ktiacademy.kz" />
                        </div>
                        <div className="g2">
                            <div className="p-field">
                                <label>Роль</label>
                                <select className="p-inp">
                                    <option>Студент</option>
                                    <option>Преподаватель</option>
                                    <option>Родитель</option>
                                    <option>Администратор</option>
                                </select>
                            </div>
                            <div className="p-field">
                                <label>Группа</label>
                                <input className="p-inp" type="text" placeholder="ИС-22" />
                            </div>
                        </div>
                        <div className="p-field">
                            <label>Пароль</label>
                            <input className="p-inp" type="password" placeholder="••••••••" />
                        </div>
                        <div className="modal-foot">
                            <button type="button" className="p-btn p-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>
                                Отмена
                            </button>
                            <button type="button" className="p-btn p-btn-cyan" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PortalShell>
    )
}
