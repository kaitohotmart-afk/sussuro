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
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-2xl font-bold">Criar Post</h1>
        </div>

        {/* Warning */}
        <Card className="mb-6 bg-warning/10 border-warning">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            ⚠️ ATENÇÃO: NÃO INCLUA
          </h3>
          <ul className="space-y-1 text-sm mb-4">
            <li>• Nomes reais de pessoas</li>
            <li>• Nomes de empresas/lugares específicos</li>
            <li>• Números de telefone, emails ou redes sociais</li>
            <li>• Endereços</li>
            <li>• Qualquer dado que identifique você ou outros</li>
          </ul>
          <p className="text-sm font-semibold mb-3">
            ⚖️ Violações = Ban permanente
          </p>
          <h4 className="font-bold text-success mb-2">✅ PODE INCLUIR:</h4>
          <ul className="space-y-1 text-sm">
            <li>• "Meu chefe", "Minha ex", "Um amigo"</li>
            <li>• "Na empresa onde trabalho"</li>
            <li>• Cidade grande (ex: "Em Maputo")</li>
          </ul>
        </Card>

        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Categoria *
            </label>
            <select
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              {...register('category')}
            >
              <option value="">Selecione uma categoria</option>
              {POST_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="text-sm text-error">{errors.category.message}</span>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Título *
            </label>
            <Input
              placeholder="Dê um título para sua história..."
              {...register('title')}
            />
            {errors.title && (
              <span className="text-sm text-error">{errors.title.message}</span>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Conteúdo *
            </label>
            <textarea
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent min-h-[200px]"
              placeholder="Conte sua história..."
              {...register('content')}
            />
            {errors.content && (
              <span className="text-sm text-error">{errors.content.message}</span>
            )}
            <p className="text-xs text-text-secondary mt-1">
              {watch('content')?.length || 0} / 5000 caracteres
            </p>
          </div>

          {/* Sensitive content */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sensitive"
              className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent"
              {...register('is_sensitive')}
            />
            <label htmlFor="sensitive" className="text-sm text-text-primary">
              Marcar como conteúdo sensível
            </label>
          </div>

          {/* Accept rules */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="accept"
              checked={acceptedWarning}
              onChange={(e) => setAcceptedWarning(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent"
            />
            <label htmlFor="accept" className="text-sm text-text-primary">
              Li e aceito as regras. Entendo que a violação pode resultar em ban
              permanente.
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !acceptedWarning}
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
