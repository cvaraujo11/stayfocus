'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'
import { Tooltip } from '@/app/components/ui/Tooltip'
import type { RegistroEstudo } from '@/app/types'
import { cn } from '@/app/lib/utils'

interface RegistrosCalendarProps {
  registros: RegistroEstudo[]
  onDayClick?: (date: string) => void
  selectedDate?: string
  className?: string
}

interface DayData {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  registros: RegistroEstudo[]
  totalMinutos: number
}

/**
 * RegistrosCalendar - Visualização em calendário dos registros de estudo
 * 
 * Features:
 * - Visualização mensal em formato de calendário
 * - Indicadores visuais de horas estudadas por dia
 * - Navegação entre meses
 * - Tooltip com detalhes ao passar o mouse
 * - Seleção de dia para ver detalhes
 * - Destaque do dia atual
 */
export function RegistrosCalendar({
  registros,
  onDayClick,
  selectedDate,
  className,
}: RegistrosCalendarProps) {
  // Estado do mês atual sendo visualizado
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Nomes dos meses e dias da semana
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  // Calcular dados do calendário
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Primeiro e último dia do mês
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Dias do mês anterior para preencher a primeira semana
    const firstDayOfWeek = firstDay.getDay()
    const daysFromPrevMonth = firstDayOfWeek
    
    // Dias do próximo mês para preencher a última semana
    const lastDayOfWeek = lastDay.getDay()
    const daysFromNextMonth = 6 - lastDayOfWeek
    
    // Criar array de dias
    const days: DayData[] = []
    
    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const date = new Date(year, month - 1, day)
      const dateStr = date.toISOString().split('T')[0]
      
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: dateStr === selectedDate,
        registros: registros.filter(r => r.data === dateStr),
        totalMinutos: registros
          .filter(r => r.data === dateStr)
          .reduce((sum, r) => sum + r.duracaoMinutos, 0),
      })
    }
    
    // Dias do mês atual
    const today = new Date().toISOString().split('T')[0]
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday: dateStr === today,
        isSelected: dateStr === selectedDate,
        registros: registros.filter(r => r.data === dateStr),
        totalMinutos: registros
          .filter(r => r.data === dateStr)
          .reduce((sum, r) => sum + r.duracaoMinutos, 0),
      })
    }
    
    // Dias do próximo mês
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(year, month + 1, day)
      const dateStr = date.toISOString().split('T')[0]
      
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: dateStr === selectedDate,
        registros: registros.filter(r => r.data === dateStr),
        totalMinutos: registros
          .filter(r => r.data === dateStr)
          .reduce((sum, r) => sum + r.duracaoMinutos, 0),
      })
    }
    
    return days
  }, [currentDate, registros, selectedDate])
  
  // Memoizar handlers de navegação com useCallback
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }, [])
  
  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }, [])
  
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])
  
  // Memoizar função de formatação de duração
  const formatDuracao = useCallback((minutos: number): string => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    
    if (horas === 0) {
      return `${mins}min`
    } else if (mins === 0) {
      return `${horas}h`
    } else {
      return `${horas}h ${mins}min`
    }
  }, [])
  
  // Memoizar função de cor de intensidade
  const getIntensityColor = useCallback((minutos: number): string => {
    if (minutos === 0) return ''
    if (minutos < 60) return 'bg-blue-200 dark:bg-blue-900' // < 1h
    if (minutos < 120) return 'bg-blue-300 dark:bg-blue-800' // 1-2h
    if (minutos < 180) return 'bg-blue-400 dark:bg-blue-700' // 2-3h
    if (minutos < 240) return 'bg-blue-500 dark:bg-blue-600' // 3-4h
    return 'bg-blue-600 dark:bg-blue-500' // 4h+
  }, [])
  
  // Memoizar função de criação de tooltip
  const createTooltipContent = useCallback((dayData: DayData): string => {
    if (dayData.totalMinutos === 0) {
      return 'Nenhum estudo registrado'
    }
    
    const duracao = formatDuracao(dayData.totalMinutos)
    const numRegistros = dayData.registros.length
    const disciplinas = Array.from(new Set(dayData.registros.map(r => r.disciplina)))
    
    let content = `${duracao} de estudo\n${numRegistros} ${numRegistros === 1 ? 'sessão' : 'sessões'}`
    
    if (disciplinas.length > 0) {
      content += `\n\nDisciplinas:\n${disciplinas.join(', ')}`
    }
    
    return content
  }, [formatDuracao])
  
  return (
    <Card className={cn('', className)}>
      {/* Cabeçalho com navegação */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs"
          >
            Hoje
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Grade do calendário */}
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalho dos dias da semana */}
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-2"
          >
            {dia}
          </div>
        ))}
        
        {/* Dias do calendário */}
        {calendarData.map((dayData, index) => {
          const hasRegistros = dayData.totalMinutos > 0
          
          return (
            <Tooltip
              key={`${dayData.date}-${index}`}
              content={createTooltipContent(dayData)}
              position="top"
            >
              <button
                onClick={() => onDayClick?.(dayData.date)}
                className={cn(
                  'relative aspect-square p-1 rounded-lg transition-all',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  dayData.isSelected && 'ring-2 ring-blue-500',
                  !dayData.isCurrentMonth && 'opacity-40'
                )}
                aria-label={`${dayData.day} de ${meses[currentDate.getMonth()]}`}
              >
                {/* Número do dia */}
                <div
                  className={cn(
                    'text-sm font-medium mb-1',
                    dayData.isToday
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : dayData.isCurrentMonth
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-600'
                  )}
                >
                  {dayData.day}
                </div>
                
                {/* Indicador de horas estudadas */}
                {hasRegistros && (
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className={cn(
                        'w-full h-1.5 rounded-full',
                        getIntensityColor(dayData.totalMinutos)
                      )}
                    />
                    <div className="flex items-center gap-0.5 text-[10px] text-gray-600 dark:text-gray-400">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatDuracao(dayData.totalMinutos)}</span>
                    </div>
                  </div>
                )}
                
                {/* Indicador de dia atual */}
                {dayData.isToday && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            </Tooltip>
          )
        })}
      </div>
      
      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-900" />
              <span>&lt; 1h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-300 dark:bg-blue-800" />
              <span>1-2h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-700" />
              <span>2-3h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-600" />
              <span>3-4h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500" />
              <span>4h+</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>
              {registros.length} {registros.length === 1 ? 'registro' : 'registros'} no mês
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
