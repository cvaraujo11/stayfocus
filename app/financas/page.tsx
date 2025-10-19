'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/app/components/ui/Card'
import { EnvelopesVirtuais } from '@/app/components/financas/EnvelopesVirtuais'
import { CalendarioPagamentos } from '@/app/components/financas/CalendarioPagamentos'
import { AdicionarDespesa } from '@/app/components/financas/AdicionarDespesa'
import { useAuth } from '@/app/contexts/AuthContext'
import { useFinancasStore } from '@/app/stores/financasStore'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'

// Importação dinâmica para o RastreadorGastos (ajustada para default export)
const RastreadorGastos = dynamic(
  () => import('@/app/components/financas/RastreadorGastos'),
  {
    ssr: false, // Desabilita SSR pois recharts depende de APIs do browser
    loading: () => <p className="text-center text-gray-500 dark:text-gray-400">Carregando gráfico...</p>
  }
)

export default function FinancasPage() {
  const { user, loading: authLoading } = useAuth()
  const { setupRealtimeSync } = useFinancasStore()

  // Setup real-time sync
  useEffect(() => {
    if (user?.id) {
      const cleanup = setupRealtimeSync(user.id)
      return cleanup
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Você precisa estar autenticado para acessar esta página.</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finanças</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rastreador de Gastos */}
        <Card title="Rastreador de Gastos">
          <RastreadorGastos />
        </Card>

        {/* Envelopes Virtuais */}
        <Card title="Envelopes Virtuais">
          <EnvelopesVirtuais />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendário de Pagamentos */}
        <Card title="Calendário de Pagamentos">
          <CalendarioPagamentos />
        </Card>

        {/* Adicionar Despesa Rápida */}
        <Card title="Adicionar Despesa">
          <AdicionarDespesa />
        </Card>
      </div>
    </div>
  )
}
