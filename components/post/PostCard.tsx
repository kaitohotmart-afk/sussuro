'use client'

import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { ReactionButton } from '@/components/post/ReactionButton'
import { ShareButton } from '@/components/post/ShareButton'
import { ReportButton } from '@/components/post/ReportButton'
import { SaveButton } from '@/components/post/SaveButton'
import { formatRelativeTime } from '@/lib/utils/format'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface PostCardProps {
    post: any
    userId: string
}

export function PostCard({ post, userId }: PostCardProps) {
    return (
        <Card>
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
                <Link href={`/perfil/${post.users.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar
                        type={post.users.avatar_type as 'icon'}
                        value={post.users.avatar_value}
                        size="sm"
                    />
                    <div>
                        <p className="font-medium hover:underline">{post.users.username}</p>
                        <p className="text-xs text-text-secondary">
                            {formatRelativeTime(post.created_at)}
                        </p>
                    </div>
                </Link>
                <span className="ml-auto text-sm bg-surface-hover px-2 py-1 rounded">
                    {post.category}
                </span>
            </div>

            {/* Content */}
            <div className="mb-4">
                {post.title && (
                    <h2 className="text-xl font-bold text-text-primary mb-2">
                        {post.title}
                    </h2>
                )}
                <p className="text-text-primary whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between text-text-secondary">
                <div className="flex items-center gap-6">
                    <ReactionButton
                        postId={post.id}
                        initialLikes={post.like_count}
                        initialIsLiked={post.isLiked}
                        initialReactionType={post.userReaction}
                        userId={userId}
                    />
                    <Link href={`/post/${post.id}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                        <MessageCircle size={20} />
                        <span>{post.comment_count}</span>
                    </Link>
                    <ShareButton postId={post.id} />
                    <SaveButton postId={post.id} initialIsSaved={post.isSaved} />
                </div>

                {/* Moderation */}
                <ReportButton postId={post.id} userId={userId} />
            </div>
        </Card>
    )
}
