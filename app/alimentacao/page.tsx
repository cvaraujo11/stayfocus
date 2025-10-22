'use client'

import { DashboardCard } from '@/app/components/ui/DashboardCard'
import { PlanejadorRefeicoes } from '@/app/components/alimentacao/PlanejadorRefeicoes'
import { RegistroRefeicoes } from '@/app/components/alimentacao/RegistroRefeicoes'
import { LembreteHidratacao } from '@/app/components/alimentacao/LembreteHidratacao'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AlimentacaoPage() {
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
        <LoadingSpinner size="xl" />
      </div>
    )
  }
  
  if (!user) {
    return null
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alimentação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Planejador de Refeições */}
        <DashboardCard title="Planejador de Refeições" collapsible={true}>
          <PlanejadorRefeicoes />
        </DashboardCard>
        
        {/* Registro Visual de Refeições */}
        <DashboardCard title="Registro de Refeições" collapsible={true}>
          <RegistroRefeicoes />
        </DashboardCard>
      </div>
      
      {/* Lembretes de Hidratação */}
      <DashboardCard title="Hidratação" collapsible={true}>
        <LembreteHidratacao />
      </DashboardCard>

      {/* Card para a Seção de Receitas */}
      <DashboardCard title="Minhas Receitas" collapsible={true}>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Organize e acesse suas receitas favoritas aqui. Crie listas de compras e planeje suas refeições.
        </p>
        <Link href="/receitas" passHref>
          <Button color="primary">
            Acessar Minhas Receitas
          </Button>
        </Link>
      </DashboardCard>
    </div>
  )
}
