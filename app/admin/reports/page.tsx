'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Check, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('status', 'pending') // Only pending reports
            .order('created_at', { ascending: false })

        if (data) setReports(data)
        setLoading(false)
    }

    const handleAction = async (reportId: string, action: 'dismiss' | 'remove_content', postId?: string) => {
        // Update report status
        await supabase
            .from('reports')
            .update({
                status: 'resolved',
                action_taken: action,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', reportId)

        if (action === 'remove_content' && postId) {
            await supabase
                .from('posts')
                .update({
                    is_removed: true,
                    removed_reason: 'Admin moderation via Dashboard',
                    removed_at: new Date().toISOString()
                })
                .eq('id', postId)
        }

        // Optimistic update
        setReports(reports.filter(r => r.id !== reportId))
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-text-primary">Moderação de Denúncias</h1>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-text-secondary">Carregando denúncias...</div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-xl">
                        <Check className="w-16 h-16 text-green-500 mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-text-primary">Tudo Limpo!</h3>
                        <p className="text-text-secondary">Nenhuma denúncia pendente para revisão.</p>
                    </div>
                ) : (
                    reports.map(report => (
                        <div key={report.id} className="bg-surface border border-border rounded-xl p-6 flex items-start gap-4">
                            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg">
                                <AlertCircle size={24} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm bg-white/5 px-2 py-0.5 rounded text-text-secondary uppercase">
                                        {report.reason}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-text-primary mb-2">
                                    {report.description || 'Sem descrição adicional.'}
                                </p>
                                {report.post_id && (
                                    <Link
                                        href={`/post/${report.post_id}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4"
                                    >
                                        Ver conteúdo original <ExternalLink size={12} />
                                    </Link>
                                )}

                                <div className="flex items-center gap-3">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                                        onClick={() => handleAction(report.id, 'dismiss')}
                                    >
                                        <Check size={16} className="mr-2" /> Ignorar
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-red-500 text-white hover:bg-red-600"
                                        onClick={() => handleAction(report.id, 'remove_content', report.post_id)}
                                    >
                                        <Trash2 size={16} className="mr-2" /> Remover Conteúdo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
