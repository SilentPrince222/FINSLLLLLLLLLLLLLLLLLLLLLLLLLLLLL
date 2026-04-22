'use client'

import { ReactNode } from 'react'
import { getStatusColor } from '@/lib/design-system'

interface BadgeProps {
    children: ReactNode
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral'
    status?: 'active' | 'inactive'
    showDot?: boolean
    className?: string
}

const variants = {
    default: 'bg-muted text-foreground',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    neutral: 'bg-muted text-muted-foreground',
}

export default function Badge({ 
    children, 
    variant = 'default', 
    status,
    showDot = false,
    className = '' 
}: BadgeProps) {
    const statusColors = status ? getStatusColor(status) : null
    const bg = statusColors?.bg || ''
    const text = statusColors?.text || ''

    return (
        <span 
            className={`
                inline-flex items-center text-xs px-2 py-1 rounded-full font-medium
                ${status ? '' : variants[variant]}
                ${className}
            `}
            style={status ? { backgroundColor: bg, color: text } : undefined}
        >
            {showDot && (
                // Bug 5.8: add aria-label so screen readers know what the dot means
                <span
                    aria-label={status === 'active' ? 'active' : 'inactive'}
                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{ backgroundColor: status === 'active' ? '#10B981' : '#94A3B8' }}
                />
            )}
            {children}
        </span>
    )
}
