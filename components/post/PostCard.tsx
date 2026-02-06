'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { ReactionButton } from '@/components/post/ReactionButton'
import { ShareButton } from '@/components/post/ShareButton'
import { ReportButton } from '@/components/post/ReportButton'
import { SaveButton } from '@/components/post/SaveButton'
import { formatRelativeTime } from '@/lib/utils/format'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface PostCardProps {
    post: any
    userId: string
}

export function PostCard({ post, userId }: PostCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const contentLimit = 300 // Character limit for truncation
    const shouldTruncate = post.content.length > contentLimit

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="group"
        >
            <Card className="hover:border-accent/40 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 overflow-hidden">
                {/* Author */}
                <div className="flex items-center gap-3 mb-5">
                    <Link href={`/perfil/${post.users.username}`} className="flex items-center gap-3 group/author">
                        <div className="relative">
                            <Avatar
                                type={post.users.avatar_type as 'icon'}
                                value={post.users.avatar_value}
                                size="md"
                                className="ring-2 ring-white/5 group-hover/author:ring-accent/30 transition-all"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full shadow-lg" />
                        </div>
                        <div>
                            <p className="font-bold text-text-primary group-hover/author:text-accent transition-colors leading-tight">
                                {post.users.username}
                            </p>
                            <p className="text-xs text-text-secondary">
                                {formatRelativeTime(post.created_at)}
                            </p>
                        </div>
                    </Link>
                    <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-text-secondary group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/20 transition-all">
                        {post.category}
                    </span>
                </div>

                {/* Content */}
                <div className="mb-6 space-y-3">
                    {post.title && (
                        <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
                            {post.title}
                        </h2>
                    )}
                    <div className="relative group/content">
                        <p className={cn(
                            "text-text-secondary leading-relaxed text-base transition-colors group-hover:text-text-primary",
                            !isExpanded && "line-clamp-6"
                        )}>
                            {post.content}
                        </p>
                        {shouldTruncate && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-2 text-sm font-black text-accent hover:text-accent-hover uppercase tracking-widest transition-all flex items-center gap-1 active:scale-95"
                            >
                                {isExpanded ? (
                                    <>
                                        Ler menos <span className="text-xs">↑</span>
                                    </>
                                ) : (
                                    <>
                                        Ler mais <span className="text-xs">↓</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 sm:gap-6">
                        <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-white/5">
                            <ReactionButton
                                postId={post.id}
                                initialLikes={post.like_count}
                                initialIsLiked={post.isLiked}
                                initialReactionType={post.userReaction}
                                userId={userId}
                            />
                        </div>

                        <Link
                            href={`/post/${post.id}`}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all group/action"
                        >
                            <MessageCircle size={18} className="text-text-secondary group-hover/action:text-accent transition-colors" />
                            <span className="text-sm font-bold text-text-secondary group-hover/action:text-accent">{post.comment_count}</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-white/5">
                                <ShareButton postId={post.id} />
                            </div>
                            <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-white/5">
                                <SaveButton postId={post.id} initialIsSaved={post.isSaved} />
                            </div>
                        </div>
                    </div>

                    {/* Moderation */}
                    <ReportButton postId={post.id} userId={userId} />
                </div>
            </Card>
        </motion.div>
    )
}
