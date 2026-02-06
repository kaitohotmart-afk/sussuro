'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleCommentLike(commentId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        // Check if already liked
        const { data: existingLike } = await supabase
            .from('comment_likes' as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('comment_id', commentId)
            .single()

        if (existingLike) {
            // Unlike
            await supabase
                .from('comment_likes' as any)
                .delete()
                .eq('id', (existingLike as any).id)
        } else {
            // Like
            await supabase
                .from('comment_likes' as any)
                .insert({
                    user_id: user.id,
                    comment_id: commentId
                } as any)
        }

        revalidatePath('/post/[id]')
        // Note: exact path revalidation might be tricky without knowing the post ID here, 
        // but typically we can revalidate the page user is on. 
        // For now, client-side optimistic UI handles the immediate feedback.

        return { success: true }
    } catch (error) {
        console.error('Error toggling comment like:', error)
        return { error: 'Failed to toggle like' }
    }
}
