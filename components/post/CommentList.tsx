import { createClient } from '@/lib/supabase/server'
import { CommentItem } from '@/components/post/CommentItem'

interface CommentListProps {
    postId: string
}

export async function CommentList({ postId }: CommentListProps) {
    const supabase = createClient()

    // Fetch comments sorted by likes (desc) then date (asc)
    const { data: comments } = await supabase
        .from('comments')
        .select(`
      *,
      users (username, avatar_type, avatar_value)
    `)
        .eq('post_id', postId)
        .eq('is_removed', false)
        .order('like_count', { ascending: false })
        .order('created_at', { ascending: true })

    // Fetch user's liked comments for this post to set initial state
    const { data: likedComments } = await (supabase.rpc as any)('get_user_liked_comments', { p_post_id: postId })

    const likedCommentIds = new Set(likedComments?.map((l: any) => l.comment_id) || [])

    if (!comments || comments.length === 0) {
        return (
            <p className="text-center text-text-secondary py-8 text-sm bg-surface/30 rounded-xl border border-dashed border-border">
                Nenhum comentário ainda. Seja o primeiro a opinar! 👇
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {comments.map((comment: any) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    initialIsLiked={likedCommentIds.has(comment.id)}
                />
            ))}
        </div>
    )
}
