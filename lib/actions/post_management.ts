'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deletePost(postId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Não autorizado')
    }

    const { error } = await supabase
        .from('posts')
        .update({
            is_removed: true,
            removed_at: new Date().toISOString(),
            removed_reason: 'deleted_by_user'
        } as any)
        .eq('id', postId)
        .eq('user_id', user.id)

    if (error) {
        throw new Error('Erro ao excluir post')
    }

    revalidatePath('/feed')
    revalidatePath(`/perfil/${user.id}`)
}

export async function updatePost(postId: string, data: {
    title?: string
    content: string
    category: string
    is_sensitive: boolean
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Não autorizado')
    }

    const { error } = await supabase
        .from('posts')
        .update({
            title: data.title,
            content: data.content,
            category: data.category,
            is_sensitive: data.is_sensitive,
            updated_at: new Date().toISOString()
        } as any)
        .eq('id', postId)
        .eq('user_id', user.id)

    if (error) {
        throw new Error('Erro ao atualizar post')
    }

    revalidatePath('/feed')
    revalidatePath(`/post/${postId}`)
    revalidatePath(`/perfil/${user.id}`)
}
