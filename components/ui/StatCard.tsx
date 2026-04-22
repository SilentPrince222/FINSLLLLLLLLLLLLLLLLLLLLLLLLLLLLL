'use client'

import { ReactNode } from 'react'

interface StatCardProps {
    label: string
    value: string | number
    trend?: {
        value: number
        positive?: boolean
    }
    icon?: ReactNode
    className?: string
}

export default function StatCard({ label, value, trend, icon, className = '' }: StatCardProps) {
    return (
        <div className={`card p-4 ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl font-medium text-accent">{value}</p>
                    {trend && (
                        // Bug 5.11: add aria-label so screen readers announce the trend meaning
                        <p
                            aria-label={`${trend.positive ? 'Up' : 'Down'} ${Math.abs(trend.value)}%`}
                            className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-500'}`}
                        >
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="text-muted-foreground">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}
