# DisciplinasChart Component

## Overview

O componente `DisciplinasChart` exibe um gráfico visual da distribuição de horas de estudo por disciplina. Suporta dois tipos de visualização: gráfico de barras e gráfico de pizza.

## Features

- ✅ Gráfico de barras ou pizza
- ✅ Exibe distribuição de horas por disciplina
- ✅ Cores distintas para cada disciplina (paleta de 10 cores)
- ✅ Tooltip com detalhes ao passar o mouse
- ✅ Legenda customizada com informações detalhadas
- ✅ Responsivo e adaptável
- ✅ Estado vazio quando não há dados
- ✅ Suporte a tema claro/escuro

## Props

```typescript
interface DisciplinasChartProps {
  horasPorDisciplina: { disciplina: string; horas: number }[]
  tipo?: 'barra' | 'pizza'
  className?: string
  showLegend?: boolean
  height?: number
}
```

### Prop Details

- **horasPorDisciplina** (required): Array de objetos contendo disciplina e horas estudadas
- **tipo** (optional): Tipo de gráfico - 'barra' ou 'pizza'. Default: 'barra'
- **className** (optional): Classes CSS adicionais para o container
- **showLegend** (optional): Mostrar ou ocultar a legenda do gráfico. Default: true
- **height** (optional): Altura do gráfico em pixels. Default: 300

## Usage

### Gráfico de Barras (padrão)

```tsx
import { DisciplinasChart } from '@/app/components/estudos'

const data = [
  { disciplina: 'Direito Constitucional', horas: 25 },
  { disciplina: 'Direito Administrativo', horas: 20 },
  { disciplina: 'Português', horas: 15 },
]

<DisciplinasChart horasPorDisciplina={data} />
```

### Gráfico de Pizza

```tsx
<DisciplinasChart 
  horasPorDisciplina={data} 
  tipo="pizza"
  height={400}
/>
```

### Sem Legenda

```tsx
<DisciplinasChart 
  horasPorDisciplina={data}
  showLegend={false}
/>
```

### Com EstatisticasEstudo

```tsx
import { useEstudosStore } from '@/app/stores/estudosStore'
import { DisciplinasChart } from '@/app/components/estudos'

function MyComponent() {
  const { estatisticas } = useEstudosStore()
  
  if (!estatisticas) return null
  
  return (
    <DisciplinasChart 
      horasPorDisciplina={estatisticas.horasPorDisciplina}
      tipo="pizza"
    />
  )
}
```

## Visual Features

### Cores

O componente usa uma paleta de 10 cores distintas que se repetem ciclicamente:

1. Blue (#3B82F6)
2. Green (#10B981)
3. Amber (#F59E0B)
4. Red (#EF4444)
5. Violet (#8B5CF6)
6. Pink (#EC4899)
7. Teal (#14B8A6)
8. Orange (#F97316)
9. Indigo (#6366F1)
10. Lime (#84CC16)

### Tooltip

Ao passar o mouse sobre qualquer elemento do gráfico, um tooltip customizado exibe:
- Nome da disciplina
- Horas de estudo
- Percentual do total

### Legenda Detalhada

Abaixo do gráfico, uma legenda em grid mostra:
- Indicador de cor
- Nome da disciplina (truncado se muito longo)
- Horas e percentual

## Accessibility

- Suporte a tema claro/escuro
- Cores com contraste adequado
- Texto legível em diferentes tamanhos
- Responsivo para mobile, tablet e desktop

## Requirements Satisfied

- **4.6**: Exibe estatísticas semanais e mensais de horas estudadas por disciplina
- **4.7**: Gera gráficos de evolução mostrando tendências de estudo ao longo do tempo
- **6.7**: Utiliza cores e ícones para facilitar identificação visual de categorias e status

## Dependencies

- `recharts`: Biblioteca de gráficos React
- `@/app/components/ui/Card`: Componente de card
- `@/app/components/common/EmptyState`: Estado vazio
- `lucide-react`: Ícones

## Notes

- O componente é otimizado com `useMemo` para recalcular dados apenas quando necessário
- Suporta arrays vazios, exibindo um estado vazio apropriado
- Totalmente tipado com TypeScript
- Segue os padrões de design do StayFocus

## Related Components

- `EstatisticasEstudo`: Usa este componente para exibir distribuição de horas
- `RegistrosCalendar`: Visualização complementar de registros de estudo
- `RegistroEstudoForm`: Formulário para adicionar registros que alimentam este gráfico
