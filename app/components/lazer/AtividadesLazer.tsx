'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash, Clock, Calendar, Bookmark } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Textarea } from '@/app/components/ui/Textarea'
import { Badge } from '@/app/components/ui/Badge'
import { Select } from '@/app/components/ui/Select'
import { StatCard } from '@/app/components/ui/StatCard'
import { Alert } from '@/app/components/ui/Alert'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { ErrorMessage } from '@/app/components/common/ErrorMessage'
import { useAtividadesStore } from '@/app/stores/atividadesStore'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Atividade } from '@/app/stores/atividadesStore'

export function AtividadesLazer() {
  const { user } = useAuth()
  const {
    atividades,
    loading,
    error: storeError,
    carregarAtividades,
    adicionarAtividade,
    removerAtividade,
    marcarConcluida,
    setupRealtimeSync
  } = useAtividadesStore()

  const [novaAtividade, setNovaAtividade] = useState<Omit<Atividade, 'id'>>({
    nome: '',
    categoria: 'lazer',
    duracao: 30,
    observacoes: '',
    data: new Date().toISOString().split('T')[0]
  })

  const [erro, setErro] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Load atividades on mount
  useEffect(() => {
    if (user) {
      carregarAtividades(user.id, 'lazer')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Setup real-time sync
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtimeSync(user.id)
      return cleanup
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Categorias de atividades (fixed to match database schema)
  const categorias = [
    { value: 'lazer', label: 'Lazer' },
    { value: 'saude', label: 'Saúde' },
    { value: 'social', label: 'Social' }
  ]

  // Estatísticas
  const estatisticas = useMemo(() => {
    const totalAtividades = atividades.length
    const totalMinutosLazer = atividades.reduce((acc, curr) => acc + curr.duracao, 0)

    // Categoria mais comum
    const contagem = atividades.reduce((acc, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoriaMaisComum = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return {
      totalAtividades,
      totalMinutosLazer,
      categoriaMaisComum
    }
  }, [atividades])

  // Handler para adicionar atividade
  const handleAdicionarAtividade = async () => {
    if (!novaAtividade.nome.trim()) {
      setErro('O nome da atividade é obrigatório')
      return
    }

    try {
      await adicionarAtividade(novaAtividade)

      // Resetar o formulário
      setNovaAtividade({
        nome: '',
        categoria: 'lazer',
        duracao: 30,
        observacoes: '',
        data: new Date().toISOString().split('T')[0]
      })

      setErro('')
      setShowForm(false)
    } catch (error) {
      setErro('Erro ao adicionar atividade. Tente novamente.')
    }
  }

  // Show loading state
  if (loading && atividades.length === 0) {
    return <LoadingSpinner />
  }

  // Show error state
  if (storeError && atividades.length === 0) {
    return (
      <ErrorMessage
        message={storeError}
        onRetry={() => user && carregarAtividades(user.id, 'lazer')}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => setShowForm(!showForm)}
          aria-label={showForm ? "Cancelar adição" : "Adicionar nova atividade de lazer"}
        >
          {showForm ? 'Cancelar' : 'Nova Atividade'}
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total de Atividades"
          value={estatisticas.totalAtividades.toString()}
          icon={<Bookmark className="h-5 w-5" />}
          description="Atividades registradas"
        />

        <StatCard
          title="Tempo de Lazer"
          value={`${Math.floor(estatisticas.totalMinutosLazer / 60)}h ${estatisticas.totalMinutosLazer % 60}m`}
          icon={<Clock className="h-5 w-5" />}
          description="Tempo acumulado"
        />

        <StatCard
          title="Categoria Favorita"
          value={estatisticas.categoriaMaisComum}
          icon={<Bookmark className="h-5 w-5" />}
          description="Mais frequente"
        />
      </div>

      {/* Formulário para adicionar nova atividade */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Nova Atividade de Lazer
          </h3>

          {erro && <Alert variant="error" className="mb-3">{erro}</Alert>}

          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome da atividade
              </label>
              <Input
                id="nome"
                value={novaAtividade.nome}
                onChange={e => setNovaAtividade({ ...novaAtividade, nome: e.target.value })}
                placeholder="Ex: Ler um livro"
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <Select
                  id="categoria"
                  value={novaAtividade.categoria}
                  onChange={e => setNovaAtividade({ ...novaAtividade, categoria: e.target.value as 'lazer' | 'saude' | 'social' })}
                  options={categorias}
                />
              </div>

              <div>
                <label htmlFor="duracao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duração (minutos)
                </label>
                <Input
                  id="duracao"
                  type="number"
                  min="5"
                  max="240"
                  value={novaAtividade.duracao}
                  onChange={e => setNovaAtividade({ ...novaAtividade, duracao: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </label>
              <Input
                id="data"
                type="date"
                value={novaAtividade.data}
                onChange={e => setNovaAtividade({ ...novaAtividade, data: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações (opcional)
              </label>
              <Textarea
                id="observacoes"
                value={novaAtividade.observacoes}
                onChange={e => setNovaAtividade({ ...novaAtividade, observacoes: e.target.value })}
                placeholder="Detalhes adicionais sobre a atividade..."
              />
            </div>

            <Button onClick={handleAdicionarAtividade} className="w-full">
              Adicionar Atividade
            </Button>
          </div>
        </div>
      )}

      {/* Lista de atividades */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Suas Atividades
        </h3>

        {atividades.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Você ainda não tem nenhuma atividade de lazer registrada.</p>
            <p className="mt-1">Adicione uma atividade para começar a acompanhar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {atividades.map(atividade => (
              <div
                key={atividade.id}
                className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {atividade.nome}
                      </h4>
                      <Badge className="ml-2" variant="default">
                        {atividade.categoria}
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {atividade.duracao} min
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(atividade.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {atividade.observacoes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {atividade.observacoes}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removerAtividade(atividade.id)}
                      aria-label="Remover atividade"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
