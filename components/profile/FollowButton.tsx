'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { toggleFollow } from '@/lib/actions/follow'
import { toast } from 'sonner'
import { UserPlus, UserCheck } from 'lucide-react'

interface FollowButtonProps {
    targetUserId: string
    initialIsFollowing: boolean
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)

    const handleToggle = () => {
        // Optimistic update
        const newState = !isFollowing
        setIsFollowing(newState)

        startTransition(async () => {
            const result = await toggleFollow(targetUserId)

            if (result.error) {
                toast.error('Erro ao seguir usuário')
                setIsFollowing(!newState) // Revert
            } else {
                if (newState) {
                    toast.success('Você agora está seguindo!')
                } else {
                    toast.info('Deixou de seguir.')
                }
            }
        })
    }

    return (
        <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className="w-full sm:w-auto"
        >
            {isFollowing ? (
                <>
                    <UserCheck size={16} className="mr-2" />
                    Seguindo
                </>
            ) : (
                <>
                    <UserPlus size={16} className="mr-2" />
                    Seguir
                </>
            )}
        </Button>
    )
}
