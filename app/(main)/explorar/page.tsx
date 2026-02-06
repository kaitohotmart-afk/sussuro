import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExploreFeedList } from '@/components/feed/ExploreFeedList'
import { fetchExplorePosts } from '@/lib/actions/explore'

export default async function ExplorePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Initial fetch for Explore (Page 1)
    const { data: initialPosts } = await fetchExplorePosts(1)

    return (
        <div className="min-h-screen">
            {/* Header with Tabs */}
            <header className="sticky top-0 z-10 bg-surface border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/feed" className="text-xl font-bold text-text-secondary hover:text-text-primary transition-colors">
                            Recentes
                        </Link>
                        <h1 className="text-2xl font-bold text-text-primary border-b-2 border-accent pb-1">
                            🔥 Explorar
                        </h1>
                    </div>
                    <Link href="/criar-post" className="px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                        Postar
                    </Link>
                </div>
            </header>

            {/* Feed */}
            <main className="max-w-2xl mx-auto p-4 space-y-4">
                {initialPosts && initialPosts.length > 0 ? (
                    <ExploreFeedList initialPosts={initialPosts} userId={user.id} />
                ) : (
                    <div className="text-center py-12 space-y-4">
                        <p className="text-text-secondary">
                            O algoritmo está coletando dados...
                            <br />
                            Seja o primeiro a viralizar!
                        </p>
                        <Link href="/criar-post" className="inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transistion-colors">
                            Criar Post
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
