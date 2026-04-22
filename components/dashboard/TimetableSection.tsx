import React from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'
import { useRouter } from 'next/navigation'

interface TimetableEntry {
  id: number
  subject: string
  day: string
  start_time: string
}

interface TimetableSectionProps {
  timetable: TimetableEntry[] | null
}

export default function TimetableSection({ timetable }: TimetableSectionProps) {
  const router = useRouter()
  const safeTimetable = timetable ?? []

  return (
    <div className="col-span-12 md:col-span-3">
      <Card variant="default" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Timetable</h3>
            <p className="text-sm text-muted-foreground">Today&apos;s schedule</p>
          </div>
        </div>
        <div className="space-y-3">
          {safeTimetable.slice(0, 3).map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <span className="text-sm font-medium text-foreground">{t.subject}</span>
              <span className="text-sm text-muted-foreground font-mono">{t.start_time}</span>
            </div>
          ))}
        </div>
        <Button
          variant="text"
          size="sm"
          className="w-full mt-4 justify-center"
          onClick={() => router.push('/dashboard/timetable')}
        >
          View full →
        </Button>
      </Card>
    </div>
  )
}