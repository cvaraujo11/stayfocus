'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useEstudosStore } from '@/app/stores/estudosStore'
import { createSupabaseClient } from '@/app/lib/supabase/client'
import { Card } from '@/app/components/ui/Card'
import { StatCard } from '@/app/components/ui/StatCard'
import { EmptyState } from '@/app/components/common/EmptyState'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { 
  Clock, 
  TrendingUp, 
  Calendar, 
  BookOpen,
  BarChart3,
  AlertCircle
} from 'lucide-react'

interface EstatisticasEstudoProps {
  userId: string
  periodo?: 'semana' | 'mes' | 'ano'
}

/**
 * Componente de dashboard de estatísticas de estudo
 * 
 * Features:
 * - Exibe total de horas estudadas
 * - Mostra média de horas por dia
 * - Gráfico de horas por disciplina (barras horizontais)
 * - Gráfico de evolução temporal (últimos 7 dias)
 * - Destaca disciplinas com menos estudo
 * 
 * Requirements: 4.6, 4.7, 4.8, 6.2
 */
export function EstatisticasEstudo({ userId, periodo = 'mes' }: EstatisticasEstudoProps) {
  const { estatisticas, registros, loading, error, carregarEstatisticas, carregarRegistros } = useEstudosStore()
  const [periodoSelecionado, setPeriodoSelecionado] = useState(periodo)

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Carregar estatísticas para o período
          await carregarEstatisticas(user.id, periodoSelecionado)
          
          // Carregar registros para o gráfico de evolução
          const hoje = new Date()
          const dataFim = hoje.toISOString().split('T')[0]
          
          let dataInicio: string
          if (periodoSelecionado === 'semana') {
            const inicioSemana = new Date(hoje)
            inicioSemana.setDate(hoje.getDate() - 7)
            dataInicio = inicioSemana.toISOString().split('T')[0]
          } else if (periodoSelecionado === 'mes') {
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
            dataInicio = inicioMes.toISOString().split('T')[0]
          } else {
            const inicioAno = new Date(hoje.getFullYear(), 0, 1)
            dataInicio = inicioAno.toISOString().split('T')[0]
          }
          
          await carregarRegistros(user.id, dataInicio, dataFim)
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err)
      }
    }

    loadData()
  }, [userId, periodoSelecionado, carregarEstatisticas, carregarRegistros])

  // Memoizar cálculo de evolução temporal (últimos 7 dias)
  const evolucaoTemporal = useMemo(() => {
    const hoje = new Date()
    const ultimos7Dias: { data: string; horas: number; label: string }[] = []
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(hoje.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      
      // Somar horas do dia
      const registrosDoDia = registros.filter(r => r.data === dataStr)
      const minutosDoDia = registrosDoDia.reduce((sum, r) => sum + r.duracaoMinutos, 0)
      const horasDoDia = Math.round((minutosDoDia / 60) * 100) / 100
      
      // Label do dia (ex: "Seg", "Ter")
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const label = diasSemana[data.getDay()]
      
      ultimos7Dias.push({ data: dataStr, horas: horasDoDia, label })
    }
    
    return ultimos7Dias
  }, [registros])

  // Memoizar cálculo de máximo de horas
  const maxHoras = useMemo(() => 
    Math.max(...evolucaoTemporal.map(d => d.horas), 1),
    [evolucaoTemporal]
  )

  // Callbacks para os botões de período
  const handleSemana = useCallback(() => setPeriodoSelecionado('semana'), [])
  const handleMes = useCallback(() => setPeriodoSelecionado('mes'), [])
  const handleAno = useCallback(() => setPeriodoSelecionado('ano'), [])

  if (loading && !estatisticas) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        message="Erro ao carregar estatísticas"
        description={error}
        icon={<AlertCircle className="h-16 w-16" />}
      />
    )
  }

  if (!estatisticas || estatisticas.totalHoras === 0) {
    return (
      <EmptyState
        message="Nenhum registro de estudo encontrado"
        description="Comece registrando suas sessões de estudo para ver estatísticas detalhadas"
        icon={<BookOpen className="h-16 w-16" />}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Período */}
      <div className="flex gap-2">
        <button
          onClick={handleSemana}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodoSelecionado === 'semana'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Semana
        </button>
        <button
          onClick={handleMes}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodoSelecionado === 'mes'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Mês
        </button>
        <button
          onClick={handleAno}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            periodoSelecionado === 'ano'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Ano
        </button>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Horas"
          value={`${estatisticas.totalHoras}h`}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          description={`${periodoSelecionado === 'semana' ? 'Últimos 7 dias' : periodoSelecionado === 'mes' ? 'Este mês' : 'Este ano'}`}
        />
        
        <StatCard
          title="Média por Dia"
          value={`${estatisticas.mediaHorasDia}h`}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          description="Média de horas estudadas"
        />
        
        <StatCard
          title="Dias Estudados"
          value={estatisticas.diasEstudados.toString()}
          icon={<Calendar className="h-5 w-5 text-purple-600" />}
          description={`De ${periodoSelecionado === 'semana' ? '7' : periodoSelecionado === 'mes' ? '30' : '365'} dias possíveis`}
        />
        
        <StatCard
          title="Disciplinas"
          value={estatisticas.horasPorDisciplina.length.toString()}
          icon={<BookOpen className="h-5 w-5 text-orange-600" />}
          description="Disciplinas estudadas"
        />
      </div>

      {/* Gráfico de Horas por Disciplina */}
      <Card title="Horas por Disciplina">
        {estatisticas.horasPorDisciplina.length === 0 ? (
          <EmptyState
            message="Nenhuma disciplina registrada"
            description="Adicione registros de estudo para ver a distribuição por disciplina"
          />
        ) : (
          <div className="space-y-4">
            {estatisticas.horasPorDisciplina.map((item, index) => {
              const maxHorasDisciplina = estatisticas.horasPorDisciplina[0].horas
              const porcentagem = (item.horas / maxHorasDisciplina) * 100
              
              // Destacar disciplina com menos estudo
              const isMenosEstudada = item.disciplina === estatisticas.disciplinaMenosEstudada
              
              return (
                <div key={item.disciplina} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.disciplina}
                      </span>
                      {isMenosEstudada && estatisticas.horasPorDisciplina.length > 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          <AlertCircle className="h-3 w-3" />
                          Menos estudada
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {item.horas}h
                    </span>
                  </div>
                  
                  <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                        isMenosEstudada
                          ? 'bg-yellow-500 dark:bg-yellow-600'
                          : index === 0
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-blue-400 dark:bg-blue-600'
                      }`}
                      style={{ width: `${porcentagem}%` }}
                    >
                      <div className="flex items-center justify-end h-full pr-3">
                        <span className="text-xs font-medium text-white">
                          {Math.round((item.horas / estatisticas.totalHoras) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Gráfico de Evolução Temporal (Últimos 7 Dias) */}
      <Card title="Evolução nos Últimos 7 Dias">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-2 h-48">
            {evolucaoTemporal.map((dia) => {
              const altura = maxHoras > 0 ? (dia.horas / maxHoras) * 100 : 0
              
              return (
                <div key={dia.data} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center h-40">
                    {dia.horas > 0 && (
                      <div className="absolute bottom-0 w-full flex flex-col items-center">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {dia.horas}h
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 rounded-t-lg transition-all duration-500"
                          style={{ height: `${altura}%` }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {dia.label}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Linha de base */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Evolução diária</span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Últimos 7 dias
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Insights e Recomendações */}
      {estatisticas.horasPorDisciplina.length > 1 && (
        <Card title="Insights">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Disciplina mais estudada
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{estatisticas.disciplinaMaisEstudada}</span> com{' '}
                  {estatisticas.horasPorDisciplina[0].horas}h de estudo
                </p>
              </div>
            </div>
            
            {estatisticas.disciplinaMenosEstudada && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Atenção necessária
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">{estatisticas.disciplinaMenosEstudada}</span> precisa de mais dedicação
                    ({estatisticas.horasPorDisciplina[estatisticas.horasPorDisciplina.length - 1].horas}h)
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
