'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { fetchPosts } from '@/lib/actions/posts'
import { PostCard } from '@/components/post/PostCard'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'

interface FeedListProps {
    initialPosts: any[]
    userId: string
}

export function FeedList({ initialPosts, userId }: FeedListProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [page, setPage] = useState(2) // Start from page 2 since page 1 is initialPosts
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)

    // Setup intersection observer for infinite scroll
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '100px', // Load when 100px before end
    })

    const loadMore = async () => {
        if (loading || !hasMore) return

        setLoading(true)
        try {
            const { data, nextCursor } = await fetchPosts(page)

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
            console.error('Error loading posts:', error)
        } finally {
            setLoading(false)
        }
    }

    // Trigger loadMore when inView (infinite scroll)
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
                        // Fallback button if observer fails or for accessibility
                        <Button variant="ghost" onClick={loadMore}>
                            Carregar Mais
                        </Button>
                    )}
                </div>
            ) : (
                <p className="text-center text-text-secondary py-8">
                    Isso é tudo por enquanto! 👻
                </p>
            )}
        </div>
    )
}
