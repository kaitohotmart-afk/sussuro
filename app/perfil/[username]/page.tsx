import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { FollowButton } from '@/components/profile/FollowButton'
import { LikeButton } from '@/components/post/LikeButton'
import { formatRelativeTime } from '@/lib/utils/format'
import { redirect, notFound } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: { username: string } }) {
    const supabase = createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
        redirect('/login')
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', params.username)
        .single()

    if (error || !profile) {
        notFound()
    }

    // Check if current user is following this profile
    const { data: followData } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
        .single()

    const isFollowing = !!followData

    // Fetch user's posts with like status
    const { data: posts } = await supabase
        .from('posts')
        .select(`
      *,
      users (username, avatar_type, avatar_value),
      likes (user_id)
    `)
        .eq('user_id', profile.id)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .limit(20)

    const postsWithLikes = posts?.map(post => ({
        ...post,
        isLiked: post.likes?.some((like: any) => like.user_id === currentUser.id) || false
    }))

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/feed" className="text-text-secondary hover:text-text-primary">
                        ← Voltar
                    </Link>
                    <h1 className="text-lg font-bold">Perfil</h1>
                </div>
            </header>

            {/* Profile */}
            <main className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Profile Header */}
                <Card>
                    <div className="flex items-start gap-4">
                        <Avatar
                            type={profile.avatar_type as 'icon'}
                            value={profile.avatar_value}
                            size="xl"
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">{profile.username}</h2>
                            {profile.bio && (
                                <p className="text-text-secondary whitespace-pre-wrap mb-4">{profile.bio}</p>
                            )}

                            {/* Stats */}
                            <div className="flex gap-6 text-sm mb-4">
                                <div>
                                    <span className="font-bold">{profile.total_posts}</span>
                                    <span className="text-text-secondary"> posts</span>
                                </div>
                                <div>
                                    <span className="font-bold">{profile.follower_count}</span>
                                    <span className="text-text-secondary"> seguidores</span>
                                </div>
                                <div>
                                    <span className="font-bold">{profile.following_count}</span>
                                    <span className="text-text-secondary"> seguindo</span>
                                </div>
                            </div>

                            {/* Actions: Follow OR Edit */}
                            {currentUser.id === profile.id ? (
                                <Link
                                    href="/perfil/editar"
                                    className="inline-flex items-center justify-center px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm font-medium transition-colors"
                                >
                                    Editar Perfil
                                </Link>
                            ) : (
                                <FollowButton
                                    targetUserId={profile.id}
                                    currentUserId={currentUser.id}
                                    initialIsFollowing={isFollowing}
                                    initialFollowerCount={profile.follower_count}
                                />
                            )}
                        </div>
                    </div>
                </Card>

                {/* Posts */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Posts de {profile.username}</h3>

                    {postsWithLikes && postsWithLikes.length > 0 ? (
                        <div className="space-y-4">
                            {postsWithLikes.map((post: any) => (
                                <Card key={post.id}>
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
                                    <p className="text-text-primary whitespace-pre-wrap mb-4">
                                        {post.content}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-6 text-text-secondary">
                                        <LikeButton
                                            postId={post.id}
                                            initialLikes={post.like_count}
                                            initialIsLiked={post.isLiked}
                                            userId={currentUser.id}
                                        />
                                        <Link href={`/post/${post.id}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                                            <MessageCircle size={20} />
                                            <span>{post.comment_count}</span>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-text-secondary py-8">
                            Nenhum post ainda
                        </p>
                    )}
                </div>
            </main>
        </div>
    )
}
