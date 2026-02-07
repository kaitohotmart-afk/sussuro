'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

interface ReactionSummaryProps {
    likeCount: number
    commentCount: number
    topReactions?: string[]
    latestReactor?: string | null
    isUserReaction?: boolean
    className?: string
}

const REACTION_CONFIG: Record<string, { emoji: string, bg: string }> = {
    like: { emoji: '👍', bg: 'bg-[#1877F2]' },
    love: { emoji: '❤️', bg: 'bg-[#F33E58]' },
    haha: { emoji: '😂', bg: 'bg-[#F7B125]' },
    wow: { emoji: '😮', bg: 'bg-[#F7B125]' },
    sad: { emoji: '😢', bg: 'bg-[#F7B125]' },
    angry: { emoji: '😡', bg: 'bg-[#E9710F]' }
}

export function ReactionSummary({
    likeCount,
    commentCount,
    topReactions = [],
    latestReactor,
    isUserReaction,
    className
}: ReactionSummaryProps) {
    if (likeCount === 0 && commentCount === 0) return null

    // Fallback: if likeCount > 0 but topReactions is empty, show 'like'
    const reactionsToShow = topReactions.length > 0 ? topReactions : (likeCount > 0 ? ['like'] : [])

    const renderTextSummary = () => {
        if (likeCount === 0) return null

        if (isUserReaction) {
            if (likeCount === 1) return <><span className="font-bold text-text-primary">Você</span> reagiu</>
            return (
                <>
                    <span className="font-bold text-text-primary">Você</span> e {likeCount - 1} {likeCount - 1 === 1 ? 'pessoa' : 'pessoas'}
                </>
            )
        }

        if (latestReactor) {
            if (likeCount === 1) return <><span className="font-bold text-text-primary">{latestReactor}</span> reagiu</>
            return (
                <>
                    <span className="font-bold text-text-primary">{latestReactor}</span> e {likeCount - 1} outras pessoas
                </>
            )
        }

        return `${likeCount} ${likeCount === 1 ? 'reação' : 'reações'}`
    }

    return (
        <div className={cn("flex items-center justify-between py-2 border-b border-white/5 mb-2", className)}>
            <div className="flex items-center gap-2 overflow-hidden">
                {/* Emojis stack */}
                {reactionsToShow.length > 0 && (
                    <div className="flex -space-x-1 pr-1">
                        {reactionsToShow.slice(0, 3).map((type, i) => {
                            const config = REACTION_CONFIG[type] || REACTION_CONFIG.like
                            return (
                                <div
                                    key={`${type}-${i}`}
                                    className={cn(
                                        "relative flex items-center justify-center w-5 h-5 rounded-full border border-background text-[10px] leading-none z-[10]",
                                        config.bg
                                    )}
                                    style={{ zIndex: 10 - i }}
                                >
                                    <span className="mb-[1px]">{config.emoji}</span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Text summary */}
                {likeCount > 0 && (
                    <span className="text-sm text-text-secondary truncate">
                        {renderTextSummary()}
                    </span>
                )}
            </div>

            {/* Comment count on the right */}
            {commentCount > 0 && (
                <div className="text-sm text-text-secondary">
                    {commentCount} {commentCount === 1 ? 'comentário' : 'comentários'}
                </div>
            )}
        </div>
    )
}
