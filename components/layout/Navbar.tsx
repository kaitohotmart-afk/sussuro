import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'
import { LogOut, User as UserIcon } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'


export async function Navbar() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Need to fetch profile for avatar
    let profile: any = null
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('username, avatar_type, avatar_value')
            .eq('id', user.id)
            .single()
        profile = data
    }

    return (
        <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                <Link href="/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-2xl">👻</span>
                    <span className="font-bold text-xl hidden sm:inline">Sussurro</span>
                </Link>

                {user && profile ? (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/criar-post"
                            className="hidden sm:block px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm font-medium transition-colors"
                        >
                            Criar Post
                        </Link>

                        <Link
                            href="/arena"
                            className="p-2 text-text-secondary hover:text-accent hover:bg-surface-hover rounded-full transition-colors hidden sm:block animate-pulse-slow"
                            title="Batalha Diária"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" x2="19" y1="19" y2="13" /><line x1="16" x2="20" y1="16" y2="20" /><line x1="19" x2="21" y1="21" y2="19" /></svg>
                        </Link>

                        <Link
                            href="/salvos"
                            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-full transition-colors hidden sm:block"
                            title="Posts Salvos"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                        </Link>

                        <NotificationBell />

                        <Link
                            href={`/perfil/${profile.username}`}
                            className="flex items-center gap-2 hover:bg-surface-hover px-2 py-1 rounded-lg transition-colors group"
                        >
                            <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block group-hover:text-accent">
                                {profile.username}
                            </span>
                            <Avatar
                                type={profile.avatar_type as 'icon'}
                                value={profile.avatar_value}
                                size="sm"
                            />
                        </Link>
                    </div>
                ) : (
                    <Link href="/login" className="text-sm text-accent hover:underline">
                        Entrar
                    </Link>
                )}
            </div>
        </nav>
    )
}
