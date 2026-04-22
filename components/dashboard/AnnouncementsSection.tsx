import React from 'react'
import Card from '@/components/ui/Card'
import { AnnouncementCard } from '@/components/ui'

interface Announcement {
  id: number
  title: string
  date: string
  priority: 'high' | 'medium' | 'low'
}

interface AnnouncementsSectionProps {
  announcements: Announcement[] | null
}

export default function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
  const safeAnnouncements = announcements ?? []
  return (
    <Card variant="glass" className="lg:col-span-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <span className="text-xl">📢</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Announcements</h3>
      </div>
      <div className="space-y-3">
        {safeAnnouncements.map(ann => (
          <AnnouncementCard
            key={ann.id}
            title={ann.title}
            date={ann.date}
            priority={ann.priority}
          />
        ))}
      </div>
    </Card>
  )
}