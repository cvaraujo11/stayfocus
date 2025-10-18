'use client'

import { cn } from '@/app/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  label = 'Carregando...'
}: LoadingSpinnerProps) {
  return (
    <div 
      className="flex items-center justify-center"
      role="status"
      aria-label={label}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent',
          sizeClasses[size],
          className
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
