'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'

export default function QRScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState('')
  const router = useRouter()

  const startScanning = () => {
    setScanning(true)
    // Simulate QR scanning - in real app would use camera API
    setTimeout(() => {
      setScanning(false)
      setResult('Посещаемость отмечена! Код: ATT-2026-0415-001')
      // In real app, send attendance to server
    }, 2000)
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сканирование QR</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <Card variant="elevated" className="p-6">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              {scanning ? (
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Сканирование...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-sm text-gray-600">Наведите камеру на QR-код</p>
                </div>
              )}
            </div>
          </div>

          {!scanning && !result && (
            <button
              onClick={startScanning}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Начать сканирование
            </button>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                <div className="text-lg font-semibold mb-2">✅ Успешно!</div>
                <div className="text-sm">{result}</div>
              </div>
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Готово
              </button>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Для отметки посещаемости поднесите устройство к QR-коду на лекции</p>
      </div>
    </div>
  )
}