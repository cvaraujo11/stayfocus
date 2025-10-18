'use client'

import { useState, useEffect } from 'react'
import { usePerfilStore } from '../../stores/perfilStore'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorMessage } from '../common/ErrorMessage'
import { Save, Target, Clock, Droplet, Coffee } from 'lucide-react'

export function MetasDiarias() {
  const { user } = useAuth()
  const { metasDiarias, atualizarMetasDiarias, loading, error, carregarPerfil } = usePerfilStore()
  const [editando, setEditando] = useState(false)
  const [metas, setMetas] = useState(metasDiarias)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (user) {
      carregarPerfil(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    setMetas(metasDiarias)
  }, [metasDiarias])

  const iniciarEdicao = () => {
    setMetas({ ...metasDiarias })
    setEditando(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const valorNumerico = parseInt(value)

    // Verificar se é um número válido
    if (!isNaN(valorNumerico)) {
      setMetas({
        ...metas,
        [name]: valorNumerico
      })
    }
  }

  const salvarAlteracoes = async () => {
    setSalvando(true)
    await atualizarMetasDiarias(metas)
    setSalvando(false)
    setEditando(false)
  }

  const cancelarEdicao = () => {
    setMetas({ ...metasDiarias })
    setEditando(false)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <LoadingSpinner size="md" label="Carregando metas..." />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Target className="h-5 w-5 mr-2 text-perfil-primary" />
          Metas Diárias
        </h2>

        {!editando ? (
          <button
            onClick={iniciarEdicao}
            disabled={salvando}
            className="px-3 py-2 text-sm text-white bg-perfil-primary rounded-md hover:bg-perfil-secondary focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Editar metas"
          >
            Personalizar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={cancelarEdicao}
              disabled={salvando}
              className="px-3 py-2 text-sm text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancelar edição"
            >
              Cancelar
            </button>
            <button
              onClick={salvarAlteracoes}
              disabled={salvando}
              className="px-3 py-2 text-sm text-white bg-perfil-primary rounded-md hover:bg-perfil-secondary focus:outline-none focus:ring-2 focus:ring-perfil-primary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Salvar metas"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => user && carregarPerfil(user.id)}
          className="mb-4"
        />
      )}

      <div className="space-y-5">
        {/* Horas de sono */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-sono-primary flex items-center justify-center mr-3">
            <Clock className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Horas de sono
            </div>

            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="horasSono"
                  value={metas.horasSono}
                  onChange={handleChange}
                  min="4"
                  max="12"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">horas</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasDiarias.horasSono} horas
              </div>
            )}
          </div>
        </div>

        {/* Tarefas prioritárias */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-hiperfocos-primary flex items-center justify-center mr-3">
            <Target className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tarefas prioritárias
            </div>

            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="tarefasPrioritarias"
                  value={metas.tarefasPrioritarias}
                  onChange={handleChange}
                  min="1"
                  max="7"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">por dia</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasDiarias.tarefasPrioritarias} por dia
              </div>
            )}
          </div>
        </div>

        {/* Copos de água */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-alimentacao-primary flex items-center justify-center mr-3">
            <Droplet className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Copos de água
            </div>

            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="coposAgua"
                  value={metas.coposAgua}
                  onChange={handleChange}
                  min="2"
                  max="15"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">por dia</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasDiarias.coposAgua} por dia
              </div>
            )}
          </div>
        </div>

        {/* Pausas programadas */}
        <div className={`flex items-center ${editando ? 'bg-perfil-light dark:bg-gray-700 p-3 rounded-md' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-lazer-primary flex items-center justify-center mr-3">
            <Coffee className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pausas programadas
            </div>

            {editando ? (
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  name="pausasProgramadas"
                  value={metas.pausasProgramadas}
                  onChange={handleChange}
                  min="2"
                  max="10"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">por dia</span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-800 dark:text-white">
                {metasDiarias.pausasProgramadas} por dia
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Suas metas diárias são usadas para personalizar recomendações e lembretes em todo o painel.
        </p>
      </div>
    </div>
  )
}
