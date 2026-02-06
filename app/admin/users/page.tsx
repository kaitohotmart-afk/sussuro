'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Search, Ban, CheckCircle, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (data) setUsers(data)
        setLoading(false)
    }

    const toggleBan = async (userId: string, currentStatus: boolean) => {
        // Toggle ban status
        const { error } = await ((supabase
            .from('users') as any)
            .update({
                is_banned: !currentStatus,
                ban_reason: !currentStatus ? 'Banido por Admin via Dashboard' : null
            } as any)
            .eq('id', userId) as any)

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u))
        }
    }

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text-primary">Gerenciar Usuários</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-surface/50 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent w-64"
                    />
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-surface-hover/50 text-text-secondary text-sm">
                        <tr>
                            <th className="p-4 font-medium">Usuário</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Entrou em</th>
                            <th className="p-4 font-medium">Posts</th>
                            <th className="p-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="h-10 w-32 bg-white/5 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 w-16 bg-white/5 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 w-16 bg-white/5 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 w-24 bg-white/5 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 w-8 bg-white/5 rounded"></div></td>
                                    <td className="p-4"></td>
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-text-secondary">
                                    Nenhum usuário encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar type={user.avatar_type} value={user.avatar_value} size="sm" />
                                            <div>
                                                <div className="font-medium text-text-primary">{user.username}</div>
                                                <div className="text-xs text-text-secondary">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">
                                                <Shield size={12} /> Admin
                                            </span>
                                        ) : (
                                            <span className="text-xs text-text-secondary bg-white/5 px-2 py-1 rounded">Usuario</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {user.is_banned ? (
                                            <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded">Banido</span>
                                        ) : (
                                            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">Ativo</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">
                                        {format(new Date(user.created_at), "dd MMM yyyy", { locale: ptBR })}
                                    </td>
                                    <td className="p-4 text-sm text-text-secondary">
                                        {user.total_posts || 0}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => toggleBan(user.id, user.is_banned)}
                                            className={user.is_banned
                                                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                : "bg-red-500/10 text-red-500 hover:bg-red-500/20"}
                                        >
                                            {user.is_banned ? <CheckCircle size={16} /> : <Ban size={16} />}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
