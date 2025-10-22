'use client'

import { cn } from '@/app/lib/utils'
import { Button } from '@/app/components/ui/Button'
import { isDevelopment } from '@/app/lib/env'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
  details?: string | Error
  showDetails?: boolean
}

export function ErrorMessage({ 
  message, 
  onRetry, 
  className,
  details,
  showDetails = isDevelopment()
}: ErrorMessageProps) {
  const errorDetails = details instanceof Error ? details.message : details

  return (
    <div 
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-600 dark:text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Erro
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {message}
          </p>

          {/* Development Details */}
          {showDetails && errorDetails && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900 dark:bg-red-900 dark:text-red-100">
                {errorDetails}
              </pre>
            </details>
          )}

          {/* Retry Button */}
          {onRetry && (
            <div className="mt-3">
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
