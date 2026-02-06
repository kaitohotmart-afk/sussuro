import type { Metadata } from 'next'
import './globals.css'
import { PWAInit } from '@/components/pwa/PWAInit'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
    title: 'Sussurro - Suas histórias, seu anonimato',
    description: 'Rede social de histórias e confissões anônimas',
    manifest: '/manifest.json',
    themeColor: '#8b5cf6',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>
                {children}
                <PWAInit />
                <Toaster position="top-right" richColors closeButton />
            </body>
        </html>
    )
}
