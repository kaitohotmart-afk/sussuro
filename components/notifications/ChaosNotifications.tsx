'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ChaosNotifications() {
    const router = useRouter()
    const supabase = createClient()
    const audioContextRef = useRef<AudioContext | null>(null)

    // Sound generator using Web Audio API (no assets needed)
    const playSound = (type: 'pop' | 'notify') => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            }

            const ctx = audioContextRef.current
            if (ctx.state === 'suspended') ctx.resume()

            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.connect(gain)
            gain.connect(ctx.destination)

            if (type === 'pop') {
                // High pitch, short burst (Like)
                osc.type = 'sine'
                osc.frequency.setValueAtTime(800, ctx.currentTime)
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
                gain.gain.setValueAtTime(0.1, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
                osc.start(ctx.currentTime)
                osc.stop(ctx.currentTime + 0.1)
            } else {
                // Dual tone (Comment)
                osc.type = 'triangle'
                osc.frequency.setValueAtTime(500, ctx.currentTime)
                gain.gain.setValueAtTime(0.1, ctx.currentTime)
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
                osc.start(ctx.currentTime)
                osc.stop(ctx.currentTime + 0.3)

                // Second tone slight delay
                const osc2 = ctx.createOscillator()
                const gain2 = ctx.createGain()
                osc2.connect(gain2)
                gain2.connect(ctx.destination)
                osc2.type = 'triangle'
                osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.1)
                gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1)
                gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
                osc2.start(ctx.currentTime + 0.1)
                osc2.stop(ctx.currentTime + 0.4)
            }

            // Vibration if supported
            if (navigator.vibrate) {
                navigator.vibrate(type === 'pop' ? 50 : [50, 50, 50])
            }
        } catch (e) {
            console.error('Audio error', e)
        }
    }

    useEffect(() => {
        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Subscribe to notifications for this user
            const channel = supabase
                .channel('chaos-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${user.id}`
                    },
                    (payload) => {
                        const notif = payload.new

                        // Ignore own actions (if any)
                        if (notif.actor_id === user.id) return

                        if (notif.type === 'like') {
                            playSound('pop')
                            toast.success('❤️ Alguém curtiu seu post!', {
                                description: 'Sua história está bombando.',
                                duration: 3000,
                                closeButton: true,
                                action: {
                                    label: 'Ver',
                                    onClick: () => router.push('/notificacoes')
                                }
                            })
                        } else if (notif.type === 'comment') {
                            playSound('notify')
                            toast.info('💬 Novo comentário', {
                                description: 'Alguém respondeu à sua história.',
                                duration: 4000,
                                closeButton: true,
                                action: {
                                    label: 'Responder',
                                    onClick: () => router.push('/notificacoes')
                                }
                            })
                        } else if (notif.type === 'reply') {
                            playSound('notify')
                            toast.info('↩️ Resposta recebida', {
                                description: 'A conversa continua...',
                                duration: 4000
                            })
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        setup()
    }, [supabase, router])

    return null
}
