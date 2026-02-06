import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Users,
    Flag,
    Settings,
    LogOut,
    Bell
} from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is admin
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || (userData as any).role !== 'admin') {
        redirect('/feed')
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col">
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-400">
                        Sussurro Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavLink href="/admin/users" icon={<Users size={20} />} label="Usuários" />
                    <NavLink href="/admin/reports" icon={<Flag size={20} />} label="Denúncias" />
                    <NavLink href="/admin/settings" icon={<Settings size={20} />} label="Configurações" />
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-4 py-3 text-text-secondary">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-accent">AD</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">Admin</p>
                            <p className="text-xs truncate">admin@sussurro</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}

function NavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    )
}
