import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface Notification {
    id: string
    recipient_id: string
    actor_id: string
    type: 'like' | 'comment' | 'follow' | 'reply' | 'mention' | 'system' | 'report_update'
    entity_id: string | null
    metadata: any
    is_read: boolean
    created_at: string
    users?: {
        username: string
        avatar_type: string
        avatar_value: string
    }
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    const fetchNotifications = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Join with actor details
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    users:actor_id (username, avatar_type, avatar_value)
                `)
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error

            setNotifications(data as any)
            setUnreadCount(data.filter((n: any) => !n.is_read).length)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)

            router.refresh()
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('recipient_id', user.id)
                .eq('is_read', false)

        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    useEffect(() => {
        let subscription: any

        const run = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            fetchNotifications()

            subscription = supabase
                .channel('notifications-channel')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${user.id}`
                    },
                    async (payload) => {
                        // Fetch the actor details (username/avatar) for the new notification
                        const { data: actor } = await supabase
                            .from('users')
                            .select('username, avatar_type, avatar_value')
                            .eq('id', payload.new.actor_id)
                            .single()

                        const newNotification = {
                            ...payload.new,
                            users: actor
                        } as Notification

                        setNotifications(prev => [newNotification, ...prev])
                        setUnreadCount(prev => prev + 1)
                    }
                )
                .subscribe()
        }

        run()

        return () => {
            if (subscription) subscription.unsubscribe()
        }
    }, [fetchNotifications, supabase])

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    }
}
