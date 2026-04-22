'use client'

import { useMemo } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import Notifications from '@/components/Notifications'
import LanguageThemeSwitcher from '@/components/LanguageThemeSwitcher'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const t = useTranslations('navigation')

    // Bug 4.6: memoize navItems so every render doesn't produce a new array
    // reference — prevents downstream components re-rendering unnecessarily
    const navItems = useMemo(() => [
        { href: '/dashboard', label: t('home'), icon: '🏠' },
        { href: '/dashboard/grades', label: t('grades'), icon: '📊' },
        { href: '/dashboard/timetable', label: t('timetable'), icon: '📅' },
        { href: '/dashboard/events', label: t('events'), icon: '🎯' },
        { href: '/dashboard/materials', label: t('materials'), icon: '📚' },
        { href: '/dashboard/analytics', label: t('analytics'), icon: '📈' },
        { href: '/dashboard/profile', label: t('profile'), icon: '👤' },
    ], [t])

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark">
            <header className="bg-card dark:bg-card-dark shadow-sm border-b border-border dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-accent dark:text-accent-dark">
                        College System
                    </Link>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex gap-1">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                        pathname === item.href
                                            ? 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-dark'
                                            : 'text-muted-foreground dark:text-muted-foreground-dark hover:bg-muted/50 dark:hover:bg-muted/20 hover:text-foreground dark:hover:text-foreground-dark'
                                    }`}
                                >
                                    <span className="mr-1">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <LanguageThemeSwitcher />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {children}
            </main>

            <aside className="fixed bottom-4 right-4 z-50">
                <Notifications />
            </aside>
        </div>
    )
}