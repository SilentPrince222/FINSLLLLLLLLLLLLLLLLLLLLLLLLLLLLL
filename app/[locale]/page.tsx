'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home({ params }: { params?: { locale?: string } }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, loading, getDashboardUrl } = useAuth()

    // Bug 10.4: read locale from params, not hardcoded 'ru'
    const locale = (params && params.locale) ? params.locale : (pathname.split('/')[1] || 'ru')

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Bug 10.5: use replace so there is no extra history entry and
                // the redirect fires in the same microtask after loading resolves
                router.replace(`/${locale}${getDashboardUrl()}`)
            } else {
                router.replace(`/${locale}/auth/login`)
            }
        }
    }, [user, loading, router, getDashboardUrl, locale])

    // Render nothing while loading — show spinner only during the auth check
    // so there is no flash of content if the redirect fires immediately
    if (!loading && !user) return null

    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    )
}