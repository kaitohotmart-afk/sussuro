import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { PostCard } from '@/components/post/PostCard'
import { FollowButton } from '@/components/profile/FollowButton'
import { MessageSquare, Heart, Users } from 'lucide-react'
import Link from 'next/link'

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
        .single() as any

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
        .order('created_at', { ascending: false }) as any

    // Enhance posts with isLiked/isSaved
    const postsWithStatus = posts?.map((post: any) => ({
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
        <main className="min-h-screen pb-20 bg-background/50">
            {/* Header / Cover */}
            <div className="relative h-48 md:h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-purple-900/40 to-black z-0" />
                <div className="absolute inset-0 backdrop-blur-[2px] z-[1]" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />

                <div className="max-w-4xl mx-auto px-4 h-full relative z-[3] flex items-end pb-8">
                    <div className="relative group/avatar">
                        <Avatar
                            type={profile.avatar_type}
                            value={profile.avatar_value}
                            size="xl"
                            className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-2xl ring-4 ring-accent/10 group-hover/avatar:ring-accent/30 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-green-500 border-4 border-background rounded-full shadow-lg" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
                                {profile.username}
                            </h1>
                            <p className="text-lg text-text-secondary leading-relaxed">
                                {profile.bio || "Este sussurrador prefere o mistério."}
                            </p>
                        </div>

                        {/* Stats - Redesigned as Chips */}
                        <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2 group hover:bg-white/10 transition-colors">
                                <Users size={16} className="text-accent" />
                                <span className="text-sm font-bold text-text-primary">{profile.follower_count}</span>
                                <span className="text-xs text-text-secondary font-medium">Seguidores</span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2 group hover:bg-white/10 transition-colors">
                                <Users size={16} className="text-text-secondary" />
                                <span className="text-sm font-bold text-text-primary">{profile.following_count}</span>
                                <span className="text-xs text-text-secondary font-medium">Seguindo</span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2 group hover:bg-white/10 transition-colors">
                                <MessageSquare size={16} className="text-text-secondary" />
                                <span className="text-sm font-bold text-text-primary">{profile.total_posts}</span>
                                <span className="text-xs text-text-secondary font-medium">Posts</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 shrink-0">
                        {currentUser && currentUser.id !== profile.id && (
                            <FollowButton
                                targetUserId={profile.id}
                                initialIsFollowing={isFollowing}
                            />
                        )}

                        {currentUser && currentUser.id === profile.id && (
                            <Link
                                href="/perfil/editar"
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all active:scale-95 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                Editar Perfil
                            </Link>
                        )}
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">
                            Publicações
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    {postsWithStatus.length > 0 ? (
                        <div className="grid gap-6 max-w-2xl mx-auto">
                            {postsWithStatus.map((post: any) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    userId={currentUser?.id || ''}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-surface/20 border border-white/5 border-dashed rounded-3xl max-w-2xl mx-auto">
                            <p className="text-text-secondary text-lg">Sem sussurros por aqui ainda... 🤫</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
