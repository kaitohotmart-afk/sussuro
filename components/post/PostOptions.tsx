'use client'

import React, { useState } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { deletePost } from '@/lib/actions/post_management'
import { EditPostModal } from '@/components/post/EditPostModal'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface PostOptionsProps {
    post: any
}

export function PostOptions({ post }: PostOptionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este sussurro permanentemente?')) return

        setIsDeleting(true)
        try {
            await deletePost(post.id)
            toast.success('Sussurro excluído com sucesso!')
            setIsOpen(false)
        } catch (error) {
            toast.error('Erro ao excluir sussurro')
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-95"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button
                            onClick={() => {
                                setIsEditModalOpen(true)
                                setIsOpen(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <Edit2 size={16} />
                            Editar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </button>
                    </div>
                </>
            )}

            {isEditModalOpen && (
                <EditPostModal
                    post={post}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    )
}
