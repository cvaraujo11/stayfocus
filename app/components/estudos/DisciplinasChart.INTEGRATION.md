# DisciplinasChart Integration Guide

## Integration with EstatisticasEstudo

The `DisciplinasChart` component is designed to be used within the `EstatisticasEstudo` component to provide an alternative visualization of study hours by discipline.

### Current Implementation in EstatisticasEstudo

Currently, `EstatisticasEstudo` displays hours by discipline using horizontal bars:

```tsx
{estatisticas.horasPorDisciplina.map((item, index) => {
  const maxHorasDisciplina = estatisticas.horasPorDisciplina[0].horas
  const porcentagem = (item.horas / maxHorasDisciplina) * 100
  
  return (
    <div key={item.disciplina} className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{item.disciplina}</span>
        <span className="text-gray-600">{item.horas}h</span>
      </div>
      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-blue-600 rounded-lg"
          style={{ width: `${porcentagem}%` }}
        />
      </div>
    </div>
  )
})}
```

### Suggested Integration

You can replace or complement the existing visualization with `DisciplinasChart`:

#### Option 1: Replace with Chart

```tsx
import { DisciplinasChart } from './DisciplinasChart'

// Inside EstatisticasEstudo component
<Card title="Horas por Disciplina">
  {estatisticas.horasPorDisciplina.length === 0 ? (
    <EmptyState
      message="Nenhuma disciplina registrada"
      description="Adicione registros de estudo para ver a distribuição por disciplina"
    />
  ) : (
    <DisciplinasChart 
      horasPorDisciplina={estatisticas.horasPorDisciplina}
      tipo="barra"
      height={300}
    />
  )}
</Card>
```

#### Option 2: Add Toggle Between Views

```tsx
import { useState } from 'react'
import { DisciplinasChart } from './DisciplinasChart'
import { BarChart3, PieChart } from 'lucide-react'

function EstatisticasEstudo() {
  const [viewType, setViewType] = useState<'list' | 'bar' | 'pie'>('list')
  
  return (
    <Card title="Horas por Disciplina">
      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewType('list')}
          className={`px-3 py-1 rounded ${viewType === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Lista
        </button>
        <button
          onClick={() => setViewType('bar')}
          className={`px-3 py-1 rounded ${viewType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <BarChart3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewType('pie')}
          className={`px-3 py-1 rounded ${viewType === 'pie' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <PieChart className="h-4 w-4" />
        </button>
      </div>
      
      {/* Content */}
      {viewType === 'list' ? (
        // Current list implementation
        <div className="space-y-4">
          {/* ... existing code ... */}
        </div>
      ) : (
        <DisciplinasChart 
          horasPorDisciplina={estatisticas.horasPorDisciplina}
          tipo={viewType === 'bar' ? 'barra' : 'pizza'}
          height={350}
        />
      )}
    </Card>
  )
}
```

#### Option 3: Side-by-Side Comparison

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* List View */}
  <Card title="Detalhes por Disciplina">
    {/* ... existing list implementation ... */}
  </Card>
  
  {/* Chart View */}
  <Card title="Visualização Gráfica">
    <DisciplinasChart 
      horasPorDisciplina={estatisticas.horasPorDisciplina}
      tipo="pizza"
      height={300}
    />
  </Card>
</div>
```

## Integration with Other Components

### In Dashboard

```tsx
import { DisciplinasChart } from '@/app/components/estudos'
import { useEstudosStore } from '@/app/stores/estudosStore'

function EstudosDashboard() {
  const { estatisticas } = useEstudosStore()
  
  return (
    <div className="space-y-6">
      <h2>Distribuição de Estudos</h2>
      {estatisticas && (
        <DisciplinasChart 
          horasPorDisciplina={estatisticas.horasPorDisciplina}
          tipo="barra"
        />
      )}
    </div>
  )
}
```

### In Registros Page

```tsx
import { DisciplinasChart } from '@/app/components/estudos'

function RegistrosPage() {
  const { estatisticas, carregarEstatisticas } = useEstudosStore()
  
  useEffect(() => {
    carregarEstatisticas(userId, 'mes')
  }, [userId])
  
  return (
    <div className="space-y-6">
      <RegistrosCalendar registros={registros} />
      
      {estatisticas && (
        <DisciplinasChart 
          horasPorDisciplina={estatisticas.horasPorDisciplina}
          tipo="pizza"
          height={400}
        />
      )}
    </div>
  )
}
```

## Responsive Behavior

The component is fully responsive:

- **Mobile (< 640px)**: Chart adjusts to full width, legend stacks vertically
- **Tablet (640px - 1024px)**: Optimal viewing with 2-column legend
- **Desktop (> 1024px)**: Full features with 3-column legend

## Performance Considerations

- Uses `useMemo` to prevent unnecessary recalculations
- Recharts handles chart rendering efficiently
- Minimal re-renders when data doesn't change

## Accessibility

- Tooltip provides detailed information on hover
- Color palette chosen for good contrast
- Text labels are readable
- Supports dark mode

## Future Enhancements

Potential improvements for future iterations:

1. **Animation**: Add entry animations for bars/slices
2. **Export**: Add button to export chart as image
3. **Drill-down**: Click on discipline to see detailed breakdown
4. **Comparison**: Show multiple periods side-by-side
5. **Custom Colors**: Allow user to customize discipline colors
6. **Interactive Legend**: Click legend items to filter data
