'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ReportButtonProps {
    postId: string
    userId: string
}

export function ReportButton({ postId, userId }: ReportButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [reported, setReported] = useState(false)
    const supabase = createClient()

    const handleReport = async () => {
        if (!reason) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('reports')
                .insert({
                    reporter_id: userId,
                    post_id: postId,
                    reason: 'user_report',
                    description: reason,
                    status: 'pending'
                } as any)

            if (error) throw error

            setReported(true)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error reporting post:', error)
        } finally {
            setLoading(false)
        }
    }

    if (reported) {
        return <span className="text-xs text-text-secondary">Denunciado</span>
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-text-secondary hover:text-error transition-colors p-1"
                title="Denunciar"
            >
                <Flag size={16} />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold">Denunciar Post</h3>
                        <p className="text-text-secondary text-sm">
                            Por que você está denunciando este post?
                        </p>

                        <textarea
                            className="w-full bg-background border border-input rounded-lg p-3 text-sm min-h-[100px]"
                            placeholder="Descreva o motivo (ex: assédio, spam, conteúdo ilegal)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleReport}
                                disabled={!reason || loading}
                            >
                                {loading ? 'Enviando...' : 'Denunciar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
