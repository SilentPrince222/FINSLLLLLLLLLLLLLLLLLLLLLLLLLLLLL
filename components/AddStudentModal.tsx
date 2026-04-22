'use client'

import { useState } from 'react'
import Modal from './Modal'

interface AddStudentModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (_data: StudentFormData) => Promise<void>
}

export type StudentFormData = {
    name: string
    email: string
    group: string
}

export default function AddStudentModal({ isOpen, onClose, onSubmit }: AddStudentModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<StudentFormData>({
        name: '',
        email: '',
        group: 'CS-21',
    })

    const isValid = formData.name.trim() !== '' && 
                   formData.email.trim() !== '' && 
                   formData.email.includes('@')

    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true)
        await onSubmit(formData)
        setLoading(false)
        setFormData({ name: '', email: '', group: 'CS-21' })
        onClose()
    }

    const groups = ['CS-21', 'CS-22', 'CS-23', 'CS-24']

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Student"
            confirmText="Add Student"
            onConfirm={handleSubmit}
            loading={loading}
            disabled={!isValid}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                        className="input w-full"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="student@college.edu"
                        className="input w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
                    <select
                        value={formData.group}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        className="input w-full"
                    >
                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>
        </Modal>
    )
}
