'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/app/components/ui/Card'
import { EmptyState } from '@/app/components/common/EmptyState'
import { BookOpen } from 'lucide-react'

interface DisciplinasChartProps {
  horasPorDisciplina: { disciplina: string; horas: number }[]
  tipo?: 'barra' | 'pizza'
  className?: string
  showLegend?: boolean
  height?: number
}

/**
 * DisciplinasChart - Gráfico de distribuição de horas por disciplina
 * 
 * Features:
 * - Gráfico de barras ou pizza
 * - Exibe distribuição de horas por disciplina
 * - Cores distintas para cada disciplina
 * - Tooltip com detalhes ao passar o mouse
 * - Responsivo
 * 
 * Requirements: 4.6, 4.7, 6.7
 */
export function DisciplinasChart({
  horasPorDisciplina,
  tipo = 'barra',
  className = '',
  showLegend = true,
  height = 300,
}: DisciplinasChartProps) {
  // Paleta de cores distintas para as disciplinas
  const COLORS = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#F97316', // orange-500
    '#6366F1', // indigo-500
    '#84CC16', // lime-500
  ]

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    return horasPorDisciplina.map((item, index) => ({
      disciplina: item.disciplina,
      horas: item.horas,
      color: COLORS[index % COLORS.length],
      // Calcular percentual
      percentual: horasPorDisciplina.length > 0
        ? Math.round((item.horas / horasPorDisciplina.reduce((sum, d) => sum + d.horas, 0)) * 100)
        : 0,
    }))
  }, [horasPorDisciplina])

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {data.disciplina}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{data.horas}h</span> de estudo
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{data.percentual}%</span> do total
          </p>
        </div>
      )
    }
    return null
  }

  // Label customizado para o gráfico de pizza
  const renderCustomLabel = (entry: any) => {
    return `${entry.percentual}%`
  }

  if (!horasPorDisciplina || horasPorDisciplina.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          message="Nenhuma disciplina registrada"
          description="Adicione registros de estudo para ver a distribuição por disciplina"
          icon={<BookOpen className="h-12 w-12" />}
        />
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="w-full" style={{ height: `${height}px` }}>
        {tipo === 'pizza' ? (
          // Gráfico de Pizza
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="horas"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {entry.payload.disciplina}
                    </span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          // Gráfico de Barras
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="disciplina"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
                className="text-xs text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={() => 'Horas de Estudo'}
                />
              )}
              <Bar dataKey="horas" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legenda adicional com informações detalhadas */}
      {chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chartData.map((item, index) => (
              <div
                key={item.disciplina}
                className="flex items-center gap-2 text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {item.disciplina}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.horas}h ({item.percentual}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
