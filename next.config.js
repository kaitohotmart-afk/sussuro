/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['perapijoyobtnhuqzmnx.supabase.co'],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        serverActions: {
            enabled: true
        },
    },
}

module.exports = nextConfig
