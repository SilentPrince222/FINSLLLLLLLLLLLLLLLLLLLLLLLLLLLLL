import React from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'
import { useRouter } from '@/i18n/routing'

interface Grade {
  id: number
  subject: string
  score: number
}

interface GradesSectionProps {
  grades: Grade[] | null
}

export default function GradesSection({ grades }: GradesSectionProps) {
  const router = useRouter()
  const safeGrades = grades ?? []

  return (
    <div className="col-span-12 md:col-span-4">
      <Card variant="glass" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Grades</h3>
            <p className="text-sm text-muted-foreground">Your performance</p>
          </div>
        </div>
        <div className="space-y-3">
          {safeGrades.slice(0, 3).map(g => (
            <div key={g.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
              <span className="text-sm font-medium text-foreground">{g.subject}</span>
              <span className={`text-sm font-bold ${g.score >= 70 ? 'text-success' : 'text-danger'}`}>
                {g.score}%
              </span>
            </div>
          ))}
        </div>
        <Button
          variant="text"
          className="w-full mt-4 justify-center"
          onClick={() => router.push('/dashboard/grades')}
        >
          View all →
        </Button>
      </Card>
    </div>
  )
}