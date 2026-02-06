import React from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variants = {
        primary: 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20 border border-accent/20',
        secondary: 'bg-white/5 text-text-primary hover:bg-white/10 border border-white/5',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
        danger: 'bg-error/10 text-error hover:bg-error/20 border border-error/20',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-8 py-4 text-base',
    }

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    )
}
