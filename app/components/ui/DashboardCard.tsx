'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DashboardCardProps } from '@/app/types'
import { cn } from '@/app/lib/utils'

export function DashboardCard({ 
  children, 
  title, 
  className, 
  isLoading = false,
  collapsible = false,
  defaultCollapsed = false 
}: DashboardCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden",
        isLoading && "animate-pulse",
        className
      )}
    >
      {title && (
        <div 
          className={cn(
            "px-4 py-3 border-b border-gray-200 dark:border-gray-700",
            collapsible && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          )}
          onClick={toggleCollapse}
        >
          {isLoading ? (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          ) : (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
              {collapsible && (
                <button
                  type="button"
                  aria-label={isCollapsed ? "Expandir" : "Recolher"}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {!isCollapsed && (
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )
} 