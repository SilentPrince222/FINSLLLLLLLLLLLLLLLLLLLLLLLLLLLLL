'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Card from '@/components/ui/Card'

interface Grade {
  id: number
  subject: string
  score: number
  created_at?: string
}

interface GradesSummarySectionProps {
  grades: Grade[] | null
  recentIds?: Set<number>
}

export default function GradesSummarySection({ grades, recentIds }: GradesSummarySectionProps) {
  const t = useTranslations('dashboard')
  const safeGrades = grades ?? []
  const gpa = safeGrades.length > 0
    ? Math.round(safeGrades.reduce((sum, grade) => sum + grade.score, 0) / safeGrades.length)
    : 0

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyGrades = safeGrades.filter(grade => grade.created_at && new Date(grade.created_at) > weekAgo)

  const hasRecent = (recentIds?.size ?? 0) > 0

  const getGpaColor = (score: number) => {
    if (score >= 90) return 'text-success'
    if (score >= 70) return 'text-warning'
    return 'text-danger'
  }

  return (
    <div className="col-span-12 md:col-span-3">
      <Card variant="glass" hover className={`h-full ${hasRecent ? 'animate-grade-pulse' : ''}`}>
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
                <AnimatePresence mode="wait">
                  <motion.p
                    key={gpa}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.4 }}
                    className={`text-3xl font-bold ${getGpaColor(gpa)}`}
                  >
                    {gpa}%
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('totalGrades')}</p>
                <p className="text-lg font-semibold">{safeGrades.length}</p>
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
