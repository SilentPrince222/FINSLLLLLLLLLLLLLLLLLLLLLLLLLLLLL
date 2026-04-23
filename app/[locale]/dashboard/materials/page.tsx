'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Video, Link as LinkIcon, Presentation, FileType } from 'lucide-react'

type Material = {
    id: number
    name: string
    subject: string
    type: 'pdf' | 'doc' | 'ppt' | 'video' | 'link'
    size: string
    date: string
}

const mockMaterials: Material[] = [
    { id: 1, name: 'Лекция 1 — Введение', subject: 'Математика', type: 'pdf', size: '2.5 MB', date: '10 апр' },
    { id: 2, name: 'Лекция 2 — Алгебра', subject: 'Математика', type: 'pdf', size: '1.8 MB', date: '12 апр' },
    { id: 3, name: 'Презентация — Кванты', subject: 'Физика', type: 'ppt', size: '5.2 MB', date: '14 апр' },
    { id: 4, name: 'Видео — Лаба 1', subject: 'Физика', type: 'video', size: '150 MB', date: '15 апр' },
    { id: 5, name: 'Методичка', subject: 'Программирование', type: 'pdf', size: '800 KB', date: '16 апр' },
    { id: 6, name: 'Полезные ссылки', subject: 'Программирование', type: 'link', size: '—', date: '16 апр' },
]

const TYPE_ICON = {
    pdf: FileText,
    doc: FileType,
    ppt: Presentation,
    video: Video,
    link: LinkIcon,
} as const

export default function MaterialsPage() {
    const [materials] = useState<Material[]>(mockMaterials)
    const [filter, setFilter] = useState<string>('all')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const filtered = filter === 'all' ? materials : materials.filter(m => m.subject === filter)
    const subjects = Array.from(new Set(materials.map(m => m.subject)))

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
        <>
            <div className="g12" style={{ marginBottom: 18 }}>
                <div className="span8">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className="p-card"
                        style={{
                            cursor: 'pointer',
                            borderStyle: 'dashed',
                            borderColor: dragOver ? 'rgba(110,231,245,0.5)' : uploading ? 'rgba(95,193,145,0.5)' : 'var(--p-border-hi)',
                            background: dragOver ? 'rgba(110,231,245,0.05)' : uploading ? 'rgba(95,193,145,0.05)' : undefined,
                            textAlign: 'center',
                            padding: 40,
                        }}
                    >
                        <Upload style={{ width: 28, height: 28, color: 'var(--p-fg3)', margin: '0 auto 12px', strokeWidth: 1.5 }} />
                        <div className="t-label">
                            {uploading ? 'Загрузка завершена!' : 'Перетащите файлы сюда или нажмите для выбора'}
                        </div>
                        <div className="t-meta" style={{ marginTop: 6 }}>PDF, DOC, PPT, MP4 до 100MB</div>
                        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
                    </div>
                </div>

                <div className="p-card span4">
                    <div className="clabel">Фильтр</div>
                    <select className="p-inp" style={{ marginTop: 10 }} value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">Все предметы</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="row-item" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--p-border)' }}>
                        <span className="t-meta">Всего файлов</span>
                        <span className="p-num t-label">{materials.length}</span>
                    </div>
                    <div className="row-item">
                        <span className="t-meta">Объём</span>
                        <span className="p-num t-label">160.3 MB</span>
                    </div>
                </div>
            </div>

            <div className="p-card">
                <div className="sec-head"><div className="sec-title">Файлы</div></div>
                <div style={{ overflowX: 'auto', margin: '0 -14px' }}>
                    <table className="p-tbl">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Предмет</th>
                                <th>Размер</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => {
                                const Icon = TYPE_ICON[m.type]
                                return (
                                    <tr key={m.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                                <Icon style={{ width: 15, height: 15, color: 'var(--p-fg3)', flexShrink: 0, strokeWidth: 1.75 }} />
                                                <span style={{ color: 'var(--p-fg1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="pill">{m.subject}</span></td>
                                        <td><span className="p-num t-muted">{m.size}</span></td>
                                        <td><span className="p-num t-muted">{m.date}</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="t-meta" style={{ padding: 36, textAlign: 'center' }}>Нет материалов</div>
                )}
            </div>
        </>
    )
}
