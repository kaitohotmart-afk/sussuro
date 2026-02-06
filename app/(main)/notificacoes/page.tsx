'use client'

import { useNotifications } from '@/lib/hooks/useNotifications'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { Button } from '@/components/ui/Button'
import { Loader2, CheckCheck, BellOff } from 'lucide-react'

export default function NotificationsPage() {
    const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications()

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-accent" />
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        Notificações
                        {unreadCount > 0 && (
                            <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-text-secondary hover:text-accent"
                        >
                            <CheckCheck size={16} className="mr-2" />
                            Marcar lidas
                        </Button>
                    )}
                </div>
            </header>

            {/* List */}
            <main className="max-w-2xl mx-auto p-4 space-y-2">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRead={markAsRead}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 space-y-4 text-text-secondary">
                        <BellOff size={48} className="mx-auto opacity-20" />
                        <p>Nenhuma notificação por enquanto.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
