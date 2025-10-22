'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DashboardSectionProps } from '@/app/types'
import { cn } from '@/app/lib/utils'

export function DashboardSection({ 
  id, 
  title, 
  children, 
  className,
  collapsible = false,
  defaultCollapsed = false 
}: DashboardSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const titleId = id || title?.toLowerCase().replace(/\s+/g, '-') || undefined
  
  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <section 
      aria-labelledby={titleId}
      className={cn("mt-6", className)}
    >
      {title && (
        <div 
          className={cn(
            "flex items-center justify-between mb-4",
            collapsible && "cursor-pointer hover:opacity-80 transition-opacity"
          )}
          onClick={toggleCollapse}
        >
          <h2 
            id={titleId} 
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          {collapsible && (
            <button
              type="button"
              aria-label={isCollapsed ? "Expandir" : "Recolher"}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="w-6 h-6" />
              ) : (
                <ChevronUp className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      )}
      {!isCollapsed && children}
    </section>
  )
} 