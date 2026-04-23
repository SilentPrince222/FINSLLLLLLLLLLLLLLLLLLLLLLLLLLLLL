'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomeClient({ locale }: { locale: string }) {
    const router = useRouter()
    const { user, loading, getDashboardUrl } = useAuth()

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push(`/${locale}${getDashboardUrl()}`)
            } else {
                router.push(`/${locale}/auth/login`)
            }
        }
    }, [user, loading, router, getDashboardUrl, locale])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    )
}