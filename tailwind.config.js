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
                background: 'var(--background)',
                surface: 'var(--surface)',
                'surface-hover': 'var(--surface-hover)',
                border: 'var(--border)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                accent: 'var(--accent)',
                'accent-hover': 'var(--accent-hover)',
                success: 'var(--success)',
                error: 'var(--error)',
                warning: 'var(--warning)',
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
