'use client'

import { useMemo } from 'react'
import { usePathname } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import PortalShell from '@/components/portal/PortalShell'

const TITLE_BY_PATH: Record<string, string> = {
    '/admin': 'Админ-панель',
    '/admin/stats': 'Статистика',
    '/admin/settings': 'Настройки',
    '/admin/notifications': 'Уведомления',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user } = useAuth()

    const title = useMemo(() => TITLE_BY_PATH[pathname] ?? 'Админ-панель', [pathname])

    const meta = (user?.user_metadata as { full_name?: string } | null) ?? null
    const userName = meta?.full_name ?? user?.email ?? 'Администратор'

    return (
        <PortalShell role="admin" title={title} userName={userName} userSub="Администратор · CMS">
            {children}
        </PortalShell>
    )
}
