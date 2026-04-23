'use client'

import { useMemo } from 'react'
import { usePathname } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import PortalShell from '@/components/portal/PortalShell'

const TITLE_BY_PATH: Record<string, string> = {
    '/teacher': 'Панель преподавателя',
    '/teacher/grades': 'Журнал оценок',
    '/teacher/timetable': 'Расписание',
    '/teacher/notifications': 'Уведомления',
    '/teacher/profile': 'Профиль преподавателя',
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user } = useAuth()

    const title = useMemo(() => TITLE_BY_PATH[pathname] ?? 'Панель преподавателя', [pathname])

    const meta = (user?.user_metadata as { full_name?: string } | null) ?? null
    const userName = meta?.full_name ?? user?.email ?? 'Преподаватель'

    return (
        <PortalShell role="teacher" title={title} userName={userName} userSub="Преподаватель · КТИ">
            {children}
        </PortalShell>
    )
}
