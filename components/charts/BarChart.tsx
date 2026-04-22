import React from 'react'

interface BarChartProps {
  data: { label: string; value: number }[]
  max?: number
}

export default function BarChart({ data, max = 100 }: BarChartProps) {
  const safeMax = max && max > 0 ? max : Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d) => (
        <div key={`${d.label}-${d.value}`} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-blue-500 rounded-t"
            style={{ height: `${(d.value / safeMax) * 100}%` }}
          />
          <div className="text-xs mt-1 text-gray-500">{d.label}</div>
        </div>
      ))}
    </div>
  )
}