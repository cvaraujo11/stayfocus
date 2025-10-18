'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/app/components/ui/Card'
import { AtividadesLazer } from '@/app/components/lazer/AtividadesLazer'
import { SugestoesDescanso } from '@/app/components/lazer/SugestoesDescanso'
import { TemporizadorLazer } from '@/app/components/lazer/TemporizadorLazer'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { useAuth } from '@/app/contexts/AuthContext'

export default function LazerPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lazer</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Temporizador de Lazer */}
        <Card title="Temporizador de Lazer">
          <TemporizadorLazer />
        </Card>
        
        {/* Atividades de Lazer */}
        <Card title="Atividades de Lazer">
          <AtividadesLazer />
        </Card>
        
        {/* Sugestões de Descanso */}
        <Card title="Sugestões de Descanso">
          <SugestoesDescanso />
        </Card>
      </div>
    </div>
  )
}
