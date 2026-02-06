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
        <nav className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-4 transition-all duration-300">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
                <Link href="/feed" className="flex items-center gap-2 group transition-all active:scale-95">
                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">👻</span>
                    <span className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-400 hidden sm:inline tracking-tight">
                        Sussurro
                    </span>
                </Link>

                {user && profile ? (
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link
                            href="/criar-post"
                            className="hidden md:flex px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover text-sm font-bold transition-all shadow-lg shadow-accent/20 active:scale-95"
                        >
                            Criar Post
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-4 px-3 py-1.5 bg-white/5 rounded-2xl border border-white/5">
                            <Link
                                href="/arena"
                                className="p-2 text-text-secondary hover:text-accent transition-all hover:scale-110"
                                title="Batalha Diária"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" x2="19" y1="19" y2="13" /><line x1="16" x2="20" y1="16" y2="20" /><line x1="19" x2="21" y1="21" y2="19" /></svg>
                            </Link>

                            <Link
                                href="/salvos"
                                className="p-2 text-text-secondary hover:text-accent transition-all hover:scale-110"
                                title="Posts Salvos"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                            </Link>

                            <NotificationBell />
                        </div>

                        <Link
                            href={`/perfil/${profile.username}`}
                            className="flex items-center gap-2 hover:bg-white/10 p-1 rounded-full transition-all active:scale-95 pr-2"
                        >
                            <Avatar
                                type={profile.avatar_type as 'icon'}
                                value={profile.avatar_value}
                                size="sm"
                                className="ring-2 ring-accent/20 shadow-xl"
                            />
                            <span className="text-sm font-bold text-text-primary hidden lg:inline max-w-[120px] truncate">
                                {profile.username}
                            </span>
                        </Link>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10 active:scale-95"
                    >
                        Entrar
                    </Link>
                )}
            </div>
        </nav>
    )
}
