import React from 'react'
import { useTranslations } from 'next-intl'
import Card from '@/components/ui/Card'

interface Grade {
  id: number
  subject: string
  score: number
  created_at?: string
}

interface GradesSummarySectionProps {
  grades: Grade[]
}

export default function GradesSummarySection({ grades }: GradesSummarySectionProps) {
  const t = useTranslations('dashboard')
  // Calculate GPA (average score)
  const gpa = grades.length > 0
    ? Math.round(grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length)
    : 0

  // Calculate weekly progress (grades added in last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyGrades = grades.filter(grade => grade.created_at && new Date(grade.created_at) > weekAgo)

  const getGpaColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 70) return 'text-warning'
    return 'text-danger'
  }

  return (
    <div className="col-span-12 md:col-span-3">
      <Card variant="glass" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{t('gradesSummary')}</h3>
            <p className="text-sm text-muted-foreground">Ваш академический обзор</p>
          </div>
        </div>
        <div className="space-y-4">
          {/* GPA Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-blue-500/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{t('currentGPA')}</p>
                <p className={`text-3xl font-bold ${getGpaColor(gpa)}`}>{gpa}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('totalGrades')}</p>
                <p className="text-lg font-semibold">{grades.length}</p>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{t('thisWeek')}</p>
                <p className="text-lg font-semibold">{weeklyGrades.length} {t('newGrades')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('progress')}</p>
                <p className="text-lg font-semibold text-accent">+{weeklyGrades.length}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}