import React from 'react'

interface AnnouncementCardProps {
  title: string
  date: string
  priority?: 'high' | 'medium' | 'low'
  className?: string
}

export default function AnnouncementCard({ title, date, priority = 'medium', className = '' }: AnnouncementCardProps) {
  const priorityColors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-green-300 bg-green-50'
  }

  return (
    // Bug 5.13: priority is conveyed by color only — add a visible text label
    // and an aria-label on the container so screen readers get the priority
    <div
      aria-label={`${priority} priority announcement`}
      className={`p-3 rounded-lg bg-muted/30 border-l-4 ${priorityColors[priority]} ${className}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <span className="text-xs font-medium capitalize text-muted-foreground">{priority}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{date}</p>
    </div>
  )
}