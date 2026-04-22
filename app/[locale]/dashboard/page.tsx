'use client'

import { useState, useEffect } from 'react'
import { useAuth, signOut } from '@/lib/auth'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/ui/Navigation'
import { useGrades, useTimetable, useEvents } from '@/hooks'
import {
  UpNextSection,
  DeadlinesSection,
  StudentQuickLinksSection,
  NewsFeedSection,
  GradesSummarySection
} from '@/components/dashboard'

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) ?? 'ru'
    const { grades, loading: gradesLoading, recentIds } = useGrades()
    const { entries: timetable, loading: timetableLoading } = useTimetable()
    const { events, loading: eventsLoading } = useEvents()

    const [news, setNews] = useState<any[]>([])

    useEffect(() => {
        let mounted = true
        if (mounted) {
            setNews([
                {
                    id: 1,
                    title: 'New AI Research Lab Opens',
                    date: '2026-04-15',
                    preview: 'Our college has launched a cutting-edge AI research facility featuring the latest quantum computing technology.',
                    image: '/images/news/ai-lab.jpg'
                },
                {
                    id: 2,
                    title: 'Student Innovation Awards 2026',
                    date: '2026-04-10',
                    preview: 'Congratulations to our students who won national innovation awards for their sustainable energy projects.',
                    image: '/images/news/awards.jpg'
                },
                {
                    id: 3,
                    title: 'International Conference Hosted',
                    date: '2026-04-05',
                    preview: 'We successfully hosted the annual International Technology Conference with speakers from top global companies.',
                    image: '/images/news/conference.jpg'
                }
            ])
        }
        return () => { mounted = false }
    }, [])

    if (authLoading || gradesLoading || timetableLoading || eventsLoading) {
        return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Пожалуйста, войдите в систему</p>
            </div>
        )
    }

    const navItems = [
        { label: 'Dashboard', href: `/${locale}/dashboard`, icon: '📊', onClick: () => router.push(`/${locale}/dashboard`) },
        { label: 'Grades', href: `/${locale}/dashboard/grades`, icon: '📚', onClick: () => router.push(`/${locale}/dashboard/grades`) },
        { label: 'Timetable', href: `/${locale}/dashboard/timetable`, icon: '📅', onClick: () => router.push(`/${locale}/dashboard/timetable`) },
        { label: 'Events', href: `/${locale}/dashboard/events`, icon: '📅', onClick: () => router.push(`/${locale}/dashboard/events`) },
        { label: 'Sign Out', href: `/${locale}`, icon: '🚪', onClick: () => signOut().then(() => router.push(`/${locale}`)) },
    ]

    return (
        <div className="flex min-h-screen bg-background">
            <Navigation items={navItems} />

            <main className="flex-1 p-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Student Dashboard Widgets */}
                    <div className="grid grid-cols-12 gap-6 auto-rows-min">
                        {/* Up Next - Next class */}
                        <UpNextSection timetable={timetable.map(t => ({ id: t.id, subject: t.subject, day: t.day, start_time: t.start_time, end_time: t.end_time, room: t.room }))} />

                        {/* Grades Summary - GPA and weekly progress */}
                        <GradesSummarySection grades={grades} recentIds={recentIds} />

                        {/* Deadlines - Tasks due soon */}
                        <DeadlinesSection events={events} />

                        {/* Quick Links - Essential resources */}
                        <StudentQuickLinksSection />

                        {/* News Feed - College updates */}
                        <NewsFeedSection news={news} />
                    </div>
                </div>
            </main>
        </div>
    )
}
