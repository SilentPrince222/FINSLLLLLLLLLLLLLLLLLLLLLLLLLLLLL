import React, { useState } from 'react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (event: { title: string; date: string; description: string }) => void
}

export default function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.date && formData.description) {
      onCreate(formData)
      setFormData({ title: '', date: '', description: '' })
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({ title: '', date: '', description: '' })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Event"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Event Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter event title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            rows={4}
            placeholder="Describe your event..."
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            Create Event
          </Button>
        </div>
      </form>
    </Modal>
  )
}