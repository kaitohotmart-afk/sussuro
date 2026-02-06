'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'
import { Users, FileText, MessageSquare, AlertTriangle } from 'lucide-react'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [graphData, setGraphData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()

            // Fetch aggregate stats
            const { data: dashboardStats, error: statsError } = await (supabase
                .rpc('get_admin_dashboard_stats') as any)

            if (statsError) console.error('Stats error:', statsError)
            else setStats(dashboardStats)

            // Fetch graph data
            const { data: activityStats, error: graphError } = await (supabase.rpc as any)('get_daily_activity_stats', { days: 30 })

            if (graphError) console.error('Graph error:', graphError)
            else setGraphData(activityStats || [])

            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-text-primary">Dashboard Overview</h1>
                <div className="text-sm text-text-secondary">
                    Atualizado em: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Usuários Totais"
                    value={stats?.total_users || 0}
                    subvalue={`+${stats?.new_users_7d || 0} nesta semana`}
                    icon={<Users className="text-blue-400" />}
                />
                <StatCard
                    title="Total de Posts"
                    value={stats?.total_posts || 0}
                    subvalue={`+${stats?.posts_24h || 0} hoje`}
                    icon={<FileText className="text-green-400" />}
                />
                <StatCard
                    title="Comentários"
                    value={stats?.total_comments || 0}
                    subvalue="Engajamento Total"
                    icon={<MessageSquare className="text-purple-400" />}
                />
                <StatCard
                    title="Denúncias Pendentes"
                    value={stats?.pending_reports || 0}
                    subvalue={`${stats?.total_reports || 0} total acumulado`}
                    icon={<AlertTriangle className="text-yellow-400" />}
                    alert={stats?.pending_reports > 0}
                />
            </div>

            {/* Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-6">Crescimento de Conteúdo (30 dias)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Line type="monotone" dataKey="posts_count" stroke="#8b5cf6" strokeWidth={2} name="Posts" />
                                <Line type="monotone" dataKey="comments_count" stroke="#10b981" strokeWidth={2} name="Comentários" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-6">Novos Usuários (30 dias)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Bar dataKey="users_count" fill="#3b82f6" name="Novos Usuários" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, subvalue, icon, alert = false }: any) {
    return (
        <div className={`bg-surface border rounded-xl p-6 ${alert ? 'border-red-500/50 bg-red-500/5' : 'border-border'}`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary font-medium">{title}</span>
                <div className="p-2 bg-white/5 rounded-lg">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
                {value}
            </div>
            <div className="text-sm text-text-secondary">
                {subvalue}
            </div>
        </div>
    )
}
