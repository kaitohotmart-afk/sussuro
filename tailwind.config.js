/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                surface: '#1a1a1a',
                'surface-hover': '#2a2a2a',
                border: '#333333',
                'text-primary': '#ffffff',
                'text-secondary': '#a0a0a0',
                accent: '#8b5cf6',
                'accent-hover': '#7c3aed',
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
            },
        },
    },
    plugins: [],
}
