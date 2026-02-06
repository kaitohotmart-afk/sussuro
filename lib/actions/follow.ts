'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(targetUserId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }
    if (user.id === targetUserId) return { error: 'Cannot follow yourself' }

    // Check if already following
    const { data: existingFollow } = await supabase
        .from('follows')
        .select()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

    try {
        if (existingFollow) {
            // Unfollow
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', targetUserId)

            if (error) throw error
            revalidatePath(`/perfil`)
            return { following: false }
        } else {
            // Follow
            const { error } = await (supabase
                .from('follows')
                .insert({
                    follower_id: user.id,
                    following_id: targetUserId
                } as any) as any)

            if (error) throw error
            revalidatePath(`/perfil`)
            return { following: true }
        }
    } catch (error) {
        console.error('Error toggling follow:', error)
        return { error: 'Failed' }
    }
}
