'use client'

import { useState } from 'react'
import { ChevronsDown, ChevronsUp } from 'lucide-react'
import { Button } from './Button'

type CollapseAllButtonProps = {
  onToggle: (collapsed: boolean) => void
  className?: string
}

export function CollapseAllButton({ onToggle, className }: CollapseAllButtonProps) {
  const [allCollapsed, setAllCollapsed] = useState(false)

  const handleToggle = () => {
    const newState = !allCollapsed
    setAllCollapsed(newState)
    onToggle(newState)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={className}
      aria-label={allCollapsed ? "Expandir todos" : "Recolher todos"}
    >
      {allCollapsed ? (
        <>
          <ChevronsDown className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Expandir todos</span>
        </>
      ) : (
        <>
          <ChevronsUp className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Recolher todos</span>
        </>
      )}
    </Button>
  )
}
