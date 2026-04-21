import React from 'react'
import Card from '@/components/ui/Card'

interface TimetableEntry {
  id: number
  subject: string
  day: string
  start_time: string
  end_time?: string
  room?: string
}

interface UpNextSectionProps {
  timetable: TimetableEntry[]
}

export default function UpNextSection({ timetable }: UpNextSectionProps) {
  // Get current day and time
  const now = new Date()
  // Получаем день недели (например, "monday")
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

  // Convert day names to match database (assuming English)
  const dayMapping: { [key: string]: string } = {
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday'
  }

  const todayClasses = timetable.filter(entry =>
    entry.day.toLowerCase() === currentDay
  )

  // Find next class today
  let nextClass = null
  for (const classEntry of todayClasses) {
    if (classEntry.start_time > currentTime) {
      nextClass = classEntry
      break
    }
  }

  // If no more classes today, show first class tomorrow
  if (!nextClass) {
    const tomorrowIndex = (now.getDay() % 7) + 1
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    const tomorrowClasses = timetable.filter(entry =>
      entry.day.toLowerCase() === tomorrowDay
    ).sort((a, b) => a.start_time.localeCompare(b.start_time))

    nextClass = tomorrowClasses[0] || null
  }

  if (!nextClass) {
    return (
      <div className="col-span-12 md:col-span-3">
        <Card variant="default" hover className="h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Следующая пара</h3>
              <p className="text-sm text-muted-foreground">Нет предстоящих занятий</p>
            </div>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <p>Все занятия окончены!</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="col-span-12 md:col-span-3">
      <Card variant="elevated" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">⏰</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Следующая пара</h3>
            <p className="text-sm text-muted-foreground">Ваше следующее занятие</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-blue-500/10">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-foreground text-lg">{nextClass.subject}</h4>
                <p className="text-sm text-muted-foreground">{nextClass.day}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-accent">{nextClass.start_time}</p>
                {nextClass.room && (
                  <p className="text-sm text-muted-foreground">Кабинет {nextClass.room}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}