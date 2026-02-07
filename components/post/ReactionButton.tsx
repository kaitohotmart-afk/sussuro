'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'
import { ThumbsUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ReactionButtonProps {
    postId: string
    initialLikes: number
    initialIsLiked: boolean
    initialReactionType?: string | null
    userId: string
    showCount?: boolean
    showLabel?: boolean
    onReaction?: (type: string | null) => void
}

const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Gosto', color: 'text-[#1877F2]' },
    { type: 'love', emoji: '❤️', label: 'Adoro', color: 'text-[#F33E58]' },
    { type: 'haha', emoji: '😂', label: 'Haha', color: 'text-[#F7B125]' },
    { type: 'wow', emoji: '😮', label: 'Uau', color: 'text-[#F7B125]' },
    { type: 'sad', emoji: '😢', label: 'Triste', color: 'text-[#F7B125]' },
    { type: 'angry', emoji: '😡', label: 'Grr', color: 'text-[#E9710F]' },
]

export function ReactionButton({
    postId,
    initialLikes,
    initialReactionType = null,
    userId,
    showCount = true,
    showLabel = false,
    onReaction
}: ReactionButtonProps) {
    // Determine initial state based on props
    // If initialReactionType is present, use it.
    // If NOT present but initialIsLiked is true (legacy/fallback), use 'like'.
    // Otherwise null.
    // Note: The parent component should map singular likes to 'like' type if reaction_type is missing.
    const [likes, setLikes] = useState(initialLikes)
    const [userReaction, setUserReaction] = useState<string | null>(initialReactionType)
    const [showReactions, setShowReactions] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const supabase = createClient()

    const handleMouseEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setShowReactions(true)
    }

    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            setShowReactions(false)
        }, 300)
    }

    const handleReaction = async (type: string) => {
        const isRemove = userReaction === type
        const newReaction = isRemove ? null : type

        // Optimistic update
        const prevReaction = userReaction
        setUserReaction(newReaction)

        // Count logic:
        // Removing: count - 1
        // Adding (from nothing): count + 1
        // Changing (from A to B): count remains same
        if (isRemove) {
            setLikes(prev => prev - 1)
        } else if (!prevReaction) {
            setLikes(prev => prev + 1)
        }

        setShowReactions(false)
        if (onReaction) onReaction(newReaction)

        try {
            if (isRemove) {
                await supabase
                    .from('likes')
                    .delete()
                    .match({ user_id: userId, post_id: postId })
            } else {
                await (supabase
                    .from('likes')
                    .upsert({
                        user_id: userId,
                        post_id: postId,
                        reaction_type: type
                    } as any, { onConflict: 'user_id, post_id' } as any) as any)
            }
        } catch (error) {
            console.error('Error updating reaction:', error)
            // Rollback
            setUserReaction(prevReaction)
            setLikes(initialLikes)
        }
    }

    const handleMainClick = () => {
        if (userReaction) {
            handleReaction(userReaction) // Remove
        } else {
            handleReaction('like') // Add like
        }
    }

    const currentReaction = userReaction
        ? REACTIONS.find(r => r.type === userReaction)
        : null

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <AnimatePresence>
                {showReactions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -45, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-800 border border-border rounded-full shadow-xl p-1.5 flex gap-1 z-50 origin-bottom-left"
                    >
                        {REACTIONS.map((reaction) => (
                            <button
                                key={reaction.type}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleReaction(reaction.type)
                                }}
                                className="p-2 hover:scale-125 transition-transform rounded-full text-2xl leading-none"
                                title={reaction.label}
                            >
                                {reaction.emoji}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={handleMainClick}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 hover:bg-white/5",
                    currentReaction ? currentReaction.color : 'text-text-secondary'
                )}
            >
                {currentReaction ? (
                    <span className="text-xl leading-none">{currentReaction.emoji}</span>
                ) : (
                    <ThumbsUp size={18} />
                )}
                {showLabel && (
                    <span className="text-sm font-bold">
                        {currentReaction ? currentReaction.label : 'Gosto'}
                    </span>
                )}
                {showCount && (
                    <span className="text-sm font-bold">
                        {likes}
                    </span>
                )}
            </button>
        </div>
    )
}
