import React from 'react'

interface GradeCardProps {
  subject: string
  score: number
  className?: string
}

export default function GradeCard({ subject, score, className = '' }: GradeCardProps) {
  const isGood = score >= 70

  return (
    <div className={`flex justify-between items-center p-2 rounded-lg bg-muted/50 ${className}`}>
      <span className="text-sm font-medium text-foreground">{subject}</span>
      <span className={`text-sm font-bold ${isGood ? 'text-success' : 'text-danger'}`}>
        {score}%
      </span>
    </div>
  )
}