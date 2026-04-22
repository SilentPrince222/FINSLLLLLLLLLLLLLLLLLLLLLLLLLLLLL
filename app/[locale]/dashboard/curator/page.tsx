'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import Card from '@/components/ui/Card'
import Button from '@/components/Button'

export default function CuratorPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()

  const handleSend = async () => {
    if (!message.trim()) return

    setSending(true)
    // Simulate sending message
    setTimeout(() => {
      setSending(false)
      alert('Сообщение отправлено куратору! Ожидайте ответа.')
      setMessage('')
      router.back()
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Связь с куратором</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <Card variant="elevated" className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-2xl">👨‍🏫</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Куратор группы ИС-21</h3>
              <p className="text-gray-600">Мария Петрова</p>
              <p className="text-sm text-gray-500">Ответ обычно в течение 2-4 часов</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ваше сообщение
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Опишите ваш вопрос или проблему..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="w-full"
          >
            {sending ? 'Отправка...' : 'Отправить сообщение'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Советы по общению:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Будьте вежливы и конкретны в описании проблемы</li>
            <li>• Укажите предмет и тему, если вопрос связан с учебой</li>
            <li>• Приложите скриншоты или документы при необходимости</li>
          </ul>
        </div>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Альтернативные способы связи: email или личная встреча</p>
      </div>
    </div>
  )
}