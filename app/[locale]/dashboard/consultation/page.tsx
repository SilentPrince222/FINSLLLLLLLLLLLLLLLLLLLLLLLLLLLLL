'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'

type Consultation = {
  id: string
  teacher: string
  subject: string
  date: string
  time: string
  available: boolean
}

const mockConsultations: Consultation[] = [
  { id: '1', teacher: 'Мария Петрова', subject: 'Математика', date: '2026-04-16', time: '14:00', available: true },
  { id: '2', teacher: 'Алексей Сидоров', subject: 'Физика', date: '2026-04-16', time: '15:00', available: true },
  { id: '3', teacher: 'Елена Иванова', subject: 'Программирование', date: '2026-04-17', time: '10:00', available: true },
  { id: '4', teacher: 'Дмитрий Козлов', subject: 'Английский', date: '2026-04-17', time: '11:00', available: false },
]

export default function ConsultationPage() {
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const router = useRouter()

  const handleBooking = async (consultationId: string) => {
    setBooking(true)
    // Simulate booking API call
    setTimeout(() => {
      setBooking(false)
      alert('Консультация успешно забронирована! Вы получите подтверждение по email.')
      router.back()
    }, 1500)
  }

  const availableConsultations = mockConsultations.filter(c => c.available)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Запись на консультацию</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          Выберите удобное время для консультации с преподавателем. Консультации проводятся индивидуально.
        </p>
      </div>

      <div className="grid gap-4">
        {availableConsultations.map((consultation) => (
          <Card key={consultation.id} variant="default" hover className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {consultation.teacher.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{consultation.teacher}</h3>
                    <p className="text-sm text-gray-600">{consultation.subject}</p>
                  </div>
                </div>
              </div>

              <div className="text-right mr-4">
                <div className="text-sm font-medium">
                  {new Date(consultation.date).toLocaleDateString('ru-RU', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
                <div className="text-lg font-bold text-blue-600">{consultation.time}</div>
              </div>

              <Button
                onClick={() => handleBooking(consultation.id)}
                disabled={booking}
                variant={selectedConsultation === consultation.id ? "primary" : "secondary"}
              >
                {booking && selectedConsultation === consultation.id ? 'Бронирование...' : 'Записаться'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {availableConsultations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет доступных консультаций</h3>
          <p className="text-gray-600">Проверьте позже или обратитесь к преподавателю напрямую</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Правила записи:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Запись возможна не позднее чем за 24 часа до консультации</li>
          <li>• При опоздании более 15 минут запись аннулируется</li>
          <li>• При невозможности прийти отмените запись заранее</li>
        </ul>
      </div>
    </div>
  )
}