'use client'

import { motion } from 'framer-motion'
import { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-muted border-border shadow-soft',
        glass: 'bg-white/10 dark:bg-white/5 backdrop-blur-xl border-white/20 shadow-glass',
        elevated: 'bg-white dark:bg-muted border-border shadow-card hover:shadow-glow',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

interface CardProps
  extends VariantProps<typeof cardVariants>,
    Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  variant,
  padding,
  hover = false,
  ...props
}: CardProps) {
  const cardClass = cn(cardVariants({ variant, padding, className }))

  if (hover) {
    return (
      <motion.div
        className={cardClass}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...(props as object)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('flex items-center justify-between mb-4', className)}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <h3 className={cn('text-lg font-semibold text-foreground', className)}>
            {children}
        </h3>
    )
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={className}>{children}</div>
}
