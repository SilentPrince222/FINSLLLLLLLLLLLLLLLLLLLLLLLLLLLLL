import React from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'

const quickLinks = [
  { label: '📚 Course Catalog', href: '#' },
  { label: '📅 Academic Calendar', href: '#' },
  { label: '💼 Career Services', href: '#' },
  { label: '📞 Contact Directory', href: '#' },
  { label: '🏛️ Campus Map', href: '#' },
  { label: '📋 Student Handbook', href: '#' },
]

export default function QuickLinksSection() {
  return (
    <Card variant="default" className="lg:col-span-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <span className="text-xl">📄</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {quickLinks.map((link, i) => (
          <Button key={i} variant="secondary" size="sm" className="text-xs">
            {link.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}