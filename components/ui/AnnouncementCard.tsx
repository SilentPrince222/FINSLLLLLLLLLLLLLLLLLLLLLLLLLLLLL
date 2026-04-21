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
    <div className={`p-3 rounded-lg bg-muted/30 border-l-4 ${priorityColors[priority]} ${className}`}>
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1">{date}</p>
    </div>
  )
}