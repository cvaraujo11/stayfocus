'use client'

import { useMemo, useState, useEffect } from 'react'
import { Medicamento, TomadaMedicamento } from '@/app/lib/supabase/medicamentos'
import { useSaudeStore } from '@/app/stores/saudeStore'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Pill, Clock, Edit, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, X, AlertCircle } from 'lucide-react'
import { Tooltip } from '../ui/Tooltip'

interface MedicamentosListProps {
  medicamentos: Medicamento[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onRegistrarTomada: (id: string) => void
}

export function MedicamentosList({
  medicamentos,
  onEdit,
  onDelete,
  onRegistrarTomada,
}: MedicamentosListProps) {
  const { obterUltimaTomada } = useSaudeStore()
  const [ultimasTomadas, setUltimasTomadas] = useState<Record<string, TomadaMedicamento | null>>({})
  const [loadingTomadas, setLoadingTomadas] = useState(false)
  
  // Carrega última tomada de cada medicamento
  useEffect(() => {
    const carregarTomadasRecentes = async () => {
      setLoadingTomadas(true)
      const tomadasTemp: Record<string, TomadaMedicamento | null> = {}
      
      for (const med of medicamentos) {
        try {
          const ultimaTomada = await obterUltimaTomada(med.id)
          tomadasTemp[med.id] = ultimaTomada
        } catch (error) {
          console.error(`Erro ao carregar última tomada do medicamento ${med.id}:`, error)
          tomadasTemp[med.id] = null
        }
      }
      
      setUltimasTomadas(tomadasTemp)
      setLoadingTomadas(false)
    }
    
    if (medicamentos.length > 0) {
      carregarTomadasRecentes()
    }
  }, [medicamentos, obterUltimaTomada])
  
  // Ordena medicamentos por nome
  const medicamentosOrdenados = useMemo(() => {
    return [...medicamentos].sort((a, b) => a.nome.localeCompare(b.nome))
  }, [medicamentos])
  
  // Função auxiliar para calcular se já pode tomar outra dose
  const podeTomar = (medicamento: Medicamento) => {
    const ultimaTomada = ultimasTomadas[medicamento.id]
    if (!ultimaTomada) return true // Se nunca tomou, pode tomar
    
    const agora = new Date()
    const dataUltimaTomada = new Date(ultimaTomada.dataHora)
    const minutosDecorridos = differenceInMinutes(agora, dataUltimaTomada)
    
    return minutosDecorridos >= medicamento.intervaloMinutos
  }
  
  // Formatar o tempo restante para próxima dose
  const formatarTempoRestante = (medicamento: Medicamento) => {
    const ultimaTomada = ultimasTomadas[medicamento.id]
    if (!ultimaTomada) return ""
    
    const agora = new Date()
    const dataUltimaTomada = new Date(ultimaTomada.dataHora)
    const minutosDecorridos = differenceInMinutes(agora, dataUltimaTomada)
    const minutosRestantes = medicamento.intervaloMinutos - minutosDecorridos
    
    if (minutosRestantes <= 0) return ""
    
    const horas = Math.floor(minutosRestantes / 60)
    const minutos = minutosRestantes % 60
    
    if (horas > 0) {
      return `Aguarde ${horas}h${minutos > 0 ? ` ${minutos}m` : ''}`
    }
    return `Aguarde ${minutos}m`
  }
  
  // Verifica se tomou hoje
  const tomouHoje = (medicamento: Medicamento) => {
    const ultimaTomada = ultimasTomadas[medicamento.id]
    if (!ultimaTomada) return false
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataTomada = new Date(ultimaTomada.dataHora)
    dataTomada.setHours(0, 0, 0, 0)
    
    return dataTomada.getTime() === hoje.getTime()
  }

  if (medicamentosOrdenados.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <Pill className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-500 dark:text-gray-400">
          Você ainda não tem medicamentos cadastrados.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Adicione seu primeiro medicamento clicando no botão acima.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {medicamentosOrdenados.map((medicamento) => {
        const tempoRestante = formatarTempoRestante(medicamento);
        const liberadoParaTomar = podeTomar(medicamento);
        const foiTomadoHoje = tomouHoje(medicamento);
        const ultimaTomada = ultimasTomadas[medicamento.id];

        return (
          <div
            key={medicamento.id}
            className="p-4 bg-white dark:bg-gray-800 border rounded-lg border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {medicamento.nome}
                  </h3>
                  {medicamento.dosagem && (
                    <Badge className="ml-2" variant="outline">
                      {medicamento.dosagem}
                    </Badge>
                  )}
                  {!medicamento.ativo && (
                    <Badge className="ml-2" variant="secondary">
                      Inativo
                    </Badge>
                  )}
                  {foiTomadoHoje && (
                    <Badge className="ml-2" variant="success">
                      <Check className="h-3 w-3 mr-1" />
                      Tomado hoje
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {medicamento.horarios.map((horario) => (
                    <Badge key={horario} variant="secondary" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {horario}
                    </Badge>
                  ))}
                </div>
                
                {medicamento.frequencia && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Frequência: {medicamento.frequencia}
                  </p>
                )}
                
                {medicamento.intervaloMinutos && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Intervalo: {medicamento.intervaloMinutos >= 60 
                      ? `${Math.floor(medicamento.intervaloMinutos / 60)} hora${medicamento.intervaloMinutos >= 120 ? 's' : ''}` 
                      : `${medicamento.intervaloMinutos} minutos`}
                  </p>
                )}
                
                {ultimaTomada && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Última tomada: {format(new Date(ultimaTomada.dataHora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
                
                {!liberadoParaTomar && tempoRestante && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {tempoRestante}
                  </p>
                )}
                
                {medicamento.observacoes && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 italic">
                    {medicamento.observacoes}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Tooltip content={liberadoParaTomar ? "Registrar dose tomada" : tempoRestante || "Aguarde o intervalo entre doses"}>
                  <Button
                    size="icon"
                    variant={foiTomadoHoje ? "success" : "primary"}
                    onClick={() => onRegistrarTomada(medicamento.id)}
                    disabled={!liberadoParaTomar || loadingTomadas}
                    aria-label="Registrar dose tomada"
                  >
                    {foiTomadoHoje ? <Check className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                  </Button>
                </Tooltip>
                
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(medicamento.id)}
                  aria-label="Editar medicamento"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="icon"
                  variant="outline"
                  color="danger"
                  onClick={() => onDelete(medicamento.id)}
                  aria-label="Excluir medicamento"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
