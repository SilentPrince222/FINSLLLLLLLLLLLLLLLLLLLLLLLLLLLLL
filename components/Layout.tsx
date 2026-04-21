'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Home', icon: '◧' },
    { href: '/dashboard/students', label: 'Students', icon: '◔' },
    { href: '/dashboard/teachers', label: 'Teachers', icon: '◈' },
    { href: '/dashboard/timetable', label: 'Schedule', icon: '○' },
    { href: '/dashboard/library', label: 'Library', icon: '▤' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '◩' },
]

const bottomNavItems = [
    { href: '/dashboard', icon: '◧', label: 'Home' },
    { href: '/dashboard/students', icon: '◔', label: 'Students' },
    { href: '/dashboard/teachers', icon: '◈', label: 'Teachers' },
    { href: '/dashboard/timetable', icon: '○', label: 'Schedule' },
    { href: '/dashboard/analytics', icon: '◩', label: 'Analytics' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Sidebar - Fixed left */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-56 bg-white border-r border-slate-200 z-40 flex-col">
                {/* Logo */}
                <div className="h-14 flex items-center px-4 border-b border-slate-100">
                    <Link href="/" className="text-sm font-semibold text-slate-900 tracking-tight">
                        College Portal
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-colors ${
                                pathname === item.href 
                                    ? 'bg-slate-100 text-slate-900 font-medium' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <span className="text-xs w-5">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-slate-100">
                    <Link 
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-3 py-2.5 rounded text-sm text-slate-500 hover:text-primary hover:bg-slate-50"
                    >
                        <span className="text-xs w-5">⚙</span>
                        Settings
                    </Link>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40">
                <div className="flex items-center justify-between h-full px-4">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded"
                    >
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <Link href="/" className="text-sm font-medium text-primary">College</Link>
                    <div className="w-9" />
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-56 bg-white animate-slide-in">
                        <div className="h-14 flex items-center px-4 border-b border-slate-100">
                            <Link href="/" className="text-sm font-medium text-primary">College Portal</Link>
                        </div>
                        <nav className="p-3 space-y-0.5">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded text-sm ${
                                        pathname === item.href 
                                            ? 'bg-slate-100 text-primary font-medium' 
                                            : 'text-slate-500'
                                    }`}
                                >
                                    <span className="text-xs w-5">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="md:ml-56 pt-14 md:pt-0 pb-20 md:pb-0">
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40">
                <div className="flex items-center justify-around h-full">
                    {bottomNavItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 p-2 ${
                                pathname === item.href 
                                    ? 'text-primary' 
                                    : 'text-slate-400'
                            }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}