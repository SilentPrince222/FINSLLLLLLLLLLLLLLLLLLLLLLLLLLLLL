import React from 'react'
import { useTranslations } from 'next-intl'
import Card from '@/components/ui/Card'

interface Event {
  id: number
  title: string
  due_date: string
  description: string | null
  type: string
  priority: string
}

interface DeadlinesSectionProps {
  events?: Event[]
}

export default function DeadlinesSection({ events = [] }: DeadlinesSectionProps) {
  const t = useTranslations('dashboard')
  // Filter events that are deadlines (exams, homework)
  const deadlineTypes = ['exam', 'homework']
  const deadlines = events.filter(event => deadlineTypes.includes(event.type))

  const upcomingDeadlines = deadlines.filter(d => {
    const dueDate = new Date(d.due_date)
    const now = new Date()
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= 48
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimeRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours < 1) {
      return `${diffMinutes}m left`
    } else if (diffHours < 24) {
      return `${diffHours}h ${diffMinutes}m left`
    } else {
      return `${Math.floor(diffHours / 24)}d ${diffHours % 24}h left`
    }
  }

  return (
    <div className="col-span-12 md:col-span-4">
      <Card variant="glass" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">⏰</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{t('upcomingDeadlines')}</h3>
            <p className="text-sm text-muted-foreground">{t('within48Hours')}</p>
          </div>
        </div>
        <div className="space-y-3">
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('noUrgentDeadlines')}</p>
            </div>
          ) : (
            upcomingDeadlines.map(deadline => (
              <div
                key={deadline.id}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(deadline.priority as 'high' | 'medium' | 'low')}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">{deadline.title}</h4>
                    {deadline.description && (
                      <p className="text-xs text-muted-foreground mt-1">{deadline.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-accent">
                      {formatTimeRemaining(deadline.due_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}