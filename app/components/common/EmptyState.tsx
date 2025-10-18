'use client'

import { ReactNode } from 'react'
import { cn } from '@/app/lib/utils'
import { Button } from '@/app/components/ui/Button'

interface EmptyStateProps {
  message: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  message, 
  description,
  icon,
  action,
  className 
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="status"
      aria-label={message}
    >
      {/* Icon */}
      {icon ? (
        <div className="mb-4 text-gray-400 dark:text-gray-600">
          {icon}
        </div>
      ) : (
        <svg
          className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}

      {/* Message */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {message}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md">
          {description}
        </p>
      )}

      {/* Call to Action */}
      {action && (
        <div className="mt-6">
          <Button
            onClick={action.onClick}
            variant="primary"
            size="default"
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
