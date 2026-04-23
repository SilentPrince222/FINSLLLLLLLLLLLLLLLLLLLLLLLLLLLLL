'use client'

import { useMemo } from 'react'
import { usePathname } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import PortalShell from '@/components/portal/PortalShell'

const TITLE_BY_PATH: Record<string, string> = {
    '/parent': 'Кабинет родителя',
    '/parent/timetable': 'Расписание',
    '/parent/contact': 'Связаться с куратором',
    '/parent/notifications': 'Уведомления',
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user } = useAuth()

    const title = useMemo(() => TITLE_BY_PATH[pathname] ?? 'Кабинет родителя', [pathname])

    const meta = (user?.user_metadata as { full_name?: string } | null) ?? null
    const userName = meta?.full_name ?? user?.email ?? 'Родитель'

    return (
        <PortalShell role="parent" title={title} userName={userName} userSub="Родитель · ИС-21">
            {children}
        </PortalShell>
    )
}
