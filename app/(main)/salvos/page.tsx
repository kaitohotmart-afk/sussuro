import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/post/PostCard'
import { redirect } from 'next/navigation'
import { Bookmark } from 'lucide-react'

export const metadata = {
    title: 'Posts Salvos | Sussurro',
    description: 'Seus posts favoritos salvos para ler depois.'
}

export default async function SavedPostsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch saved posts
    // We join saved_posts -> posts -> users
    const { data: savedItems } = await supabase
        .from('saved_posts')
        .select(`
            posts (
                *,
                users (username, avatar_type, avatar_value)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Extract posts from the join structure
    const posts = savedItems?.map((item: any) => item.posts) || []

    // For saved posts page, IS_SAVED is always true for these posts
    const postsWithStatus = posts.map(p => ({ ...p, isSaved: true }))

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 mb-6">
                <div className="flex items-center gap-2">
                    <Bookmark className="text-accent" />
                    <h1 className="text-xl font-bold">Posts Salvos</h1>
                </div>
            </header>

            <div className="px-4 space-y-6">
                {postsWithStatus.length > 0 ? (
                    postsWithStatus.map((post: any) => (
                        <PostCard key={post.id} post={post} userId={user.id} />
                    ))
                ) : (
                    <div className="text-center py-16 space-y-4 text-text-secondary">
                        <Bookmark size={48} className="mx-auto opacity-20" />
                        <p>Você ainda não salvou nenhum post.</p>
                        <p className="text-sm">Clique no ícone de salvar nos posts que você gostar!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
