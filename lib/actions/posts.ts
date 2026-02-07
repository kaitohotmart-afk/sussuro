'use server'

import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 10

export async function fetchPosts(page: number = 1) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: [], nextCursor: null }

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            users (username, avatar_type, avatar_value),
            likes (user_id, reaction_type, users (username))
        `)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .range(from, to) as any

    if (!posts) return { data: [], nextCursor: null }

    const postsWithLikes = posts.map((post: any) => {
        const userLike = post.likes?.find((like: any) => like.user_id === user.id)

        // Calculate top reactions and latest reactor for fallback
        const reactions = post.likes || []
        const reactionCounts: Record<string, number> = {}
        reactions.forEach((l: any) => {
            const type = l.reaction_type || 'like'
            reactionCounts[type] = (reactionCounts[type] || 0) + 1
        })
        const topReactions = Object.entries(reactionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type]) => type)

        const latestReactor = reactions.length > 0 ? reactions[reactions.length - 1].users?.username : null

        return {
            ...post,
            isLiked: !!userLike,
            userReaction: userLike?.reaction_type || null,
            top_reactions: topReactions,
            latest_reactor: latestReactor
        }
    })

    const nextCursor = posts.length === PAGE_SIZE ? page + 1 : null

    return {
        data: postsWithLikes,
        nextCursor
    }
}
