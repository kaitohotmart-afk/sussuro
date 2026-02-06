'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { voteInBattle } from '@/lib/actions/arena'
import canvasConfetti from 'canvas-confetti'
import { toast } from 'sonner'

interface BattleViewProps {
    battle: any
}

export function BattleView({ battle }: BattleViewProps) {
    const [isVoting, setIsVoting] = useState(false)
    // Local state for immediate feedback, though we use revalidatePath
    const [hasVoted, setHasVoted] = useState(!!battle.userVote)
    const [votesA, setVotesA] = useState(battle.votes_a)
    const [votesB, setVotesB] = useState(battle.votes_b)

    const handleVote = async (postId: string, isOptionA: boolean) => {
        if (hasVoted || isVoting) return

        setIsVoting(true)

        // Optimistic
        setHasVoted(true)
        if (isOptionA) setVotesA((v: number) => v + 1)
        else setVotesB((v: number) => v + 1)

        // Confetti
        canvasConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#ec4899', '#ffffff'] // Brand colors
        })

        const result = await voteInBattle(battle.id, postId)

        if (result?.error) {
            toast.error('Erro ao votar. Tente novamente.')
            setHasVoted(false) // Revert
        } else {
            toast.success('Voto computado! ⚔️')
        }

        setIsVoting(false)
    }

    const PostOption = ({ post, count, isA }: { post: any, count: number, isA: boolean }) => {
        const isSelected = battle.userVote === post.id
        const showResults = hasVoted
        const percentage = showResults
            ? Math.round((count / (votesA + votesB || 1)) * 100)
            : 0

        return (
            <div className={cn(
                "relative flex-1 flex flex-col h-full transition-all duration-300",
                showResults && !isSelected && "opacity-60 scale-95",
                showResults && isSelected && "ring-2 ring-accent scale-105 z-10 shadow-xl rounded-xl"
            )}>
                <Card className="h-full flex flex-col border-none bg-surface/50 hover:bg-surface/80 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar
                            type={post.users.avatar_type}
                            value={post.users.avatar_value}
                            size="sm"
                        />
                        <div>
                            <p className="font-bold text-sm">{post.users.username}</p>
                            <p className="text-xs text-text-secondary">
                                {formatRelativeTime(post.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 mb-6">
                        <p className="text-lg leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>

                    {showResults ? (
                        <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black">{percentage}%</span>
                                <span className="text-sm text-text-secondary">{count} votos</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-1000 ease-out"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            {isSelected && (
                                <p className="text-center text-accent text-sm font-medium mt-2">
                                    Seu voto 🏆
                                </p>
                            )}
                        </div>
                    ) : (
                        <Button
                            onClick={() => handleVote(post.id, isA)}
                            disabled={isVoting}
                            className="w-full bg-surface-hover hover:bg-accent hover:text-white transition-all transform hover:scale-105 active:scale-95"
                        >
                            Votar Nesta História
                        </Button>
                    )}
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 relative">

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-md border border-accent/50 rounded-full p-4 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-500 italic">
                            VS
                        </span>
                    </div>
                </div>

                <PostOption post={battle.post_a} count={votesA} isA={true} />
                <PostOption post={battle.post_b} count={votesB} isA={false} />
            </div>
        </div>
    )
}
