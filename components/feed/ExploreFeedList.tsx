'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetchExplorePosts } from '@/lib/actions/explore'
import { PostCard } from '@/components/post/PostCard'
import { Button } from '@/components/ui/Button'
import { Loader2, Flame } from 'lucide-react'

interface ExploreFeedListProps {
    initialPosts: any[]
    userId: string
}

export function ExploreFeedList({ initialPosts, userId }: ExploreFeedListProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [page, setPage] = useState(2)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)

    // Setup intersection observer
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    })

    const loadMore = async () => {
        if (loading || !hasMore) return

        setLoading(true)
        try {
            const { data, nextCursor } = await fetchExplorePosts(page)

            if (data.length === 0) {
                setHasMore(false)
            } else {
                setPosts(prev => [...prev, ...data])
                if (nextCursor) {
                    setPage(nextCursor)
                } else {
                    setHasMore(false)
                }
            }
        } catch (error) {
            console.error('Error loading explore posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (inView && hasMore) {
            loadMore()
        }
    }, [inView, hasMore])

    return (
        <div className="space-y-4">


            {posts.map((post) => (
                <PostCard key={post.id} post={post} userId={userId} />
            ))}

            {hasMore ? (
                <div ref={ref} className="flex justify-center py-4">
                    {loading ? (
                        <Loader2 className="animate-spin text-accent" />
                    ) : (
                        <Button variant="ghost" onClick={loadMore}>
                            Carregar Mais
                        </Button>
                    )}
                </div>
            ) : (
                <p className="text-center text-text-secondary py-8">
                    Isso é tudo que está em alta no momento! 🔥
                </p>
            )}
        </div>
    )
}
