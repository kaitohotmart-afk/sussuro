'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { toggleSavePost } from '@/lib/actions/save'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner' // Assuming sonner or generic toast. If no toast lib, will use simple alert or silent.
// Not using toast for now to avoid dependency assumption, just simple feedback.

interface SaveButtonProps {
    postId: string
    initialIsSaved?: boolean
}

export function SaveButton({ postId, initialIsSaved = false }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const [isPending, setIsPending] = useState(false)

    const handleSave = async () => {
        if (isPending) return

        // Optimistic update
        const newIsSaved = !isSaved
        setIsSaved(newIsSaved)
        setIsPending(true)

        try {
            await toggleSavePost(postId)
        } catch (error) {
            setIsSaved(!newIsSaved) // Revert
        } finally {
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleSave}
            title={isSaved ? "Remover dos favoritos" : "Salvar post"}
            className={cn(
                "flex items-center gap-1 p-2 rounded-lg transition-all group/save active:scale-95",
                isSaved ? "text-accent bg-accent/10" : "text-text-secondary hover:text-accent hover:bg-white/5"
            )}
        >
            <Bookmark
                size={18}
                className={cn(
                    "transition-all duration-300",
                    isSaved ? "fill-current scale-110" : "group-hover/save:scale-110"
                )}
            />
        </button>
    )
}
