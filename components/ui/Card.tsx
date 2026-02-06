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
                'bg-surface border border-border rounded-lg p-4 transition-colors',
                onClick && 'cursor-pointer hover:bg-surface-hover',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
