# Componentes do Módulo de Estudos e Concursos

Este diretório contém todos os componentes React para o módulo de Estudos e Concursos do StayFocus.

## Componentes Implementados

### Concursos
- **ConcursoCard**: Card para exibir resumo de um concurso
- **ConcursoForm**: Formulário para criar/editar concursos
- **ConcursosList**: Lista de concursos com filtros

### Questões
- **QuestaoCard**: Card para exibir resumo de uma questão
- **QuestaoForm**: Formulário para criar/editar questões
- **QuestaoViewer**: Visualizador de questão completa com alternativas
- **QuestoesList**: Lista de questões com filtros e busca

### Simulados
- **SimuladoCard**: Card para exibir resumo de um simulado
- **SimuladoForm**: Formulário para criar simulados (seleção manual ou aleatória de questões)
- **SimuladoPlayer**: Interface completa para realizar simulados com:
  - Navegação entre questões
  - Cronômetro com alertas
  - Marcação de questões para revisão
  - Barra de progresso
  - Salvamento automático no localStorage
  - Confirmação antes de finalizar
- **SimuladoResultado**: Exibição de resultados com:
  - Resumo geral com percentual
  - Gráfico de desempenho
  - Estatísticas por disciplina
  - Correção detalhada de todas as questões
  - Filtros (todas/erradas/certas)
  - Ações (refazer, revisar erradas, exportar PDF)

### Registros de Estudo
- **RegistroEstudoForm**: Formulário para registrar sessões de estudo com:
  - Seletor de data
  - Seletor de disciplina
  - Input de duração (horas e minutos)
  - Input de tópicos estudados (tags)
  - Campo de observações
  - Validação completa com Zod
- **RegistrosCalendar**: Visualização em calendário dos registros de estudo com:
  - Visualização mensal em formato de calendário
  - Indicadores visuais de horas estudadas por dia
  - Navegação entre meses (anterior/próximo/hoje)
  - Tooltip com detalhes ao passar o mouse
  - Seleção de dia para ver detalhes
  - Destaque do dia atual
  - Legenda de cores para interpretação rápida

## Estrutura de Páginas

### `/estudos/simulados`
- Lista todos os simulados (pendentes e realizados)
- Permite criar novos simulados
- Permite remover simulados

### `/estudos/simulados/criar`
- Formulário de criação de simulado
- Seleção manual ou aleatória de questões
- Filtros por concurso e disciplina
- Preview de questões selecionadas

### `/estudos/simulados/[id]`
- Player para realizar o simulado
- Navegação entre questões
- Cronômetro (se configurado)
- Marcação de questões
- Salvamento automático do progresso

### `/estudos/simulados/[id]/resultado`
- Exibição completa do resultado
- Estatísticas detalhadas
- Correção de todas as questões
- Opções de refazer e revisar

## Funcionalidades Principais

### SimuladoPlayer
- ✅ Navegação entre questões (anterior/próxima/direta)
- ✅ Seleção de alternativas
- ✅ Marcação de questões para revisão
- ✅ Cronômetro com tempo limite opcional
- ✅ Alerta quando faltam 5 minutos
- ✅ Finalização automática ao esgotar o tempo
- ✅ Salvamento automático no localStorage
- ✅ Barra de progresso visual
- ✅ Grid de navegação com indicadores
- ✅ Confirmação antes de finalizar
- ✅ Contagem de questões respondidas

### SimuladoForm
- ✅ Seleção manual de questões
- ✅ Geração aleatória de questões
- ✅ Filtros por concurso e disciplina
- ✅ Configuração de tempo limite
- ✅ Preview de questões selecionadas
- ✅ Validações completas
- ✅ Ações em lote (selecionar todas/limpar)

### SimuladoResultado
- ✅ Resumo geral com percentual
- ✅ Gráfico visual de desempenho
- ✅ Estatísticas por disciplina
- ✅ Lista completa de questões
- ✅ Correção detalhada com explicações
- ✅ Filtros (todas/erradas/certas)
- ✅ Expansão/colapso de questões
- ✅ Indicadores visuais (correto/incorreto)
- ✅ Ações (refazer, revisar, exportar)

## Integração com Store

Todos os componentes utilizam o `useEstudosStore` do Zustand para:
- Gerenciar estado global
- Realizar operações CRUD
- Sincronizar com Supabase
- Implementar optimistic updates
- Sincronização em tempo real entre dispositivos

### Real-time Sync

O módulo implementa sincronização em tempo real para todas as tabelas:
- `estudos_concursos`: Concursos são sincronizados automaticamente
- `estudos_questoes`: Questões são atualizadas em tempo real
- `estudos_simulados`: Simulados refletem mudanças instantaneamente
- `estudos_registros`: Registros de estudo são sincronizados

**Como usar:**

```typescript
import { useEstudosStore } from '@/app/stores/estudosStore'
import { useEffect } from 'react'

function EstudosPage() {
  const setupRealtimeSync = useEstudosStore(state => state.setupRealtimeSync)
  
  useEffect(() => {
    // Configurar sincronização ao montar o componente
    const cleanup = setupRealtimeSync(userId)
    
    // Limpar subscriptions ao desmontar
    return cleanup
  }, [userId, setupRealtimeSync])
  
  // Resto do componente...
}
```

**Funcionalidades:**
- ✅ Sincronização automática de INSERT, UPDATE e DELETE
- ✅ Atualização do estado local sem recarregar a página
- ✅ Suporte para múltiplos dispositivos conectados
- ✅ Cleanup automático ao desmontar componentes
- ✅ Logs de debug para monitoramento

## Acessibilidade

- ✅ Navegação por teclado
- ✅ ARIA labels apropriados
- ✅ Contraste de cores adequado
- ✅ Feedback visual claro
- ✅ Estados de loading e erro

## Responsividade

- ✅ Layout adaptativo para mobile, tablet e desktop
- ✅ Grid responsivo para cards
- ✅ Navegação otimizada para touch
- ✅ Textos e botões com tamanhos adequados

## Próximos Passos

- [ ] Implementar exportação para PDF (SimuladoResultado)
- [ ] Adicionar gráficos mais avançados (Chart.js ou Recharts)
- [ ] Implementar revisão de questões erradas
- [ ] Adicionar estatísticas de evolução ao longo do tempo
- [ ] Implementar compartilhamento de simulados
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar otimizações de performance (lazy loading, memoization)

## Última Atualização

20 de Outubro de 2025
