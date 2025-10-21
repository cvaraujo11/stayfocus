'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

/**
 * Botão de voltar reutilizável
 * Se href for fornecido, navega para essa rota
 * Caso contrário, usa router.back()
 */
export function BackButton({ href, label = 'Voltar', className }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      icon={<ArrowLeft className="h-4 w-4" />}
      className={className}
    >
      {label}
    </Button>
  )
}
