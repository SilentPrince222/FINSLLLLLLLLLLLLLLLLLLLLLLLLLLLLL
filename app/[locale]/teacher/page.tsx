'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { createGrade } from '@/lib/database'
import { SEMESTER, SUBJECTS } from '@/lib/constants'
import type { Database } from '@/types/database'
import PortalShell from '@/components/portal/PortalShell'
import { Check, TrendingUp } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

function initials(name: string | null | undefined): string {
  if (!name) return '??'
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('')
}

function gradeColorVar(score: number): string {
  if (score >= 85) return 'var(--p-success)'
  if (score >= 70) return 'var(--p-amber)'
  return 'var(--p-danger)'
}

export default function TeacherDashboard() {
    const router = useRouter()
    const { user, role, loading } = useAuth()

    const [students, setStudents] = useState<Profile[]>([])
    const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0])
    const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({})
    const [savingId, setSavingId] = useState<string | null>(null)
    const [loadingStudents, setLoadingStudents] = useState(true)

    useEffect(() => {
        if (loading) return
        if (!user) { router.push('/auth/login'); return }
        if (role && role !== 'teacher') { router.push('/dashboard'); return }
    }, [loading, user, role, router])

    const effectiveRole = role ?? ((user?.user_metadata as { role?: string } | undefined)?.role ?? null)

    useEffect(() => {
        if (!user || effectiveRole !== 'teacher') return
        let cancelled = false
        ;(async () => {
            setLoadingStudents(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .order('full_name')
            if (cancelled) return
            if (error) toast.error('Не удалось загрузить студентов')
            else setStudents((data ?? []) as Profile[])
            setLoadingStudents(false)
        })()
        return () => { cancelled = true }
    }, [user, effectiveRole])

    if (loading || !user) {
        return (
            <PortalShell role="teacher" title="Панель преподавателя">
                <div style={{ padding: 48, textAlign: 'center' }} className="t-muted">Загрузка…</div>
            </PortalShell>
        )
    }
    if (effectiveRole && effectiveRole !== 'teacher') return null

    async function handleSave(studentId: string) {
        if (savingId) return
        const raw = scoreDrafts[studentId] ?? ''
        const score = parseInt(raw, 10)
        if (!Number.isFinite(score) || score < 0 || score > 100) {
            toast.error('Оценка должна быть от 0 до 100')
            return
        }
        setSavingId(studentId)
        const { data, error } = await createGrade({
            student_id: studentId,
            teacher_id: user!.id,
            subject: selectedSubject,
            score,
            semester: SEMESTER,
            comment: null,
        })
        setSavingId(null)
        if (error || !data) { toast.error('Не удалось сохранить оценку'); return }
        toast.success(`Оценка ${score} (${selectedSubject})`)
        setScoreDrafts(prev => ({ ...prev, [studentId]: '' }))
    }

    const totalStudents = students.length
    const averageScore = students.length
        ? Math.round((students.reduce((s, p) => s + (p.attendance_rate ?? 0), 0) / students.length) * 10) / 10
        : 0

    const teacherName = (user.user_metadata as any)?.full_name ?? 'Преподаватель'

    return (
        <PortalShell role="teacher" title="Панель преподавателя" userName={teacherName} userSub="Преподаватель · КТИ">
            {/* Top stats */}
            <div className="g12" style={{ marginBottom: 18 }}>
                <div className="p-card magenta span3">
                    <div className="clabel">Мои студенты</div>
                    <div className="cvalue">{totalStudents}</div>
                    <div className="cdelta">Активных</div>
                </div>
                <div className="p-card span3">
                    <div className="clabel">Ср. посещаемость</div>
                    <div className="cvalue">{averageScore || '—'}<span style={{ color: 'var(--p-fg4)' }}>%</span></div>
                    <div className="cdelta up"><TrendingUp /> По всем группам</div>
                </div>
                <div className="p-card span3">
                    <div className="clabel">Семестр</div>
                    <div className="t-h3" style={{ marginTop: 10 }}>{SEMESTER}</div>
                    <div className="p-num t-meta" style={{ marginTop: 8 }}>Неделя 14 из 18</div>
                    <div className="bar-track" style={{ marginTop: 10 }}><div className="bar-fill m" style={{ width: '77%' }} /></div>
                </div>
                <div className="p-card span3">
                    <div className="clabel">Предметов</div>
                    <div className="cvalue">{SUBJECTS.length}</div>
                    <div className="cdelta">В работе</div>
                </div>
            </div>

            <div className="g12">
                {/* Журнал оценок */}
                <div className="p-card span8">
                    <div className="sec-head">
                        <div className="sec-title">Журнал оценок</div>
                        <select
                            className="p-inp"
                            style={{ width: 'auto', padding: '8px 12px' }}
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                        >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {loadingStudents ? (
                        <div className="t-muted" style={{ padding: 36, textAlign: 'center' }}>Загрузка…</div>
                    ) : students.length === 0 ? (
                        <div className="t-muted" style={{ padding: 36, textAlign: 'center' }}>
                            Студентов нет. Запусти `npm run seed`.
                        </div>
                    ) : (
                        <div style={{ maxHeight: 440, overflowY: 'auto', overflowX: 'auto', margin: '0 -14px' }}>
                            <table className="p-tbl">
                                <thead>
                                    <tr>
                                        <th>Студент</th>
                                        <th>Группа</th>
                                        <th>Посещ.</th>
                                        <th>Выставить</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => {
                                        const attendance = s.attendance_rate ?? 0
                                        const color = gradeColorVar(attendance)
                                        return (
                                            <tr key={s.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                                                        <div className="av" style={{ width: 28, height: 28 }}>{initials(s.full_name)}</div>
                                                        <span style={{ fontWeight: 500, color: 'var(--p-fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {s.full_name ?? s.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td><span className="pill">{s.group_name ?? '—'}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span className="p-num" style={{ color, minWidth: 28 }}>{attendance}</span>
                                                        <div className="bar-track" style={{ width: 72, marginTop: 0 }}>
                                                            <div className="bar-fill" style={{ width: `${attendance}%`, background: color }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap' }}>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            value={scoreDrafts[s.id] ?? ''}
                                                            onChange={e => setScoreDrafts(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                            className="p-inp"
                                                            style={{ width: 64, padding: '6px 10px', textAlign: 'center' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="p-btn p-btn-cyan p-btn-sm p-btn-icon"
                                                            onClick={() => handleSave(s.id)}
                                                            disabled={savingId === s.id || !scoreDrafts[s.id]}
                                                            title="Сохранить"
                                                        >
                                                            <Check />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="span4" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div className="p-card">
                        <div className="sec-head"><div className="sec-title">Предметы</div></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {SUBJECTS.map((s, i) => (
                                <div key={s} className="slot" style={{ marginBottom: 0 }}>
                                    <div className="slot-body">
                                        <div className="slot-subj">{s}</div>
                                    </div>
                                    <span className={`pill ${i === 0 ? 'magenta' : ''}`}>ИС-22</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-card">
                        <div className="clabel">Семестр</div>
                        <div className="t-h3" style={{ marginTop: 10 }}>{SEMESTER}</div>
                        <div className="p-num t-meta" style={{ marginTop: 6 }}>Неделя 14 из 18</div>
                        <div className="bar-track" style={{ marginTop: 10 }}><div className="bar-fill m" style={{ width: '77%' }} /></div>
                    </div>
                </div>
            </div>
        </PortalShell>
    )
}
