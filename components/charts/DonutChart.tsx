import React from 'react'

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
}

export default function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulative = 0

  if (data.length === 0 || total === 0) {
    return (
      <div className="relative h-32 w-32 mx-auto">
        <svg viewBox="0 0 36 36" className="transform -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="3"
            strokeDasharray="100 0"
            strokeDashoffset="0"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 36 36" className="transform -rotate-90">
        {data.map((d) => {
          const offset = cumulative
          cumulative += (d.value / total) * 100
          return (
            <circle
              key={`${d.label}-${d.value}`}
              cx="18"
              cy="18"
              r="15.91549430918954"
              fill="transparent"
              stroke={d.color}
              strokeWidth="3"
              strokeDasharray={`${(d.value / total) * 100} ${100 - (d.value / total) * 100}`}
              strokeDashoffset={-offset}
            />
          )
        })}
      </svg>
    </div>
  )
}
