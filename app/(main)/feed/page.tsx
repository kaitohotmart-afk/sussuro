import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FeedList } from '@/components/feed/FeedList'
import { fetchPosts } from '@/lib/actions/posts'

export default async function FeedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Initial fetch using the server action helper
  // Page 1 is fetched initially server-side
  const { data: initialPosts } = await fetchPosts(1)

  return (
    <div className="min-h-screen">
      {/* Feed content is centered and well-spaced */}
      <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">
              Recentes
            </h1>
            <Link
              href="/explorar"
              className="text-lg font-medium text-text-secondary hover:text-accent transition-all hover:scale-105"
            >
              🔥 Explorar
            </Link>
          </div>
          <Link
            href="/criar-post"
            className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
          >
            Criar Post
          </Link>
        </div>

        {initialPosts && initialPosts.length > 0 ? (
          <FeedList initialPosts={initialPosts} userId={user.id} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/30 border border-border/50 rounded-2xl border-dashed">
            <p className="text-text-secondary text-lg">
              Nenhum post ainda. Seja o primeiro a postar! 👻
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
