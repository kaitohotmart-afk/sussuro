import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { PostCard } from '@/components/post/PostCard'
import { FollowButton } from '@/components/profile/FollowButton'
import { MessageSquare, Heart, Users } from 'lucide-react'

export const metadata = {
    title: 'Perfil | Sussurro',
    description: 'Ver perfil do usuário no Sussurro.'
}

interface ProfilePageProps {
    params: {
        username: string
    }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const supabase = createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Fetch profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('username', params.username)
        .single()

    if (!profile) {
        notFound()
    }

    // Fetch stats (we could cache this or use counters in table)
    // Assuming counters are maintained in users table as per schema

    // Fetch user posts
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            users (username, avatar_type, avatar_value),
            likes (user_id),
            saved_posts (user_id)
        `)
        .eq('user_id', profile.id)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })

    // Enhance posts with isLiked/isSaved
    const postsWithStatus = posts?.map(post => ({
        ...post,
        isLiked: post.likes.some((l: any) => l.user_id === currentUser?.id),
        isSaved: post.saved_posts.some((s: any) => s.user_id === currentUser?.id),
        userReaction: null // Simplified for now
    })) || []

    // Check follow status
    let isFollowing = false
    if (currentUser && currentUser.id !== profile.id) {
        const { data: follow } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', currentUser.id)
            .eq('following_id', profile.id)
            .single()
        isFollowing = !!follow
    }

    return (
        <main className="min-h-screen pb-20">
            {/* Header / Cover */}
            <div className="bg-gradient-to-r from-accent/20 to-purple-900/20 h-32 md:h-48 relative">
                <div className="absolute -bottom-12 left-4 md:left-8 flex items-end">
                    <div className="p-1 bg-background rounded-full">
                        <Avatar
                            type={profile.avatar_type}
                            value={profile.avatar_value}
                            size="xl"
                        />
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 pt-14 md:pt-16 pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{profile.username}</h1>
                        <p className="text-text-secondary mt-1 max-w-lg">
                            {profile.bio || "Sem biografia."}
                        </p>
                    </div>

                    {currentUser && currentUser.id !== profile.id && (
                        <FollowButton
                            targetUserId={profile.id}
                            initialIsFollowing={isFollowing}
                        />
                    )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-8 border-y border-border py-4">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-accent" />
                        <span className="font-bold">{profile.follower_count}</span>
                        <span className="text-text-secondary text-sm">Seguidores</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-text-secondary" />
                        <span className="font-bold">{profile.following_count}</span>
                        <span className="text-text-secondary text-sm">Seguindo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare size={20} className="text-text-secondary" />
                        <span className="font-bold">{profile.total_posts}</span>
                        <span className="text-text-secondary text-sm">Posts</span>
                    </div>
                </div>

                {/* Content Tabs (Simplified) */}
                <h2 className="text-xl font-bold mb-4">Publicações</h2>

                {postsWithStatus.length > 0 ? (
                    <div className="grid gap-4">
                        {postsWithStatus.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                userId={currentUser?.id || ''}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-surface/30 rounded-lg text-text-secondary">
                        <p>Nenhuma publicação ainda.</p>
                    </div>
                )}
            </div>
        </main>
    )
}
