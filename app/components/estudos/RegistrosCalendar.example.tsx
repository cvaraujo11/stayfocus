/**
 * Example usage of RegistrosCalendar component
 * 
 * This file demonstrates how to use the RegistrosCalendar component
 * with sample data and event handlers.
 */

'use client'

import { useState } from 'react'
import { RegistrosCalendar } from './RegistrosCalendar'
import type { RegistroEstudo } from '@/app/types'

export function RegistrosCalendarExample() {
  const [selectedDate, setSelectedDate] = useState<string>()
  
  // Sample data
  const sampleRegistros: RegistroEstudo[] = [
    {
      id: '1',
      userId: 'user-1',
      data: new Date().toISOString().split('T')[0], // Today
      disciplina: 'Direito Constitucional',
      duracaoMinutos: 120,
      topicos: ['Direitos Fundamentais', 'Teoria'],
      observacoes: 'Revisão de conceitos básicos',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'user-1',
      data: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      disciplina: 'Direito Administrativo',
      duracaoMinutos: 90,
      topicos: ['Atos Administrativos', 'Exercícios'],
      observacoes: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      userId: 'user-1',
      data: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
      disciplina: 'Direito Constitucional',
      duracaoMinutos: 180,
      topicos: ['Controle de Constitucionalidade'],
      observacoes: 'Estudo aprofundado',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      userId: 'user-1',
      data: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
      disciplina: 'Português',
      duracaoMinutos: 60,
      topicos: ['Interpretação de Texto'],
      observacoes: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      userId: 'user-1',
      data: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago (second session)
      disciplina: 'Raciocínio Lógico',
      duracaoMinutos: 45,
      topicos: ['Lógica Proposicional'],
      observacoes: null,
      createdAt: new Date().toISOString(),
    },
  ]
  
  const handleDayClick = (date: string) => {
    console.log('Day clicked:', date)
    setSelectedDate(date)
    
    // Find registros for this date
    const registrosNoDia = sampleRegistros.filter(r => r.data === date)
    console.log('Registros on this day:', registrosNoDia)
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Calendário de Estudos - Exemplo
      </h1>
      
      <RegistrosCalendar
        registros={sampleRegistros}
        onDayClick={handleDayClick}
        selectedDate={selectedDate}
      />
      
      {selectedDate && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Registros em {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </h2>
          
          {sampleRegistros.filter(r => r.data === selectedDate).length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum registro neste dia
            </p>
          ) : (
            <ul className="space-y-2">
              {sampleRegistros
                .filter(r => r.data === selectedDate)
                .map(registro => (
                  <li
                    key={registro.id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {registro.disciplina}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.floor(registro.duracaoMinutos / 60)}h{' '}
                      {registro.duracaoMinutos % 60}min
                    </div>
                    {registro.topicos.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {registro.topicos.join(', ')}
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
