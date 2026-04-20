'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Notifications from '@/components/Notifications'

const navItems = [
    { href: '/dashboard', label: 'Главная', icon: '🏠' },
    { href: '/dashboard/grades', label: 'Оценки', icon: '📊' },
    { href: '/dashboard/timetable', label: 'Расписание', icon: '📅' },
    { href: '/dashboard/events', label: 'События', icon: '🎯' },
    { href: '/dashboard/materials', label: 'Материалы', icon: '📚' },
    { href: '/dashboard/analytics', label: 'Аналитика', icon: '📈' },
    { href: '/dashboard/profile', label: 'Профиль', icon: '👤' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        College System
                    </Link>
                    <nav className="hidden md:flex gap-1">
                        {navItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    pathname === item.href
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span className="mr-1">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
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