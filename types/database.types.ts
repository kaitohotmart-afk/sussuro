export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    username: string
                    avatar_type: string
                    avatar_value: string
                    bio: string | null
                    created_at: string
                    updated_at: string
                    is_banned: boolean
                    ban_reason: string | null
                    total_posts: number
                    total_likes_received: number
                    total_comments_made: number
                    follower_count: number
                    following_count: number
                    last_post_at: string | null
                    posts_today: number
                    posts_this_hour: number
                    last_comment_at: string | null
                }
                Insert: {
                    id?: string
                    email: string
                    username: string
                    avatar_type?: string
                    avatar_value: string
                    bio?: string | null
                    created_at?: string
                    updated_at?: string
                    is_banned?: boolean
                    ban_reason?: string | null
                    total_posts?: number
                    total_likes_received?: number
                    total_comments_made?: number
                    follower_count?: number
                    following_count?: number
                    last_post_at?: string | null
                    posts_today?: number
                    posts_this_hour?: number
                    last_comment_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    username?: string
                    avatar_type?: string
                    avatar_value?: string
                    bio?: string
                    created_at?: string
                    updated_at?: string
                    is_banned?: boolean
                    ban_reason?: string | null
                    total_posts?: number
                    total_likes_received?: number
                    total_comments_made?: number
                    follower_count?: number
                    following_count?: number
                    last_post_at?: string | null
                    posts_today?: number
                    posts_this_hour?: number
                    last_comment_at?: string | null
                }
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    content: string
                    category: string
                    post_type: string
                    is_sensitive: boolean
                    created_at: string
                    updated_at: string
                    like_count: number
                    comment_count: number
                    report_count: number
                    is_removed: boolean
                    removed_reason: string | null
                    removed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    content: string
                    category: string
                    post_type?: string
                    is_sensitive?: boolean
                    created_at?: string
                    updated_at?: string
                    like_count?: number
                    comment_count?: number
                    report_count?: number
                    is_removed?: boolean
                    removed_reason?: string | null
                    removed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    content?: string
                    category?: string
                    post_type?: string
                    is_sensitive?: boolean
                    created_at?: string
                    updated_at?: string
                    like_count?: number
                    comment_count?: number
                    report_count?: number
                    is_removed?: boolean
                    removed_reason?: string | null
                    removed_at?: string | null
                }
            }
            comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    content: string
                    created_at: string
                    updated_at: string
                    like_count: number
                    report_count: number
                    is_removed: boolean
                    removed_reason: string | null
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    content: string
                    created_at?: string
                    updated_at?: string
                    like_count?: number
                    report_count?: number
                    is_removed?: boolean
                    removed_reason?: string | null
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                    updated_at?: string
                    like_count?: number
                    report_count?: number
                    is_removed?: boolean
                    removed_reason?: string | null
                }
            }
            likes: {
                Row: {
                    id: string
                    user_id: string
                    post_id: string
                    reaction_type: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: string
                    reaction_type?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: string
                    reaction_type?: string
                    created_at?: string
                }
            }
            follows: {
                Row: {
                    id: string
                    follower_id: string
                    following_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    follower_id: string
                    following_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    follower_id?: string
                    following_id?: string
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    emoji: string
                    description: string
                    sort_order: number
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    name: string
                    emoji: string
                    description: string
                    sort_order?: number
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    name?: string
                    emoji?: string
                    description?: string
                    sort_order?: number
                    is_active?: boolean
                }
            }
            reports: {
                Row: {
                    id: string
                    reporter_id: string
                    reported_user_id: string | null
                    post_id: string | null
                    comment_id: string | null
                    reason: string
                    description: string | null
                    status: string
                    created_at: string
                    reviewed_at: string | null
                    reviewed_by: string | null
                    action_taken: string | null
                }
                Insert: {
                    id?: string
                    reporter_id: string
                    reported_user_id?: string | null
                    post_id?: string | null
                    comment_id?: string | null
                    reason: string
                    description?: string | null
                    status?: string
                    created_at?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    action_taken?: string | null
                }
                Update: {
                    id?: string
                    reporter_id?: string
                    reported_user_id?: string | null
                    post_id?: string | null
                    comment_id?: string | null
                    reason?: string
                    description?: string | null
                    status?: string
                    created_at?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    action_taken?: string | null
                }
            }
        }
    }
}
