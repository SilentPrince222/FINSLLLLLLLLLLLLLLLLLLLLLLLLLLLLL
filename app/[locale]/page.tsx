'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import LoadingSpinner from '@/components/LoadingSpinner'

const roles = [
    { role: 'student', label: 'Student', icon: '◔', desc: 'Grades, schedule, materials', href: '/ru/dashboard' },
    { role: 'teacher', label: 'Teacher', icon: '◈', desc: 'Manage students', href: '/ru/teacher' },
    { role: 'parent', label: 'Parent', icon: '◯', desc: 'Child progress', href: '/ru/parent' },
    { role: 'admin', label: 'Admin', icon: '▤', desc: 'System control', href: '/ru/admin' },
]

export default function Home() {
    const router = useRouter()
    const { user, loading, getDashboardUrl } = useAuth()

    const locale = 'ru'
    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push(`/${locale}${getDashboardUrl()}`)
            } else {
                router.push(`/${locale}/auth/login`)
            }
        }
    }, [user, loading, router, getDashboardUrl])

    // Show loading while checking auth state
    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    )
}