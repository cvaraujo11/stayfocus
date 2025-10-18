'use client'

import { useState, useEffect } from 'react'
import { Camera, Plus, X } from 'lucide-react'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'
import { useAuth } from '@/app/contexts/AuthContext'
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner'
import { ErrorMessage } from '@/app/components/common/ErrorMessage'

export function RegistroRefeicoes() {
  const { user } = useAuth()
  const {
    registros,
    loading,
    error,
    carregarRefeicoes,
    adicionarRegistro,
    removerRegistro,
    setupRealtimeSync
  } = useAlimentacaoStore()

  const [novoRegistro, setNovoRegistro] = useState({
    hora: '',
    descricao: '',
    foto: null as File | null,
  })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Load data on mount
  useEffect(() => {
    if (user) {
      carregarRefeicoes(user.id)
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

  const handleAdicionarRegistro = async () => {
    if (!novoRegistro.hora || !novoRegistro.descricao) return

    setUploading(true)
    try {
      await adicionarRegistro(
        novoRegistro.descricao,
        novoRegistro.hora,
        novoRegistro.foto
      )

      setNovoRegistro({
        hora: '',
        descricao: '',
        foto: null,
      })
      setFotoPreview(null)
      setMostrarForm(false)
    } catch (error) {
      console.error('Error adding registro:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNovoRegistro({
        ...novoRegistro,
        foto: file,
      })

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoverFoto = () => {
    setNovoRegistro({
      ...novoRegistro,
      foto: null,
    })
    setFotoPreview(null)
  }

  const handleRemoverRegistro = async (id: string) => {
    try {
      await removerRegistro(id)
    } catch (error) {
      console.error('Error removing registro:', error)
    }
  }

  if (loading && registros.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => user && carregarRefeicoes(user.id)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {registros.length === 0 && !mostrarForm ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Nenhum registro de refeição ainda.</p>
          <p className="text-sm mt-1">Clique em "Adicionar Registro" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registros.map((registro) => (
            <div
              key={registro.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                      {registro.hora}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {registro.descricao}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(registro.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoverRegistro(registro.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Remover registro"
                  disabled={loading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {registro.foto_url && (
                <div className="mt-2">
                  <img
                    src={registro.foto_url}
                    alt="Foto da refeição"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {mostrarForm ? (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Novo Registro
            </h3>
            <button
              onClick={() => {
                setMostrarForm(false)
                setNovoRegistro({ hora: '', descricao: '', foto: null })
                setFotoPreview(null)
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Fechar formulário"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="time"
                value={novoRegistro.hora}
                onChange={(e) => setNovoRegistro({ ...novoRegistro, hora: e.target.value })}
                className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                aria-label="Horário da refeição"
                disabled={uploading}
              />
              <input
                type="text"
                value={novoRegistro.descricao}
                onChange={(e) => setNovoRegistro({ ...novoRegistro, descricao: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Descrição da refeição"
                aria-label="Descrição da refeição"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foto da Refeição (opcional)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <Camera className="h-5 w-5 mr-2" />
                  <span>Escolher Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {fotoPreview && (
                  <button
                    onClick={handleRemoverFoto}
                    className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Remover foto"
                    disabled={uploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {fotoPreview && (
                <div className="mt-2 relative">
                  <img
                    src={fotoPreview}
                    alt="Prévia da foto"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setMostrarForm(false)
                  setNovoRegistro({ hora: '', descricao: '', foto: null })
                  setFotoPreview(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarRegistro}
                disabled={!novoRegistro.hora || !novoRegistro.descricao || uploading}
                className="px-4 py-2 bg-alimentacao-primary text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Salvar registro"
              >
                {uploading && <LoadingSpinner size="sm" />}
                {uploading ? 'Salvando...' : 'Salvar Registro'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="w-full py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          aria-label="Adicionar novo registro de refeição"
          disabled={loading}
        >
          <Plus className="h-5 w-5 mr-1" />
          <span>Adicionar Registro</span>
        </button>
      )}
    </div>
  )
}
