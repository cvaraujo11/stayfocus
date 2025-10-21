/**
 * Example usage of DisciplinasChart component
 * 
 * This file demonstrates how to use the DisciplinasChart component
 * with sample data for both bar and pie chart types.
 */

import { DisciplinasChart } from './DisciplinasChart'

// Sample data
const sampleData = [
  { disciplina: 'Direito Constitucional', horas: 25 },
  { disciplina: 'Direito Administrativo', horas: 20 },
  { disciplina: 'Português', horas: 15 },
  { disciplina: 'Raciocínio Lógico', horas: 12 },
  { disciplina: 'Informática', horas: 8 },
]

export function DisciplinasChartExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Gráfico de Barras</h2>
        <DisciplinasChart
          horasPorDisciplina={sampleData}
          tipo="barra"
          height={400}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Gráfico de Pizza</h2>
        <DisciplinasChart
          horasPorDisciplina={sampleData}
          tipo="pizza"
          height={400}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Sem Legenda</h2>
        <DisciplinasChart
          horasPorDisciplina={sampleData}
          tipo="barra"
          showLegend={false}
          height={300}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Estado Vazio</h2>
        <DisciplinasChart
          horasPorDisciplina={[]}
          tipo="barra"
        />
      </div>
    </div>
  )
}
