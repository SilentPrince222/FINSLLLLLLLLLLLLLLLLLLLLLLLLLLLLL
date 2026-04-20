'use client'

import { useState, useRef } from 'react'

type Material = {
    id: number
    name: string
    subject: string
    type: 'pdf' | 'doc' | 'ppt' | 'video' | 'link'
    size: string
    date: string
}

const mockMaterials: Material[] = [
    { id: 1, name: 'Лекция 1 - Введение', subject: 'Математика', type: 'pdf', size: '2.5 MB', date: '2026-04-10' },
    { id: 2, name: 'Лекция 2 - Алгебра', subject: 'Математика', type: 'pdf', size: '1.8 MB', date: '2026-04-12' },
    { id: 3, name: 'Презентация - Кванты', subject: 'Физика', type: 'ppt', size: '5.2 MB', date: '2026-04-14' },
    { id: 4, name: 'Видео - Лаба 1', subject: 'Физика', type: 'video', size: '150 MB', date: '2026-04-15' },
    { id: 5, name: 'Методичка', subject: 'Программирование', type: 'pdf', size: '800 KB', date: '2026-04-16' },
    { id: 6, name: 'Полезные ссылки', subject: 'Программирование', type: 'link', size: '-', date: '2026-04-16' },
]

const typeIcons: Record<Material['type'], string> = {
    pdf: '📄',
    doc: '📝',
    ppt: '📊',
    video: '🎬',
    link: '🔗',
}

const typeColors: Record<Material['type'], string> = {
    pdf: 'bg-red-100 text-red-700',
    doc: 'bg-blue-100 text-blue-700',
    ppt: 'bg-orange-100 text-orange-700',
    video: 'bg-purple-100 text-purple-700',
    link: 'bg-green-100 text-green-700',
}

export default function MaterialsPage() {
    const [materials] = useState<Material[]>(mockMaterials)
    const [filter, setFilter] = useState<string>('all')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const filtered = filter === 'all' ? materials : materials.filter(m => m.subject === filter)
    const subjects = [...new Set(materials.map(m => m.subject))]

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        setUploading(true)
        setTimeout(() => setUploading(false), 1500)
    }

    const handleUpload = () => {
        setUploading(true)
        setTimeout(() => setUploading(false), 1500)
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Учебные материалы</h1>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`
                        md:col-span-3 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                        ${uploading ? 'bg-green-50 border-green-500' : ''}
                    `}
                >
                    {uploading ? (
                        <div>
                            <div className="text-3xl mb-2">✅</div>
                            <div className="text-green-600 font-medium">Загрузка завершена!</div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-4xl mb-2">📁</div>
                            <div className="text-gray-600">Перетащите файлы сюда или нажмите для выбора</div>
                            <div className="text-sm text-gray-400 mt-1">PDF, DOC, PPT, MP4 до 100MB</div>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleUpload} />
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium mb-3">Фильтр по предмету</h3>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="all">Все предметы</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div className="mt-4 text-sm text-gray-500">
                        <p>Всего файлов: {materials.length}</p>
                        <p>Объём: 160.3 MB</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 font-medium text-sm">
                    <div>Название</div>
                    <div>Предмет</div>
                    <div>Размер</div>
                    <div>Дата</div>
                </div>

                <div className="divide-y">
                    {filtered.map(material => (
                        <div key={material.id} className="grid grid-cols-4 gap-4 p-3 hover:bg-gray-50 items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{typeIcons[material.type]}</span>
                                <span className="font-medium truncate">{material.name}</span>
                            </div>
                            <div>
                                <span className={`px-2 py-1 rounded text-xs ${typeColors[material.type]}`}>
                                    {material.subject}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">{material.size}</div>
                            <div className="text-sm text-gray-500">{material.date}</div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="p-8 text-center text-gray-500">Нет материалов</div>
                )}
            </div>
        </div>
    )
}