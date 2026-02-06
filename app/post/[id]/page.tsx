import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { ReactionButton } from '@/components/post/ReactionButton'
import { CommentForm } from '@/components/post/CommentForm'
import { CommentList } from '@/components/post/CommentList'
import { ShareButton } from '@/components/post/ShareButton'
import { formatRelativeTime } from '@/lib/utils/format'
import { redirect, notFound } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default async function PostDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch post with user's like status
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
      *,
      users (username, avatar_type, avatar_value),
      likes (user_id, reaction_type)
    `)
        .eq('id', params.id)
        .eq('is_removed', false)
        .single()

    if (error || !post) {
        notFound()
    }

    const userLike = post.likes?.find((like: any) => like.user_id === user.id)
    const isLiked = !!userLike
    const userReaction = userLike?.reaction_type || null

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/feed" className="text-text-secondary hover:text-text-primary">
                        ← Voltar
                    </Link>
                    <h1 className="text-lg font-bold">Post</h1>
                </div>
            </header>

            {/* Post Content */}
            <main className="max-w-2xl mx-auto p-4">
                <Card>
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar
                            type={post.users.avatar_type as 'icon'}
                            value={post.users.avatar_value}
                            size="sm"
                        />
                        <div>
                            <p className="font-medium">{post.users.username}</p>
                            <p className="text-xs text-text-secondary">
                                {formatRelativeTime(post.created_at)}
                            </p>
                        </div>
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
                    <div className="flex items-center gap-6 text-text-secondary border-t border-border pt-3">
                        <ReactionButton
                            postId={post.id}
                            initialLikes={post.like_count}
                            initialIsLiked={isLiked}
                            initialReactionType={userReaction}
                            userId={user.id}
                        />
                        <div className="flex items-center gap-2">
                            <MessageCircle size={20} />
                            <span>{post.comment_count}</span>
                        </div>
                        <ShareButton postId={post.id} />
                    </div>
                </Card>

                {/* Comments Section */}
                <div className="mt-6 space-y-4">
                    <h2 className="text-lg font-semibold">Comentários</h2>

                    {/* Comment Form */}
                    <Card>
                        <CommentForm postId={post.id} userId={user.id} />
                    </Card>

                    {/* Comment List */}
                    <Card>
                        <CommentList postId={post.id} />
                    </Card>
                </div>
            </main>
        </div>
    )
}
