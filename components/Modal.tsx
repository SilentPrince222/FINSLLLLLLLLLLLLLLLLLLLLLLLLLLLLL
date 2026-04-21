'use client'

import { ReactNode, useEffect } from 'react'
import Button from './Button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    variant?: 'danger' | 'primary'
    loading?: boolean
    disabled?: boolean
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    variant = 'primary',
    loading = false,
    disabled = false,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-medium text-primary">{title}</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-4">{children}</div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    {onConfirm && (
                        <Button
                            variant={variant === 'danger' ? 'danger' : 'primary'}
                            onClick={onConfirm}
                            loading={loading}
                            disabled={disabled}
                        >
                            {confirmText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
