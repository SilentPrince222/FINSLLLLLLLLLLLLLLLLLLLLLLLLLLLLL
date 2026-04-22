'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from '@/i18n/routing'
import { useAuth } from '@/lib/auth'
import LandingPage from '@/components/landing/LandingPage'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
    const router = useRouter()
    const pathname = usePathname()
    const { user, loading, getDashboardUrl } = useAuth()

    useEffect(() => {
        if (loading || !user) return
        const dest = getDashboardUrl()
        if (pathname === dest) return
        router.replace(dest as never)
    }, [user, loading, getDashboardUrl, pathname, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#05050A]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#05050A]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return <LandingPage />
}
