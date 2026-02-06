'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, X } from 'lucide-react'

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)
            // Update UI to notify the user they can add to home screen
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setDeferredPrompt(null)
            setShowPrompt(false)
        }
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-surface/95 backdrop-blur-md border border-accent/20 p-4 rounded-xl shadow-lg flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-text-primary">Instalar App</h3>
                    <p className="text-sm text-text-secondary">Instale o Sussurro para uma melhor experiência!</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="p-2 hover:bg-white/5 rounded-lg text-text-secondary"
                    >
                        <X size={20} />
                    </button>
                    <Button
                        onClick={handleInstallClick}
                        className="bg-accent text-white hover:bg-accent-hover"
                        size="sm"
                    >
                        <Download size={16} className="mr-2" />
                        Instalar
                    </Button>
                </div>
            </div>
        </div>
    )
}
