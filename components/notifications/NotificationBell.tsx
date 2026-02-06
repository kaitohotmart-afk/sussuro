'use client'

import { useNotifications } from '@/lib/hooks/useNotifications'
import Link from 'next/link'
import { Bell } from 'lucide-react'

export function NotificationBell() {
    const { unreadCount } = useNotifications()

    return (
        <Link
            href="/notificacoes"
            className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-full transition-colors"
        >
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    )
}
