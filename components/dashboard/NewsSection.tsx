import React from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'

interface NewsItem {
  id: number
  title: string
  date: string
  preview: string
  image: string
}

interface NewsSectionProps {
  news: NewsItem[]
}

export default function NewsSection({ news }: NewsSectionProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-heading mb-6">Main News</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(item => (
          <Card key={item.id} variant="elevated" hover className="overflow-hidden">
            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
              <span className="text-4xl text-muted-foreground">📰</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground line-clamp-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.date}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{item.preview}</p>
              <Button variant="text" size="sm" className="mt-2 p-0 h-auto">
                Read more →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}