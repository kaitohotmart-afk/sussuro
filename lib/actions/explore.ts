'use server'

import { createClient } from '@/lib/supabase/server'

export async function fetchExplorePosts(page: number = 1) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const PAGE_SIZE = 20

    // Since we are creating a migration file but cannot run it, we need a fallback.
    // However, the best practice is to code for the RPC and assume the user runs the migration.
    // If the RPC fails (e.g. function not found), we should probably fallback to a standard query.

    try {
        const offset = (page - 1) * PAGE_SIZE

        const { data: posts, error } = await (supabase.rpc as any)('get_explore_feed', {
            limit_count: PAGE_SIZE,
            offset_count: offset
        })

        if (error) {
            console.error('Error fetching explore feed (RPC):', error)
            throw error
        }

        if (!posts) return { data: [], nextCursor: null }

        // We need to fetch likes for these posts to determine 'isLiked' status for the current user
        // The RPC returns specific fields, but not the user's reaction.
        // We can do a second query to fetch likes for these post IDs.

        const postIds = posts.map((p: any) => p.id)
        let likesMap = new Map()

        if (user && postIds.length > 0) {
            const { data: likes } = await supabase
                .from('likes')
                .select('post_id, reaction_type')
                .eq('user_id', user.id)
                .in('post_id', postIds)

            if (likes) {
                likes.forEach((like: any) => {
                    likesMap.set(like.post_id, like.reaction_type)
                })
            }
        }

        // Transform to match PostCard expected format
        const formattedPosts = posts.map((post: any) => ({
            ...post,
            users: {
                username: post.author_username,
                avatar_type: post.author_avatar_type,
                avatar_value: post.author_avatar_value
            },
            isLiked: likesMap.has(post.id),
            userReaction: likesMap.get(post.id) || null
        }))

        const nextCursor = posts.length === PAGE_SIZE ? page + 1 : null

        return {
            data: formattedPosts,
            nextCursor
        }

    } catch (e) {
        // Fallback for when RPC is not yet applied
        console.warn('Falling back to standard sorting due to error or missing RPC')

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
            // Simple sort by like_count as fallback
            .order('like_count', { ascending: false })
            .order('created_at', { ascending: false })
            .range(from, to) as any

        if (!posts) return { data: [], nextCursor: null }

        const postsWithLikes = posts.map((post: any) => {
            const userLike = post.likes?.find((like: any) => like.user_id === user?.id)
            return {
                ...post,
                isLiked: !!userLike,
                userReaction: userLike?.reaction_type || null
            }
        })

        return {
            data: postsWithLikes,
            nextCursor: posts.length === PAGE_SIZE ? page + 1 : null
        }
    }
}
