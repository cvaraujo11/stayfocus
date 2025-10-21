/**
 * Example usage of RegistroEstudoForm component
 * 
 * This file demonstrates how to use the RegistroEstudoForm component
 * in your pages or other components.
 */

'use client'

import { useState } from 'react'
import { RegistroEstudoForm } from './RegistroEstudoForm'
import { useEstudosStore } from '@/app/stores/estudosStore'
import type { RegistroEstudoFormData } from '@/app/types'

export function RegistroEstudoFormExample() {
  const [showForm, setShowForm] = useState(false)
  const { concursos, adicionarRegistro } = useEstudosStore()
  
  // Extrair disciplinas únicas de todos os concursos
  const disciplinasDisponiveis = Array.from(
    new Set(concursos.flatMap(c => c.disciplinas))
  ).sort()
  
  const handleSubmit = async (data: RegistroEstudoFormData) => {
    try {
      await adicionarRegistro({
        ...data,
        observacoes: data.observacoes || null
      })
      setShowForm(false)
      // Opcional: mostrar toast de sucesso
      console.log('Registro adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar registro:', error)
      // Opcional: mostrar toast de erro
    }
  }
  
  const handleCancel = () => {
    setShowForm(false)
  }
  
  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}>
          Registrar Sessão de Estudo
        </button>
      ) : (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Registrar Sessão de Estudo
          </h2>
          
          <RegistroEstudoForm
            disciplinasDisponiveis={disciplinasDisponiveis}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Example with editing an existing registro
 */
export function RegistroEstudoFormEditExample() {
  const [showForm, setShowForm] = useState(false)
  const { concursos, registros, atualizarRegistro } = useEstudosStore()
  
  // Get the first registro for example purposes
  const registroToEdit = registros[0]
  
  const disciplinasDisponiveis = Array.from(
    new Set(concursos.flatMap(c => c.disciplinas))
  ).sort()
  
  const handleSubmit = async (data: RegistroEstudoFormData) => {
    try {
      if (registroToEdit) {
        await atualizarRegistro(registroToEdit.id, data)
        setShowForm(false)
        console.log('Registro atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar registro:', error)
    }
  }
  
  const handleCancel = () => {
    setShowForm(false)
  }
  
  if (!registroToEdit) {
    return <div>Nenhum registro para editar</div>
  }
  
  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}>
          Editar Registro
        </button>
      ) : (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Editar Registro de Estudo
          </h2>
          
          <RegistroEstudoForm
            registro={registroToEdit}
            disciplinasDisponiveis={disciplinasDisponiveis}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Example with Modal
 */
export function RegistroEstudoFormModalExample() {
  const [isOpen, setIsOpen] = useState(false)
  const { concursos, adicionarRegistro } = useEstudosStore()
  
  const disciplinasDisponiveis = Array.from(
    new Set(concursos.flatMap(c => c.disciplinas))
  ).sort()
  
  const handleSubmit = async (data: RegistroEstudoFormData) => {
    try {
      await adicionarRegistro({
        ...data,
        observacoes: data.observacoes || null
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Erro ao adicionar registro:', error)
    }
  }
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        + Registrar Estudo
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Registrar Sessão de Estudo
              </h2>
              
              <RegistroEstudoForm
                disciplinasDisponiveis={disciplinasDisponiveis}
                onSubmit={handleSubmit}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
