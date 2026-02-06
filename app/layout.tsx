import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWAInit } from '@/components/pwa/PWAInit'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
    title: 'Sussurro - Suas histórias, seu anonimato',
    description: 'Rede social de histórias e confissões anônimas',
    manifest: '/manifest.json',
}

export const viewport: Viewport = {
    themeColor: '#8b5cf6',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" className="dark" style={{ colorScheme: 'dark' }}>
            <body className="bg-background text-text-primary antialiased">
                {children}
                <PWAInit />
                <Toaster position="top-right" richColors closeButton />
            </body>
        </html>
    )
}
