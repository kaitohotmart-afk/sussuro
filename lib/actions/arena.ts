'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDailyBattle(category: string = 'historias') {
    const supabase = createClient()

    // Call RPC to ensure battle exists
    const { data: battleId, error: createError } = await supabase
        .rpc('get_or_create_daily_battle', { p_category: category })

    if (createError || !battleId) {
        console.error('Error getting daily battle:', createError)
        return null
    }

    // Fetch full battle details
    const { data: battle, error: fetchError } = await supabase
        .from('post_battles')
        .select(`
            *,
            post_a:posts!post_a_id (
                id, content, created_at, user_id,
                users (username, avatar_type, avatar_value)
            ),
            post_b:posts!post_b_id (
                id, content, created_at, user_id,
                users (username, avatar_type, avatar_value)
            )
        `)
        .eq('id', battleId)
        .single()

    if (fetchError) {
        console.error('Error fetching battle details:', fetchError)
        return null
    }

    // Check if user voted
    const { data: { user } } = await supabase.auth.getUser()
    let userVote = null

    if (user) {
        const { data: vote } = await supabase
            .from('battle_votes')
            .select('post_id')
            .eq('battle_id', battleId)
            .eq('user_id', user.id)
            .single()

        if (vote) userVote = vote.post_id
    }

    return { ...battle, userVote }
}

export async function voteInBattle(battleId: string, postId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    try {
        const { error } = await supabase
            .from('battle_votes')
            .insert({
                battle_id: battleId,
                user_id: user.id,
                post_id: postId
            })

        if (error) throw error

        revalidatePath('/arena')
        return { success: true }
    } catch (error) {
        console.error('Error voting:', error)
        return { error: 'Failed to vote' }
    }
}
