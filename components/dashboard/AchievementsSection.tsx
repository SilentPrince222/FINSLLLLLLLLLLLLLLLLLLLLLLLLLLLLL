import React from 'react'
import Card from '@/components/ui/Card'

interface Achievements {
  students: number
  faculty: number
  publications: number
  awards: number
}

interface AchievementsSectionProps {
  achievements: Achievements
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <Card variant="elevated" className="lg:col-span-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <span className="text-xl">🏆</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">College Achievements</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{achievements.students?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground">Students</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{achievements.faculty || 0}</p>
          <p className="text-xs text-muted-foreground">Faculty</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{achievements.publications || 0}</p>
          <p className="text-xs text-muted-foreground">Publications</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{achievements.awards || 0}</p>
          <p className="text-xs text-muted-foreground">Awards</p>
        </div>
      </div>
    </Card>
  )
}