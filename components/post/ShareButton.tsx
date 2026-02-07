'use client'

import { Share2, Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
    postId: string
    className?: string
    showLabel?: boolean
}

export function ShareButton({ postId, className, showLabel = false }: ShareButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const url = `${window.location.origin}/post/${postId}`

        // Try Native Share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Sussurro',
                    text: 'Confira esta história no Sussurro 👻',
                    url,
                })
                return
            } catch (err) {
                // Fallback to clipboard if user cancelled share or error
                console.log('Share failed or cancelled, falling back to clipboard', err)
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    return (
        <button
            onClick={handleShare}
            className={className || "flex items-center gap-2 text-text-secondary hover:text-accent transition-all p-2 rounded-lg hover:bg-white/5 group/share"}
            title="Compartilhar"
        >
            {copied ? (
                <>
                    <Check size={18} className="text-success" />
                    <span className="text-sm font-bold text-success">Copiado!</span>
                </>
            ) : (
                <>
                    <Share2 size={18} className="group-hover/share:scale-110 transition-transform" />
                    {showLabel && <span className="text-sm font-bold">Partilhar</span>}
                </>
            )}
        </button>
    )
}
