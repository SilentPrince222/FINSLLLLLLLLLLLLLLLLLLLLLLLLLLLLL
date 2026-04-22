import React, { useId } from 'react'

interface LineChartProps {
  data: { label: string; value: number }[]
}

export default function LineChart({ data }: LineChartProps) {
  const gradientId = useId()
  const validData = data.filter(d => Number.isFinite(d.value))

  if (validData.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-gray-400">
        No data
      </div>
    )
  }

  const max = Math.max(...validData.map(d => d.value)) || 1
  const points = validData.map((d, i) => ({
    x: validData.length === 1 ? 50 : (i / (validData.length - 1)) * 100,
    y: 100 - (d.value / max) * 100,
    label: d.label,
    value: d.value,
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="h-40 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={path + ' L 100 100 L 0 100 Z'} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((p) => (
          <circle key={`${p.label}-${p.value}`} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {validData.map((d) => (
          <div key={`${d.label}-${d.value}`} className="text-xs text-gray-500">{d.label}</div>
        ))}
      </div>
    </div>
  )
}
