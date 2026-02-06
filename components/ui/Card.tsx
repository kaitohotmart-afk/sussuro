import React from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
    return (
        <div
            className={cn(
                'bg-surface/50 border border-white/5 rounded-2xl p-6 transition-all duration-300',
                onClick && 'cursor-pointer hover:bg-surface hover:border-accent/30 hover:scale-[1.01] active:scale-[0.99]',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
