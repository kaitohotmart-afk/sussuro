import React from 'react'
import { cn } from '@/lib/utils/cn'

interface AvatarProps {
    type: 'icon'
    value: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export function Avatar({ type, value, size = 'md', className }: AvatarProps) {
    const sizes = {
        xs: 'w-6 h-6 text-sm',
        sm: 'w-8 h-8 text-base',
        md: 'w-10 h-10 text-lg',
        lg: 'w-12 h-12 text-xl',
        xl: 'w-16 h-16 text-2xl',
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-full bg-surface border border-white/5 shadow-inner transition-all duration-300',
                'ring-2 ring-white/5 ring-offset-2 ring-offset-background',
                sizes[size],
                className
            )}
        >
            {type === 'icon' && <span className="drop-shadow-sm select-none">{value}</span>}
        </div>
    )
}
