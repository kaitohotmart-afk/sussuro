'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { POST_CATEGORIES } from '@/types'
import { updatePost } from '@/lib/actions/post_management'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EditPostModalProps {
    post: any
    onClose: () => void
}

export function EditPostModal({ post, onClose }: EditPostModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: post.title || '',
        content: post.content,
        category: post.category,
        is_sensitive: post.is_sensitive || false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updatePost(post.id, formData)
            toast.success('Sussurro atualizado com sucesso!')
            router.refresh()
            onClose()
        } catch (error) {
            toast.error('Erro ao atualizar sussurro')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal onClose={onClose}>
            <div className="p-6 space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Editar Sussurro</h3>
                    <p className="text-text-secondary text-sm font-medium">Refine sua história anônima.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                            Categoria
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none font-bold transition-all hover:bg-white/10"
                            required
                        >
                            {POST_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value} className="bg-neutral-900">
                                    {cat.emoji} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                            Título
                        </label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Título da história..."
                            className="h-12 px-4 !rounded-xl bg-white/5 border-white/10 font-bold"
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                            Conteúdo
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent min-h-[150px] font-medium leading-relaxed transition-all hover:bg-white/10"
                            placeholder="Sussurre sua história..."
                            required
                        />
                    </div>

                    {/* Sensitive Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setFormData({ ...formData, is_sensitive: !formData.is_sensitive })}>
                        <div>
                            <p className="font-bold text-sm text-white">Conteúdo Sensível</p>
                            <p className="text-[10px] text-text-secondary">Marcar como NSFW</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={formData.is_sensitive}
                            onChange={() => { }} // Handled by div onClick
                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-accent focus:ring-transparent checked:bg-accent"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 font-bold uppercase tracking-widest text-xs" disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 font-black uppercase tracking-widest text-xs shadow-lg shadow-accent/20" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}
