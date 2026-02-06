'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { commentSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/Button'
import type { z } from 'zod'

type CommentFormData = z.infer<typeof commentSchema>

interface CommentFormProps {
    postId: string
    userId: string
    onCommentAdded?: () => void
}

export function CommentForm({ postId, userId, onCommentAdded }: CommentFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [cooldownRemaining, setCooldownRemaining] = useState(0)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CommentFormData>({
        resolver: zodResolver(commentSchema),
    })

    const onSubmit = async (data: CommentFormData) => {
        setLoading(true)
        setError('')

        // Check comment cooldown
        const { data: userData } = await supabase
            .from('users')
            .select('last_comment_at')
            .eq('id', userId)
            .single()

        if (userData?.last_comment_at) {
            const lastCommentTime = new Date(userData.last_comment_at).getTime()
            const now = Date.now()
            const cooldownMs = 15 * 1000 // 15 seconds
            const elapsed = now - lastCommentTime

            if (elapsed < cooldownMs) {
                const remaining = Math.ceil((cooldownMs - elapsed) / 1000)
                setCooldownRemaining(remaining)
                setError(`Aguarde ${remaining} segundos antes de comentar novamente`)
                setLoading(false)

                // Start countdown
                const interval = setInterval(() => {
                    setCooldownRemaining(prev => {
                        if (prev <= 1) {
                            clearInterval(interval)
                            setError('')
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)

                return
            }
        }

        const { error: commentError } = await supabase.from('comments').insert({
            post_id: postId,
            user_id: userId,
            content: data.content,
        })

        if (commentError) {
            setError('Erro ao criar comentário')
            setLoading(false)
            return
        }

        reset()
        setLoading(false)
        onCommentAdded?.()
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {error && (
                <div className="bg-error/10 border border-error text-error px-3 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-2">
                <textarea
                    className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    placeholder="Adicione um comentário..."
                    rows={2}
                    {...register('content')}
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={loading || cooldownRemaining > 0}
                    className="self-end"
                >
                    {cooldownRemaining > 0 ? `${cooldownRemaining}s` : loading ? 'Enviando...' : 'Comentar'}
                </Button>
            </div>
            {errors.content && (
                <span className="text-sm text-error">{errors.content.message}</span>
            )}
        </form>
    )
}
