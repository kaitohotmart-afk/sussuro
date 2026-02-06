'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'
import { ThumbsUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReactionButtonProps {
    postId: string
    initialLikes: number
    initialIsLiked: boolean
    initialReactionType?: string | null
    userId: string
}

const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Curtir' },
    { type: 'love', emoji: '❤️', label: 'Amei' },
    { type: 'haha', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Uau' },
    { type: 'sad', emoji: '😢', label: 'Triste' },
    { type: 'angry', emoji: '😡', label: 'Grr' },
]

export function ReactionButton({
    postId,
    initialLikes,
    initialReactionType = null,
    userId
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

    const currentEmoji = userReaction
        ? REACTIONS.find(r => r.type === userReaction)?.emoji
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
                className={`flex items-center gap-2 transition-colors ${userReaction ? 'text-blue-500' : 'text-text-secondary hover:text-text-primary'
                    }`}
            >
                {currentEmoji ? (
                    <span className="text-xl leading-none">{currentEmoji}</span>
                ) : (
                    <ThumbsUp size={20} />
                )}
                <span className={`font-medium ${userReaction ? 'text-blue-500' : ''}`}>
                    {likes}
                </span>
            </button>
        </div>
    )
}
