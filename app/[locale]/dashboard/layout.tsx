'use client'

import { useMemo } from 'react'
import { usePathname } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import PortalShell from '@/components/portal/PortalShell'

const TITLE_BY_PATH: Record<string, string> = {
    '/dashboard': 'Кабинет студента',
    '/dashboard/grades': 'Оценки',
    '/dashboard/timetable': 'Расписание',
    '/dashboard/events': 'События',
    '/dashboard/materials': 'Материалы',
    '/dashboard/analytics': 'Аналитика',
    '/dashboard/analyze': 'AI-анализ',
    '/dashboard/profile': 'Профиль',
    '/dashboard/library': 'Библиотека',
    '/dashboard/consultation': 'Консультации',
    '/dashboard/curator': 'Куратор',
    '/dashboard/qr': 'QR-пропуск',
    '/dashboard/students': 'Студенты',
    '/dashboard/teachers': 'Преподаватели',
    '/dashboard/components': 'Компоненты',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user } = useAuth()

    const title = useMemo(() => {
        return TITLE_BY_PATH[pathname] ?? 'Портал'
    }, [pathname])

    const metaAny = (user?.user_metadata as any) ?? null
    const userName = metaAny?.full_name ?? user?.email ?? 'Студент'
    const userSub = metaAny?.group_name ? `Студент · ${metaAny.group_name}` : 'Студент · ИС-22'

    return (
        <PortalShell role="student" title={title} userName={userName} userSub={userSub}>
            {children}
        </PortalShell>
    )
}
