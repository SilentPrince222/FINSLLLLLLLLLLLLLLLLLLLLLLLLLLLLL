'use client'

import { useState } from 'react'
import { Button, Card, Badge, Input, Select, StatCard, Modal } from '@/components/ui'
import { getGradeColor } from '@/lib/design-system'

type Student = {
    id: number
    name: string
    email: string
    group: string
    grade: number
    status: 'active' | 'inactive'
    enrolled: string
}

const initialStudents: Student[] = [
    { id: 1, name: 'John Smith', email: 'john@college.edu', group: 'CS-21', grade: 92, status: 'active', enrolled: 'Sep 2025' },
    { id: 2, name: 'Emma Wilson', email: 'emma@college.edu', group: 'CS-21', grade: 88, status: 'active', enrolled: 'Sep 2025' },
    { id: 3, name: 'Michael Brown', email: 'michael@college.edu', group: 'CS-22', grade: 85, status: 'active', enrolled: 'Sep 2025' },
    { id: 4, name: 'Sarah Davis', email: 'sarah@college.edu', group: 'CS-22', grade: 90, status: 'active', enrolled: 'Sep 2025' },
    { id: 5, name: 'James Miller', email: 'james@college.edu', group: 'CS-23', grade: 78, status: 'inactive', enrolled: 'Sep 2024' },
    { id: 6, name: 'Emily Johnson', email: 'emily@college.edu', group: 'CS-21', grade: 95, status: 'active', enrolled: 'Sep 2025' },
    { id: 7, name: 'David Lee', email: 'david@college.edu', group: 'CS-23', grade: 82, status: 'active', enrolled: 'Sep 2024' },
]

const groupOptions = [
    { value: 'all', label: 'All Groups' },
    { value: 'CS-21', label: 'CS-21' },
    { value: 'CS-22', label: 'CS-22' },
    { value: 'CS-23', label: 'CS-23' },
]

const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
]

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>(initialStudents)
    const [search, setSearch] = useState('')
    const [group, setGroup] = useState('all')
    const [status, setStatus] = useState('all')
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null })
    const [loading, setLoading] = useState(false)

    const filtered = students.filter(s => {
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
        const matchGroup = group === 'all' || s.group === group
        const matchStatus = status === 'all' || s.status === status
        return matchSearch && matchGroup && matchStatus
    })

    const handleDelete = async () => {
        if (!deleteModal.student) return
        setLoading(true)
        await new Promise(r => setTimeout(r, 1000))
        setStudents(students.filter(s => s.id !== deleteModal.student!.id))
        setDeleteModal({ isOpen: false, student: null })
        setLoading(false)
    }

    const avgGrade = students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + s.grade, 0) / students.length) 
        : 0
    const activeCount = students.filter(s => s.status === 'active').length

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-medium text-primary">Students</h1>
                    <p className="text-sm text-muted-foreground mt-1">{filtered.length} students found</p>
                </div>
                <Button variant="primary">+ Add Student</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total" value={students.length} />
                <StatCard label="Average Grade" value={`${avgGrade}%`} />
                <StatCard label="Active" value={activeCount} />
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-wrap gap-3">
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 min-w-[200px]"
                    />
                    <Select
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        options={groupOptions}
                        className="w-36"
                    />
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={statusOptions}
                        className="w-36"
                    />
                </div>
            </Card>

            {/* Table */}
            <Card padding="none">
                <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Student</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Group</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Grade</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Enrolled</th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map(student => (
                            <tr key={student.id} className="hover:bg-muted">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{student.name}</p>
                                        <p className="text-xs text-muted-foreground">{student.email}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-foreground">{student.group}</td>
                                <td className="px-4 py-3">
                                    <span className="text-sm font-medium" style={{ color: getGradeColor(student.grade) }}>
                                        {student.grade}%
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge status={student.status} showDot>
                                        {student.status === 'active' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{student.enrolled}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="text" size="sm">View</Button>
                                        <Button variant="text" size="sm">Edit</Button>
                                        <Button 
                                            variant="text" 
                                            size="sm" 
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteModal({ isOpen: true, student })}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No students found</div>
                )}
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Showing {filtered.length} of {students.length}</p>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Previous</Button>
                    <Button variant="secondary" size="sm">Next</Button>
                </div>
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, student: null })}
                title="Delete Student"
                confirmText="Delete"
                variant="danger"
                loading={loading}
                onConfirm={handleDelete}
            >
                <p className="text-foreground">
                    Are you sure you want to delete <strong>{deleteModal.student?.name}</strong>?
                </p>
                <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
            </Modal>
        </div>
    )
}
