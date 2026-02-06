'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usernameSchema } from '@/lib/utils/validation'
import { AVATAR_ICONS } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { z } from 'zod'

// Extend z schema for bio locally if not in shared validation
const profileSchema = usernameSchema.extend({
    bio: z.string().max(160, 'Bio deve ter no máximo 160 caracteres').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface EditProfileFormProps {
    user: any
    profile: any
}

export function EditProfileForm({ user, profile }: EditProfileFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar_value)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError: setFormError,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: profile.username,
            bio: profile.bio || '',
        },
    })

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            // Check if username changed and is available
            if (data.username !== profile.username) {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('username')
                    .eq('username', data.username)
                    .single()

                if (existingUser) {
                    setFormError('username', {
                        message: 'Este username já está em uso',
                    })
                    setLoading(false)
                    return
                }
            }

            // Update profile
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    username: data.username,
                    avatar_value: selectedAvatar,
                    bio: data.bio,
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            setSuccess('Perfil atualizado com sucesso!')
            router.refresh()

            // Delay redirect slightly to show success message
            setTimeout(() => {
                router.push(`/perfil/${data.username}`)
            }, 1000)

        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar perfil')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* Avatar Selection */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-text-secondary">Avatar</label>
                <div className="flex justify-center mb-4">
                    <Avatar type="icon" value={selectedAvatar} size="xl" />
                </div>

                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-background rounded-lg border border-border">
                    {AVATAR_ICONS.map((icon) => (
                        <button
                            key={icon}
                            type="button"
                            onClick={() => setSelectedAvatar(icon)}
                            className={`p-2 text-xl rounded-lg transition-colors ${selectedAvatar === icon
                                ? 'bg-accent'
                                : 'bg-surface hover:bg-surface-hover'
                                }`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Username Input */}
            <Input
                label="Username"
                type="text"
                placeholder="seu_username"
                error={errors.username?.message}
                {...register('username')}
            />

            {/* Bio Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Bio
                </label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Conte algo sobre você..."
                    {...register('bio')}
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            <div className="pt-6 border-t border-border mt-8">
                <LogoutButton />
            </div>
        </form>
    )
}
