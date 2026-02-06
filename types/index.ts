import type { Database } from './database.types'

export type User = Database['public']['Tables']['users']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Like = Database['public']['Tables']['likes']['Row']

// Extended types with joined data
export type PostWithAuthor = Post & {
    users: Pick<User, 'username' | 'avatar_type' | 'avatar_value'>
}

export type CommentWithUser = Comment & {
    users: Pick<User, 'username' | 'avatar_type' | 'avatar_value'>
}

// Avatar options
export const AVATAR_ICONS = [
    '👻', '🎭', '🎪', '🎨', '🎬', '🎮', '🎲', '🎯', '🎸', '🎺',
    '🎻', '🥁', '🎹', '🎺', '🎷', '🦄', '🦋', '🦊', '🦁', '🐙',
    '🐢', '🦆', '🦉', '🦇', '🐺', '🐉', '🌙', '⭐', '💫', '🔮',
    '🌸', '🌺', '🌻', '🌼', '🌷', '🍄', '🌵', '🌴', '🌾', '🍃',
]

// Post categories
export const POST_CATEGORIES = [
    { value: 'Confissão', emoji: '🤫', label: 'Confissão' },
    { value: 'Desabafo', emoji: '💔', label: 'Desabafo' },
    { value: 'WTF', emoji: '🤯', label: 'WTF' },
    { value: 'Engraçado', emoji: '😂', label: 'Engraçado' },
    { value: 'Paranormal', emoji: '👻', label: 'Paranormal' },
    { value: 'Pensamento', emoji: '💭', label: 'Pensamento' },
    { value: 'Polêmico', emoji: '🔥', label: 'Polêmico' },
    { value: 'Chocante', emoji: '😱', label: 'Chocante' },
    { value: 'Relacionamentos', emoji: '💘', label: 'Relacionamentos' },
    { value: 'Trabalho', emoji: '👨‍💼', label: 'Trabalho' },
]

// Report reasons
export const REPORT_REASONS = [
    { value: 'identity_exposure', label: 'Exposição de identidade' },
    { value: 'hate_speech', label: 'Discurso de ódio' },
    { value: 'spam', label: 'Spam' },
    { value: 'violence', label: 'Violência' },
    { value: 'sexual_content', label: 'Conteúdo sexual' },
    { value: 'harassment', label: 'Assédio' },
    { value: 'misinformation', label: 'Desinformação' },
    { value: 'other', label: 'Outro' },
]

// Rate limits
export const RATE_LIMITS = {
    POSTS_PER_HOUR: parseInt(process.env.NEXT_PUBLIC_MAX_POSTS_PER_HOUR || '5'),
    POSTS_PER_DAY: parseInt(process.env.NEXT_PUBLIC_MAX_POSTS_PER_DAY || '20'),
    COMMENT_COOLDOWN_SECONDS: parseInt(process.env.NEXT_PUBLIC_COMMENT_COOLDOWN_SECONDS || '15'),
}
