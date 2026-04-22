'use client'

import { useState } from 'react'

type Teacher = {
    id: number
    name: string
    email: string
    subject: string
    students: number
}

const teachers: Teacher[] = [
    { id: 1, name: 'Dr. Robert Johnson', email: 'robert@college.edu', subject: 'Mathematics', students: 45 },
    { id: 2, name: 'Dr. Lisa Anderson', email: 'lisa@college.edu', subject: 'Physics', students: 38 },
    { id: 3, name: 'Prof. David Chen', email: 'david@college.edu', subject: 'Programming', students: 52 },
    { id: 4, name: 'Dr. Maria Garcia', email: 'maria@college.edu', subject: 'English', students: 40 },
    { id: 5, name: 'Prof. James Wilson', email: 'james.w@college.edu', subject: 'Chemistry', students: 35 },
]

export default function TeachersPage() {
    const [search, setSearch] = useState('')

    const filtered = teachers.filter(t => 
        !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-heading">Teachers</h1>
                    <p className="text-sm text-muted-foreground mt-1">Faculty members</p>
                </div>
                <button className="btn-primary">
                    + Add Teacher
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search teachers or subjects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input w-full max-w-md"
                />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(teacher => (
                    <div key={teacher.id} className="card p-4 hover:shadow-card transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent text-sm font-medium">
                                {teacher.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-foreground">{teacher.name}</h3>
                                <p className="text-xs text-muted-foreground font-medium">{teacher.subject}</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{teacher.email}</span>
                            <span className="text-accent font-medium">{teacher.students} students</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}