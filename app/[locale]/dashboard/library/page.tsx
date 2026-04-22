'use client'

import { useState } from 'react'

type Book = {
    id: number
    title: string
    author: string
    category: string
    available: boolean
}

const books: Book[] = [
    { id: 1, title: 'Introduction to Algorithms', author: 'Cormen', category: 'Computer Science', available: true },
    { id: 2, title: 'Physics for Scientists', author: 'Halliday', category: 'Physics', available: true },
    { id: 3, title: 'Linear Algebra', author: 'Strang', category: 'Mathematics', available: false },
    { id: 4, title: 'Clean Code', author: 'Martin', category: 'Computer Science', available: true },
    { id: 5, title: 'Organic Chemistry', author: 'McMurry', category: 'Chemistry', available: true },
    { id: 6, title: 'English Grammar', author: 'Quirk', category: 'Language', available: false },
]

export default function LibraryPage() {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')

    const categories = [...new Set(books.map(b => b.category))]

    const filtered = books.filter(b => {
        if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false
        if (category !== 'all' && b.category !== category) return false
        return true
    })

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-medium text-primary">Library</h1>
                    <p className="text-sm text-muted-foreground mt-1">Digital book collection</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search books..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input flex-1 min-w-[200px]"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input w-40"
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Books Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(book => (
                    <div key={book.id} className="card p-4 hover:shadow-card transition-shadow">
                        <div className="aspect-[3/4] bg-muted rounded mb-3 flex items-center justify-center">
                            <span className="text-accent text-2xl">▤</span>
                        </div>
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">{book.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">{book.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${book.available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {book.available ? 'Available' : 'Borrowed'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No books found
                </div>
            )}
        </div>
    )
}