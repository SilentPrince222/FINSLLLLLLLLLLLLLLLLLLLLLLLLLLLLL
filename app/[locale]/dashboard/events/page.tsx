'use client'

import { useState } from 'react'
import { EventCard, CreateEventModal } from '@/components/ui'
import Button from '@/components/Button'

type Event = {
    id: number
    title: string
    date: string
    time: string
    description: string
    type: 'exam' | 'homework' | 'activity' | 'holiday' | 'social'
    author?: string
    likes?: number
    comments?: number
}

const mockEvents: Event[] = [
    { id: 1, title: 'Math Final Exam', date: '2026-05-15', time: '09:00', description: 'Room 201 - Don\'t forget your calculator!', type: 'exam', author: 'Prof. Johnson', likes: 12, comments: 5 },
    { id: 2, title: 'Course Project Due', date: '2026-05-20', time: '23:59', description: 'Submit via LMS. Late submissions will not be accepted.', type: 'homework', author: 'Dr. Smith', likes: 8, comments: 3 },
    { id: 3, title: 'Open House Day', date: '2026-05-10', time: '14:00', description: 'Come meet our faculty and tour the campus! Free food and drinks provided.', type: 'activity', author: 'Admin Team', likes: 45, comments: 12 },
    { id: 4, title: 'Spring Break Begins!', date: '2026-05-01', time: '00:00', description: 'Enjoy your well-deserved break! Classes resume on May 9th.', type: 'holiday', author: 'Academic Office', likes: 67, comments: 23 },
    { id: 5, title: 'Campus Movie Night', date: '2026-04-25', time: '20:00', description: 'Join us for a screening of the latest blockbuster in the auditorium. Popcorn provided!', type: 'social', author: 'Student Council', likes: 89, comments: 34 },
    { id: 6, title: 'Study Group: Physics Chapter 8', date: '2026-04-22', time: '18:00', description: 'Need help with quantum mechanics? Join our study session in the library.', type: 'social', author: 'Alex Chen', likes: 15, comments: 7 },
]

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>(mockEvents)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const handleCreateEvent = (eventData: { title: string; date: string; description: string }) => {
        const [date, time] = eventData.date.split('T')
        const newEvent: Event = {
            id: Date.now(),
            title: eventData.title,
            date,
            time,
            description: eventData.description,
            type: 'social',
            author: 'You',
            likes: 0,
            comments: 0
        }
        setEvents([newEvent, ...events])
    }

    const handleLike = (eventId: number) => {
        setEvents(events.map(event =>
            event.id === eventId
                ? { ...event, likes: (event.likes || 0) + 1 }
                : event
        ))
    }

    const handleComment = (eventId: number) => {
        // In a real app, this would open a comments modal
        setEvents(events.map(event =>
            event.id === eventId
                ? { ...event, comments: (event.comments || 0) + 1 }
                : event
        ))
    }



    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Events</h1>
                <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                >
                    <span>+</span>
                    Create Event
                </Button>
            </div>

            {/* Events Feed */}
            <div className="space-y-6">
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onLike={handleLike}
                        onComment={handleComment}
                    />
                ))}
            </div>

            {/* Create Event Modal */}
            <CreateEventModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateEvent}
            />
        </div>
    )
}