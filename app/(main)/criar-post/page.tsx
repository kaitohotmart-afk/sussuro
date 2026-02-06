'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { postSchema } from '@/lib/utils/validation'
import { POST_CATEGORIES } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { z } from 'zod'
import { motion } from 'framer-motion'

type PostFormData = z.infer<typeof postSchema>

export default function CreatePostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedWarning, setAcceptedWarning] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      is_sensitive: false,
    },
  })

  const onSubmit = async (data: PostFormData) => {
    if (!acceptedWarning) {
      setError('Você precisa aceitar as regras antes de postar')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Check rate limits
    const { data: userData } = await supabase
      .from('users')
      .select('posts_today, posts_this_hour')
      .eq('id', user.id)
      .single()

    if (userData) {
      const userStats = userData as any
      if (userStats.posts_this_hour >= 5) {
        setError('Limite de 5 posts por hora atingido. Aguarde um pouco.')
        setLoading(false)
        return
      }
      if (userStats.posts_today >= 20) {
        setError('Limite de 20 posts por dia atingido. Volte amanhã!')
        setLoading(false)
        return
      }
    }

    const { error: postError } = await (supabase.from('posts').insert({
      user_id: user.id,
      title: data.title,
      content: data.content,
      category: data.category,
      post_type: 'text',
      is_sensitive: data.is_sensitive,
    } as any) as any)

    if (postError) {
      setError('Erro ao criar post')
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background/50">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-90 text-text-secondary hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="text-3xl font-black text-white tracking-tight">Criar Sussurro</h1>
        </div>

        {/* Warning Card - Redesigned */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>

          <h3 className="font-black text-lg text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
            🚨 Anonimato é Sagrado
          </h3>

          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="font-bold text-red-400 uppercase text-[10px] tracking-widest">Nunca poste:</p>
              <ul className="space-y-1 text-text-secondary font-medium">
                <li>• Nomes reais ou Redes Sociais</li>
                <li>• Empresas ou Endereços exatos</li>
                <li>• Telefones ou E-mails</li>
              </ul>
            </div>
            <div className="space-y-2 border-l border-white/5 pl-6">
              <p className="font-bold text-green-400 uppercase text-[10px] tracking-widest">Pode postar:</p>
              <ul className="space-y-1 text-text-secondary font-medium">
                <li>• "Meu ex", "Um colega"</li>
                <li>• "Num hospital", "Dessa vez..."</li>
                <li>• Referências genéricas</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs font-black text-amber-500/60 uppercase tracking-widest flex items-center gap-2">
            ⚖️ Doxxing é motivo de ban imediato e permanente.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-32">
          {/* Category */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
              Categoria
            </label>
            <div className="relative">
              <select
                className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none font-bold transition-all hover:bg-white/10"
                {...register('category')}
              >
                <option value="" className="bg-neutral-900">Selecione uma categoria...</option>
                {POST_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-neutral-900">
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
            {errors.category && (
              <span className="text-sm font-bold text-error ml-1">{errors.category.message}</span>
            )}
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
              Título da História
            </label>
            <Input
              placeholder="Dê um título impactante..."
              className="h-14 px-6 !rounded-2xl bg-white/5 border-white/10 font-bold placeholder:text-text-secondary/50"
              {...register('title')}
            />
            {errors.title && (
              <span className="text-sm font-bold text-error ml-1">{errors.title.message}</span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black uppercase tracking-widest text-text-secondary">
                O Desabafo
              </label>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                {watch('content')?.length || 0} / 5000
              </span>
            </div>
            <textarea
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent min-h-[250px] font-medium leading-relaxed transition-all hover:bg-white/10"
              placeholder="Sussurre aqui o que ninguém mais pode saber..."
              {...register('content')}
            />
            {errors.content && (
              <span className="text-sm font-bold text-error ml-1">{errors.content.message}</span>
            )}
          </div>

          {/* Switches (Sensível, Aceite) */}
          <div className="grid gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between group cursor-pointer">
              <label htmlFor="sensitive" className="flex-1 cursor-pointer">
                <p className="font-bold text-white group-hover:text-accent transition-colors">Conteúdo Sensível (NSFW)</p>
                <p className="text-xs text-text-secondary">Avisar outros usuários sobre temas pesados.</p>
              </label>
              <input
                type="checkbox"
                id="sensitive"
                className="w-6 h-6 rounded-lg border-white/10 bg-white/5 text-accent focus:ring-transparent checked:bg-accent ring-0"
                {...register('is_sensitive')}
              />
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between group cursor-pointer">
              <label htmlFor="accept" className="flex-1 cursor-pointer">
                <p className="font-bold text-white group-hover:text-accent transition-colors">Regras do Sussurro</p>
                <p className="text-xs text-text-secondary">Prometo manter o anonimato de todos.</p>
              </label>
              <input
                type="checkbox"
                id="accept"
                checked={acceptedWarning}
                onChange={(e) => setAcceptedWarning(e.target.checked)}
                className="w-6 h-6 rounded-lg border-white/10 bg-white/5 text-accent focus:ring-transparent checked:bg-accent ring-0"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-16 !rounded-2xl text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-accent/40"
            disabled={loading || !acceptedWarning}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                Sussurrando...
              </div>
            ) : 'Publicar Sussurro 👻'}
          </Button>
        </form>
      </div>
    </div>
  )
}
