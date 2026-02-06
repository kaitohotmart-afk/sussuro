import Link from 'next/link'
import { Notification } from '@/lib/hooks/useNotifications'
import { Avatar } from '@/components/ui/Avatar'
import { Heart, MessageCircle, UserPlus, Info, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NotificationItemProps {
    notification: Notification
    onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const isLike = notification.type === 'like'
    const isComment = notification.type === 'comment'
    const isFollow = notification.type === 'follow'
    const isSystem = notification.type === 'system'
    const isReport = notification.type === 'report_update'

    let Icon = Info
    let iconColor = 'text-blue-400'
    let content = ''
    let link = '#'

    if (isLike) {
        Icon = Heart
        iconColor = 'text-red-500' // Always red for heart
        content = `curtiu seu post.`
        link = `/post/${notification.entity_id}`
    } else if (isComment) {
        Icon = MessageCircle
        iconColor = 'text-purple-400'
        content = `comentou: "${notification.metadata?.content_preview || '...'}"`
        link = `/post/${notification.entity_id}`
    } else if (isFollow) {
        Icon = UserPlus
        iconColor = 'text-green-400'
        content = `começou a seguir você.`
        link = `/perfil/${notification.users?.username}`
    } else if (isReport) {
        Icon = AlertTriangle
        iconColor = 'text-yellow-400'
        content = `Atualização sobre sua denúncia: ${notification.metadata?.status}`
    } else if (isSystem) {
        content = notification.metadata?.message || 'Nova notificação do sistema.'
    }

    return (
        <div
            onClick={() => !notification.is_read && onRead(notification.id)}
            className={`
                group relative flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer
                ${notification.is_read
                    ? 'bg-transparent border-transparent hover:bg-white/5'
                    : 'bg-accent/5 border-accent/20 hover:bg-accent/10'}
            `}
        >
            {/* Actor Avatar */}
            {notification.users ? (
                <div className="relative">
                    <Avatar
                        type={notification.users.avatar_type}
                        value={notification.users.avatar_value}
                        size="md"
                    />
                    {/* Tiny Icon Badge */}
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-surface border border-surface ${iconColor}`}>
                        <Icon size={12} fill={isLike ? "currentColor" : "none"} />
                    </div>
                </div>
            ) : (
                <div className={`p-3 rounded-full bg-white/5 ${iconColor}`}>
                    <Icon size={20} />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">
                    {notification.users && (
                        <span className="font-bold mr-1">{notification.users.username}</span>
                    )}
                    {content}
                </p>
                <span className="text-xs text-text-secondary mt-1 block">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                </span>
            </div>

            {/* Read Indicator (Dot) */}
            {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
            )}

            {/* Whole card link */}
            {link !== '#' && (
                <Link href={link} className="absolute inset-0" aria-label="Ver detalhes" />
            )}
        </div>
    )
}
