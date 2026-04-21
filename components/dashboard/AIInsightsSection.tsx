import React from 'react'
import Card from '@/components/ui/Card'

interface Grade {
  id: number
  subject: string
  score: number
}

interface AIInsightsSectionProps {
  grades: Grade[]
}

export default function AIInsightsSection({ grades }: AIInsightsSectionProps) {
  const average = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length) : 0
  const trend = grades.length > 1 ? '📈 Stable Performance' : '📊 Add more data'

  return (
    <div className="col-span-12 md:col-span-5">
      <Card variant="elevated" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">AI Insights</h3>
            <p className="text-sm text-muted-foreground">Smart analysis</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-blue-royal/10">
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-3xl font-bold text-foreground">
              {average}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <p className="text-sm text-muted-foreground">Trend</p>
            <p className="text-lg text-foreground">
              {trend}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}