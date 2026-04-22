'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/Button'

interface NavItem {
  label: string
  href: string
  icon?: string
  onClick?: () => void
}

interface NavigationProps {
  items: NavItem[]
  className?: string
  collapsible?: boolean
}

export default function Navigation({
  items,
  className = '',
  collapsible = true
}: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  // Bug 5.17: respect prefers-reduced-motion — disable spring animation
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.aside
      className={cn(
        'bg-white dark:bg-muted border-r border-border flex flex-col',
        className
      )}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 300, damping: 30 }
      }
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                className="text-xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                College Portal
              </motion.h1>
            )}
          </AnimatePresence>
          {collapsible && (
            <Button
              variant="text"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="shrink-0"
            >
              {isCollapsed ? '→' : '←'}
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="text"
                className={cn(
                  'w-full justify-start gap-3 h-12',
                  isCollapsed && 'justify-center px-2'
                )}
                onClick={item.onClick}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="truncate"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.aside>
  )
}