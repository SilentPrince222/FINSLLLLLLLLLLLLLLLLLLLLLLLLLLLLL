import React from 'react'
import Card from '@/components/ui/Card'

interface Event {
  id: number
  title: string
  date: string
  time: string
  description: string
  type: 'exam' | 'homework' | 'activity' | 'holiday' | 'social'
  author?: string
  likes?: number
  comments?: number
}

interface EventCardProps {
  event: Event
  onLike?: (_id: number) => void
  onComment?: (_id: number) => void
}

export default function EventCard({ event, onLike, onComment }: EventCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return '📝'
      case 'homework': return '📚'
      case 'activity': return '🎉'
      case 'holiday': return '🏖️'
      case 'social': return '👥'
      default: return '📅'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'from-red-500 to-red-600'
      case 'homework': return 'from-yellow-500 to-yellow-600'
      case 'activity': return 'from-blue-500 to-blue-600'
      case 'holiday': return 'from-green-500 to-green-600'
      case 'social': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card variant="elevated" className="mb-6 overflow-hidden">
      {/* Event Header */}
      <div className="flex items-start gap-3 p-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(event.type)} flex items-center justify-center text-white text-xl`}>
          {getTypeIcon(event.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{event.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(event.type)} text-white`}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(event.date)}</span>
            <span>at {event.time}</span>
            {event.author && <span>by {event.author}</span>}
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div className="px-4 pb-4">
        <p className="text-foreground">{event.description}</p>
      </div>

      {/* Event Actions */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onLike?.(event.id)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
            >
              <span>❤️</span>
              <span>{event.likes || 0}</span>
            </button>
            <button
              onClick={() => onComment?.(event.id)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <span>💬</span>
              <span>{event.comments || 0}</span>
            </button>
          </div>
          <button className="text-sm text-accent hover:underline">
            View Details
          </button>
        </div>
      </div>
    </Card>
  )
}