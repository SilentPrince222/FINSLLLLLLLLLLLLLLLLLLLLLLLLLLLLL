import React from 'react'
import Card from '@/components/ui/Card'

interface NewsItem {
  id: number
  title: string
  date: string
  preview: string
  image: string
  author?: string
}

interface NewsFeedSectionProps {
  news: NewsItem[]
}

export default function NewsFeedSection({ news }: NewsFeedSectionProps) {
  return (
    <div className="col-span-12 md:col-span-3">
      <Card variant="elevated" hover className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl">📰</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">News Feed</h3>
            <p className="text-sm text-muted-foreground">Latest college updates</p>
          </div>
        </div>
        <div className="space-y-4">
          {news.slice(0, 2).map(item => (
            <div key={item.id} className="p-3 rounded-lg bg-muted/30">
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                <span className="text-2xl text-muted-foreground">📰</span>
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {new Date(item.date).toLocaleDateString()}
                {item.author && ` • ${item.author}`}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {item.preview}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}