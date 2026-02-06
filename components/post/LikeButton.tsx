'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
    postId: string
    initialLikes: number
    initialIsLiked: boolean
    userId: string | null
}

export function LikeButton({ postId, initialLikes, initialIsLiked, userId }: LikeButtonProps) {
    const router = useRouter()
    const supabase = createClient()
    const [likes, setLikes] = useState(initialLikes)
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [isLoading, setIsLoading] = useState(false)

    const handleLike = async () => {
        if (!userId) {
            router.push('/login')
            return
        }

        setIsLoading(true)

        if (isLiked) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', userId)
                .eq('post_id', postId)

            if (!error) {
                setLikes(prev => prev - 1)
                setIsLiked(false)
            }
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert({
                    user_id: userId,
                    post_id: postId,
                })

            if (!error) {
                setLikes(prev => prev + 1)
                setIsLiked(true)
            }
        }

        setIsLoading(false)
        router.refresh()
    }

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-2 transition-colors ${isLiked
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-accent'
                } disabled:opacity-50`}
        >
            <Heart
                size={20}
                fill={isLiked ? 'currentColor' : 'none'}
                className="transition-all"
            />
            <span>{likes}</span>
        </button>
    )
}
