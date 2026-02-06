'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, usernameSchema } from '@/lib/utils/validation'
import { AVATAR_ICONS } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'
import type { z } from 'zod'

type RegisterFormData = z.infer<typeof registerSchema>
type UsernameFormData = z.infer<typeof usernameSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<'register' | 'username' | 'avatar'>('register')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tempUserId, setTempUserId] = useState('')
  const [tempEmail, setTempEmail] = useState('')
  const [tempUsername, setTempUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_ICONS[0])

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const {
    register: usernameForm,
    handleSubmit: handleUsernameSubmit,
    formState: { errors: usernameErrors },
    setError: setUsernameError,
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
  })

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError('')

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      console.error('Registration error:', error)
      setError(error.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      setTempUserId(authData.user.id)
      setTempEmail(data.email)
      setStep('username')
    }

    setLoading(false)
  }

  const onUsernameSubmit = async (data: UsernameFormData) => {
    setLoading(true)
    setError('')

    // Check username availability
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', data.username)
      .single()

    if (existingUser) {
      setUsernameError('username', {
        message: 'Este username já está em uso',
      })
      setLoading(false)
      return
    }

    setTempUsername(data.username)
    setStep('avatar')
    setLoading(false)
  }

  const onFinish = async () => {
    setLoading(true)
    setError('')

    console.log('Attempting to create profile for:', { tempUserId, tempEmail, tempUsername })

    const { error } = await (supabase.from('users').insert({
      id: tempUserId,
      email: tempEmail,
      username: tempUsername,
      avatar_type: 'icon',
      avatar_value: selectedAvatar,
    } as any) as any)

    if (error) {
      console.error('Profile creation error:', error)
      setError(`Erro ao criar perfil: ${error.message}`)
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">👻 Sussurro</h1>
          <p className="text-text-secondary">Crie sua conta anônima</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={registerErrors.email?.message}
              {...registerForm('email')}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={registerErrors.password?.message}
              {...registerForm('password')}
            />

            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              error={registerErrors.confirmPassword?.message}
              {...registerForm('confirmPassword')}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Continuar'}
            </Button>
          </form>
        )}

        {step === 'username' && (
          <form onSubmit={handleUsernameSubmit(onUsernameSubmit)} className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary mb-4">
                Escolha um username único. Este será seu identificador na plataforma.
              </p>

              <Input
                id="username-input"
                label="Username"
                type="text"
                placeholder="seu_username"
                error={usernameErrors.username?.message}
                {...usernameForm('username')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Continuar'}
            </Button>
          </form>
        )}

        {step === 'avatar' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary mb-4 text-center">
                Escolha seu avatar
              </p>

              <div className="flex justify-center mb-6">
                <Avatar type="icon" value={selectedAvatar} size="xl" />
              </div>

              <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 bg-background rounded-lg">
                {AVATAR_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedAvatar(icon)}
                    className={`p-2 text-2xl rounded-lg transition-colors ${selectedAvatar === icon
                      ? 'bg-accent'
                      : 'bg-surface hover:bg-surface-hover'
                      }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={onFinish} className="w-full" disabled={loading}>
              {loading ? 'Finalizando...' : 'Criar Conta'}
            </Button>
          </div>
        )}

        <p className="text-center mt-6 text-text-secondary">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
