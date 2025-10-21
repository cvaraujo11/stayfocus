'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
