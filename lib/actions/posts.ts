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
            likes (user_id, reaction_type)
        `)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .range(from, to) as any

    if (!posts) return { data: [], nextCursor: null }

    const postsWithLikes = posts.map(post => {
        const userLike = post.likes?.find((like: any) => like.user_id === user.id)
        return {
            ...post,
            isLiked: !!userLike,
            userReaction: userLike?.reaction_type || null
        }
    })

    const nextCursor = posts.length === PAGE_SIZE ? page + 1 : null

    return {
        data: postsWithLikes,
        nextCursor
    }
}
