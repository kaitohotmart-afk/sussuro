'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSavePost(postId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        // Check if already saved
        const { data: existingSave } = await supabase
            .from('saved_posts' as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', postId)
            .single()

        if (existingSave) {
            // Unsave
            await supabase
                .from('saved_posts' as any)
                .delete()
                .eq('id', (existingSave as any).id)
        } else {
            // Save
            await supabase
                .from('saved_posts' as any)
                .insert({
                    user_id: user.id,
                    post_id: postId
                } as any)
        }

        revalidatePath('/salvos')
        revalidatePath('/feed')

        return { success: true }
    } catch (error) {
        console.error('Error toggling save:', error)
        return { error: 'Failed to toggle save' }
    }
}
