import React from 'react'

interface BarChartProps {
  data: { label: string; value: number }[]
  max?: number
}

export default function BarChart({ data, max = 100 }: BarChartProps) {
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d) => (
        <div key={`${d.label}-${d.value}`} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-blue-500 rounded-t"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <div className="text-xs mt-1 text-gray-500">{d.label}</div>
        </div>
      ))}
    </div>
  )
}