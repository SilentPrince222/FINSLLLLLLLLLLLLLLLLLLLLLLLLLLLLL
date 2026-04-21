import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'

interface Lesson {
  id: number
  subject: string
  time: string
  grade: number
  date: string
}

interface CalendarProps {
  onAddLesson: (lesson: Omit<Lesson, 'id'>) => void
  lessons: Lesson[]
}

export default function GradesCalendar({ onAddLesson, lessons }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    time: '',
    grade: ''
  })

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const days = []
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  // Add cells for each day of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const getLessonsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return lessons.filter(lesson => lesson.date === dateStr)
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setShowAddModal(true)
  }

  const handleAddLesson = () => {
    if (formData.subject && formData.time && formData.grade && selectedDate) {
      onAddLesson({
        subject: formData.subject,
        time: formData.time,
        grade: parseInt(formData.grade),
        date: selectedDate
      })
      setFormData({ subject: '', time: '', grade: '' })
      setShowAddModal(false)
      setSelectedDate(null)
    }
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Grade Calendar</h2>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={() => changeMonth('prev')}>
              ‹
            </Button>
            <span className="font-medium">{MONTHS[month]} {year}</span>
            <Button variant="secondary" size="sm" onClick={() => changeMonth('next')}>
              ›
            </Button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const lessonsForDay = day ? getLessonsForDate(day) : []
            const isToday = day === new Date().getDate() &&
                           month === new Date().getMonth() &&
                           year === new Date().getFullYear()

            return (
              <div
                key={index}
                onClick={() => day && handleDateClick(day)}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                  ${day ? 'hover:bg-accent/5 border-border' : 'border-transparent'}
                  ${isToday ? 'bg-accent/10 border-accent' : ''}
                  ${lessonsForDay.length > 0 ? 'bg-primary/5' : ''}
                `}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-accent' : ''}`}>
                      {day}
                    </div>
                    {lessonsForDay.map(lesson => (
                      <div key={lesson.id} className="text-xs bg-primary/10 rounded px-1 py-0.5 mb-1 truncate">
                        {lesson.subject}: {lesson.grade}%
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Add Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Add Lesson - {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Name</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Grade Received</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter grade (0-100)"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({ subject: '', time: '', grade: '' })
                  setSelectedDate(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddLesson}
                className="flex-1"
              >
                Add Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}