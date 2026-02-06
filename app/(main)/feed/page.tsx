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
      {/* Simple header */}
      <header className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold border-b-2 border-accent pb-1">Recentes</h1>
            <Link href="/explorar" className="text-xl font-bold text-text-secondary hover:text-text-primary transition-colors">
              🔥 Explorar
            </Link>
          </div>
          <div className="flex gap-2">
            <Link href="/criar-post" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">
              Criar Post
            </Link>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Recentes</h2>

        {initialPosts && initialPosts.length > 0 ? (
          <FeedList initialPosts={initialPosts} userId={user.id} />
        ) : (
          <p className="text-center text-text-secondary py-8">
            Nenhum post ainda. Seja o primeiro a postar!
          </p>
        )}
      </main>
    </div>
  )
}
