'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils/format'
import { Heart } from 'lucide-react'
import { toggleCommentLike } from '@/lib/actions/comment'
import { cn } from '@/lib/utils/cn'

interface CommentItemProps {
    comment: any
    initialIsLiked: boolean
}

export function CommentItem({ comment, initialIsLiked }: CommentItemProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likesCount, setLikesCount] = useState(comment.like_count || 0)
    const [isPending, setIsPending] = useState(false)

    const handleLike = async () => {
        if (isPending) return

        // Optimistic update
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikesCount((prev: number) => newIsLiked ? prev + 1 : prev - 1)

        setIsPending(true)
        try {
            await toggleCommentLike(comment.id)
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked)
            setLikesCount((prev: number) => !newIsLiked ? prev + 1 : prev - 1)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex gap-3 group">
            <Avatar
                type={comment.users.avatar_type as 'icon'}
                value={comment.users.avatar_value}
                size="xs"
            />
            <div className="flex-1">
                <div className="bg-surface border border-border rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-text-primary">
                                {comment.users.username}
                            </span>
                            <span className="text-xs text-text-secondary">
                                {formatRelativeTime(comment.created_at)}
                            </span>
                        </div>
                    </div>
                    <p className="text-text-primary text-sm whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                    </p>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-4 mt-1 ml-2">
                    <button
                        onClick={handleLike}
                        className={cn(
                            "flex items-center gap-1.5 text-xs font-medium transition-colors p-1 rounded-md hover:bg-white/5",
                            isLiked ? "text-red-500" : "text-text-secondary hover:text-red-400"
                        )}
                    >
                        <Heart size={14} className={isLiked ? "fill-current" : ""} />
                        {likesCount > 0 && <span>{likesCount}</span>}
                        <span className="sr-only">Curtir</span>
                    </button>

                    {/* Placeholder for future Reply button */}
                    {/* <button className="text-xs font-medium text-text-secondary hover:text-text-primary p-1">
                        Responder
                    </button> */}
                </div>
            </div>
        </div>
    )
}
