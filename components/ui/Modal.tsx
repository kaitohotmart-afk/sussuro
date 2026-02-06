'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
    children: React.ReactNode
    onClose: () => void
}

export function Modal({ children, onClose }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-text-secondary hover:text-text-primary transition-colors"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    )
}
