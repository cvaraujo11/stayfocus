'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegistroMedicamentos } from '@/app/components/saude/RegistroMedicamentos'
import { MonitoramentoHumor } from '@/app/components/saude/MonitoramentoHumor'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { useAuth } from '@/app/contexts/AuthContext'

export default function SaudePage() {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saúde</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Registro de Medicamentos */}
        <RegistroMedicamentos />
        
        {/* Monitoramento de Humor */}
        <MonitoramentoHumor />
      </div>
    </div>
  )
}
