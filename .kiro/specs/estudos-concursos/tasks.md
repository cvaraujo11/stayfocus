# Implementation Plan - Módulo de Estudos e Concursos

## Visão Geral

Este plano de implementação divide o desenvolvimento do módulo de Estudos e Concursos em tarefas incrementais e gerenciáveis. Cada tarefa é projetada para ser executada de forma independente, construindo sobre as anteriores.

---

## Fase 1: Fundação e Tipos

- [x] 1. Configurar tipos TypeScript e interfaces
  - Criar interfaces para Concurso, Questao, Simulado, RegistroEstudo
  - Adicionar tipos ao arquivo `app/types/index.ts`
  - Criar tipos de mapeamento do banco de dados
  - Definir tipos de formulários e validações
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2. Criar estrutura de diretórios do módulo
  - Criar diretório `app/estudos/` com layout e página principal
  - Criar subdiretórios para rotas: `concursos/`, `questoes/`, `simulados/`, `registros/`
  - Criar diretório `app/components/estudos/` para componentes
  - Criar arquivo `app/stores/estudosStore.ts`
  - _Requirements: 6.1_

---

## Fase 2: API Layer - Concursos

- [x] 3. Implementar API de concursos
- [x] 3.1 Criar arquivo `app/lib/supabase/concursos.ts`
  - Implementar função `carregarConcursos(userId: string)`
  - Implementar função `carregarConcursoPorId(id: string, userId: string)`
  - Implementar função `carregarConcursosAtivos(userId: string)`
  - Implementar função `adicionarConcurso(concurso, userId)`
  - Implementar função `atualizarConcurso(id, updates, userId)`
  - Implementar função `removerConcurso(id, userId)`
  - Implementar helpers de mapeamento `mapConcursoFromDB()`
  - Implementar função `calcularDiasAteProva(dataProva: string)`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.5_

- [x] 3.2 Adicionar tratamento de erros e validações
  - Implementar try-catch em todas as funções
  - Validar autenticação do usuário
  - Adicionar logs de erro
  - _Requirements: 5.4, 8.1_

---

## Fase 3: Store - Concursos

- [x] 4. Implementar Zustand store para concursos
- [x] 4.1 Criar estrutura base do store
  - Definir interface `EstudosState` com estados de concursos
  - Implementar estado inicial
  - Criar store com `create<EstudosState>()`
  - _Requirements: 5.1, 5.2_

- [x] 4.2 Implementar ações de concursos no store
  - Implementar `carregarConcursos(userId)`
  - Implementar `adicionarConcurso(concurso)` com optimistic update
  - Implementar `atualizarConcurso(id, updates)`
  - Implementar `removerConcurso(id)` com confirmação
  - Implementar `selecionarConcurso(concurso)`
  - Adicionar estados de loading e error
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.3_

---

## Fase 4: UI - Concursos

- [x] 5. Criar componentes de concursos
- [x] 5.1 Implementar ConcursoCard
  - Criar componente com props tipadas
  - Exibir nome, instituição, cargo
  - Adicionar badge de status com cores
  - Implementar contador de dias até prova
  - Adicionar botões de ação (editar, excluir)
  - _Requirements: 1.1, 1.7, 6.2, 6.7_

- [x] 5.2 Implementar ConcursoForm
  - Criar formulário com validação Zod
  - Adicionar campos: nome, instituição, cargo, data da prova
  - Implementar seletor de disciplinas (multi-select)
  - Adicionar seletor de status
  - Implementar submit com feedback visual
  - _Requirements: 1.2, 6.5, 8.1, 8.5_

- [x] 5.3 Implementar ConcursosList
  - Criar lista de concursos com ConcursoCard
  - Adicionar filtro por status
  - Implementar ordenação por data da prova
  - Adicionar estado vazio
  - Implementar loading skeleton
  - _Requirements: 1.1, 1.6, 6.2, 6.3, 7.2_

- [x] 5.4 Criar página principal de estudos
  - Implementar `app/estudos/page.tsx`
  - Adicionar dashboard com cards de estatísticas
  - Exibir lista de concursos ativos
  - Adicionar botões de ações rápidas
  - Implementar proteção de rota (autenticação)
  - _Requirements: 1.1, 5.5, 6.1_

---

## Fase 5: API Layer - Questões

- [ ] 6. Implementar API de questões
- [x] 6.1 Criar arquivo `app/lib/supabase/questoes.ts`
  - Implementar função `carregarQuestoes(userId, filtros?)`
  - Implementar função `carregarQuestaoPorId(id, userId)`
  - Implementar função `carregarQuestoesPorConcurso(concursoId, userId)`
  - Implementar função `carregarQuestoesPorDisciplina(disciplina, userId)`
  - Implementar função `buscarQuestoes(termo, userId)`
  - Implementar função `adicionarQuestao(questao, userId)`
  - Implementar função `atualizarQuestao(id, updates, userId)`
  - Implementar função `removerQuestao(id, userId)`
  - Implementar helper `mapQuestaoFromDB()`
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.8, 5.5_

- [x] 6.2 Implementar funções auxiliares de questões
  - Implementar `validarQuestao(questao)` com Zod
  - Implementar `gerarQuestoesAleatorias(filtros, quantidade, userId)`
  - Implementar paginação `carregarQuestoesPaginadas()`
  - _Requirements: 2.4, 7.2, 8.2_

---

## Fase 6: Store - Questões

- [x] 7. Implementar ações de questões no store
  - Adicionar estado de questões ao store
  - Implementar `carregarQuestoes(userId, filtros?)`
  - Implementar `adicionarQuestao(questao)` com optimistic update
  - Implementar `atualizarQuestao(id, updates)`
  - Implementar `removerQuestao(id)` com verificação de vínculos
  - Implementar `buscarQuestoes(termo)` com debounce
  - Implementar `selecionarQuestao(questao)`
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 7.4_

---

## Fase 7: UI - Questões

- [x] 8. Criar componentes de questões
- [x] 8.1 Implementar QuestaoCard
  - Criar card com enunciado resumido
  - Adicionar badges de disciplina e tags
  - Exibir alternativas de forma compacta
  - Adicionar botões de ação
  - _Requirements: 2.1, 6.2, 6.7_

- [x] 8.2 Implementar QuestaoForm
  - Criar formulário com validação Zod
  - Adicionar editor de enunciado (textarea)
  - Implementar gerenciamento dinâmico de alternativas (2-5)
  - Adicionar seletor de resposta correta
  - Implementar campo de explicação
  - Adicionar seletor de concurso e disciplina
  - Implementar input de tags
  - _Requirements: 2.2, 2.3, 2.4, 6.5, 8.2, 8.6_

- [x] 8.3 Implementar QuestaoViewer
  - Criar visualizador de questão completa
  - Implementar modos: visualização, prática, simulado
  - Adicionar alternativas interativas (radio buttons)
  - Implementar feedback visual (correta/incorreta)
  - Adicionar seção de explicação expansível
  - _Requirements: 2.5, 6.2, 6.4_

- [x] 8.4 Implementar QuestoesList
  - Criar lista com filtros (concurso, disciplina, tags)
  - Adicionar barra de busca
  - Implementar paginação ou scroll infinito
  - Adicionar ordenação
  - Implementar estado vazio
  - _Requirements: 2.1, 2.8, 6.2, 6.3, 7.2_

- [x] 8.5 Criar página de questões
  - Implementar `app/estudos/questoes/page.tsx`
  - Integrar QuestoesList com filtros
  - Adicionar botão de adicionar questão
  - Implementar modal de formulário
  - _Requirements: 2.1, 2.2, 6.1_

---

## Fase 8: API Layer - Simulados

- [x] 9. Implementar API de simulados
- [x] 9.1 Criar arquivo `app/lib/supabase/simulados.ts`
  - Implementar função `carregarSimulados(userId)`
  - Implementar função `carregarSimuladoPorId(id, userId)`
  - Implementar função `carregarSimuladosRealizados(userId)`
  - Implementar função `criarSimulado(simulado, userId)`
  - Implementar função `iniciarSimulado(simuladoId, userId)`
  - Implementar função `finalizarSimulado(simuladoId, respostas, userId)`
  - Implementar função `removerSimulado(id, userId)`
  - Implementar função `carregarQuestoesSimulado(simuladoId, userId)`
  - Implementar helper `mapSimuladoFromDB()`
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.10, 5.5_

- [x] 9.2 Implementar lógica de cálculo de resultados
  - Implementar função `calcularResultado(simuladoId, respostas, questoes)`
  - Calcular acertos, percentual, tempo total
  - Gerar estatísticas por disciplina
  - Identificar questões erradas
  - _Requirements: 3.5, 3.6, 3.7_

---

## Fase 9: Store - Simulados

- [x] 10. Implementar ações de simulados no store
  - Adicionar estado de simulados ao store
  - Implementar `carregarSimulados(userId)`
  - Implementar `criarSimulado(simulado)`
  - Implementar `iniciarSimulado(simuladoId)`
  - Implementar `finalizarSimulado(simuladoId, respostas)`
  - Implementar `removerSimulado(id)`
  - Adicionar estado `simuladoEmAndamento`
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.9, 5.2_

---

## Fase 10: UI - Simulados

- [x] 11. Criar componentes de simulados
- [x] 11.1 Implementar SimuladoCard
  - Criar card com título e informações
  - Exibir número de questões
  - Mostrar resultado se realizado
  - Adicionar botões de ação
  - _Requirements: 3.1, 6.2_

- [x] 11.2 Implementar SimuladoForm
  - Criar formulário de criação
  - Adicionar seletor de concurso
  - Implementar seleção de questões (manual ou aleatória)
  - Adicionar configuração de tempo limite
  - Implementar preview de questões selecionadas
  - _Requirements: 3.2, 6.5, 8.3_

- [x] 11.3 Implementar SimuladoPlayer
  - Criar interface de realização do simulado
  - Implementar navegação entre questões
  - Adicionar cronômetro com alertas
  - Implementar marcação de questões para revisão
  - Adicionar barra de progresso
  - Implementar confirmação antes de finalizar
  - Salvar estado localmente (localStorage)
  - _Requirements: 3.3, 3.4, 3.8, 3.9, 6.4, 7.5_

- [x] 11.4 Implementar SimuladoResultado
  - Criar página de resultado
  - Exibir resumo geral com gráfico
  - Mostrar estatísticas por disciplina
  - Listar questões com respostas e explicações
  - Adicionar botões de ação (refazer, revisar erradas)
  - Implementar exportação para PDF
  - _Requirements: 3.5, 3.6, 3.7, 4.9_

- [x] 11.5 Criar páginas de simulados
  - Implementar `app/estudos/simulados/page.tsx` (lista)
  - Implementar `app/estudos/simulados/criar/page.tsx`
  - Implementar `app/estudos/simulados/[id]/page.tsx` (player)
  - Implementar `app/estudos/simulados/[id]/resultado/page.tsx`
  - _Requirements: 3.1, 3.2, 3.3, 6.1_

---

## Fase 11: API Layer - Registros de Estudo

- [x] 12. Implementar API de registros de estudo
  - Criar arquivo `app/lib/supabase/registros-estudo.ts`
  - Implementar função `carregarRegistros(userId, dataInicio?, dataFim?)`
  - Implementar função `carregarRegistroPorId(id, userId)`
  - Implementar função `carregarRegistrosPorMes(userId, ano, mes)`
  - Implementar função `adicionarRegistro(registro, userId)`
  - Implementar função `atualizarRegistro(id, updates, userId)`
  - Implementar função `removerRegistro(id, userId)`
  - Implementar função `calcularEstatisticas(userId, dataInicio?, dataFim?)`
  - Implementar função `calcularHorasPorDisciplina(userId, periodo)`
  - Implementar helper `mapRegistroEstudoFromDB()`
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 5.5_

---

## Fase 12: Store - Registros de Estudo

- [x] 13. Implementar ações de registros no store
  - Adicionar estado de registros ao store
  - Implementar `carregarRegistros(userId, dataInicio?, dataFim?)`
  - Implementar `adicionarRegistro(registro)`
  - Implementar `atualizarRegistro(id, updates)`
  - Implementar `removerRegistro(id)`
  - Implementar `carregarEstatisticas(userId, periodo?)`
  - Adicionar estado `estatisticas`
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

---

## Fase 13: UI - Registros de Estudo

- [ ] 14. Criar componentes de registros
- [x] 14.1 Implementar RegistroEstudoForm
  - Criar formulário com validação
  - Adicionar seletor de data
  - Implementar seletor de disciplina
  - Adicionar input de duração (horas e minutos)
  - Implementar input de tópicos (tags)
  - Adicionar campo de observações
  - _Requirements: 4.2, 4.4, 6.5, 8.4_

- [x] 14.2 Implementar RegistrosCalendar
  - Criar visualização em calendário
  - Exibir registros por dia
  - Adicionar indicadores visuais de horas estudadas
  - Implementar navegação entre meses
  - Adicionar tooltip com detalhes
  - _Requirements: 4.1, 6.2_

- [x] 14.3 Implementar EstatisticasEstudo
  - Criar dashboard de estatísticas
  - Exibir total de horas estudadas
  - Mostrar média de horas por dia
  - Adicionar gráfico de horas por disciplina
  - Implementar gráfico de evolução temporal
  - Destacar disciplinas com menos estudo
  - _Requirements: 4.6, 4.7, 4.8, 6.2_

- [x] 14.4 Implementar DisciplinasChart
  - Criar gráfico de barras ou pizza
  - Exibir distribuição de horas por disciplina
  - Adicionar cores distintas
  - Implementar tooltip com detalhes
  - _Requirements: 4.6, 4.7, 6.7_

- [x] 14.5 Criar página de registros
  - Implementar `app/estudos/registros/page.tsx`
  - Integrar calendário e estatísticas
  - Adicionar botão de adicionar registro
  - Implementar filtros de período
  - _Requirements: 4.1, 4.6, 6.1_

---

## Fase 14: Real-time Sync

- [x] 15. Implementar sincronização em tempo real
  - Adicionar função `setupRealtimeSync(userId)` ao store
  - Implementar subscription para `estudos_concursos`
  - Implementar subscription para `estudos_questoes`
  - Implementar subscription para `estudos_simulados`
  - Implementar subscription para `estudos_registros`
  - Adicionar handlers para INSERT, UPDATE, DELETE
  - Implementar função de cleanup
  - _Requirements: 5.2, 5.7_

---

## Fase 15: Otimizações e Performance

- [ ] 16. Implementar otimizações de performance
- [x] 16.1 Adicionar lazy loading e code splitting
  - Implementar dynamic imports para páginas pesadas
  - Adicionar lazy loading para componentes grandes
  - _Requirements: 7.3_

- [x] 16.2 Implementar memoization
  - Adicionar React.memo em componentes de lista
  - Implementar useMemo para cálculos pesados
  - Adicionar useCallback para funções
  - _Requirements: 7.1_

- [x] 16.3 Adicionar debounce e throttle
  - Implementar debounce na busca de questões
  - Adicionar throttle em scroll events
  - _Requirements: 7.4_

- [ ] 16.4 Criar índices no banco de dados
  - Executar script SQL com índices otimizados
  - Testar performance das queries
  - _Requirements: 7.1_

---

## Fase 16: Validações e Segurança

- [ ] 17. Implementar validações completas
  - Criar schemas Zod para todos os formulários
  - Adicionar validações client-side em tempo real
  - Implementar mensagens de erro claras
  - Verificar constraints do banco de dados
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 18. Verificar políticas RLS
  - Confirmar RLS habilitado em todas as tabelas
  - Testar isolamento entre usuários
  - Verificar políticas de INSERT, UPDATE, DELETE
  - _Requirements: 5.1_

---

## Fase 17: Acessibilidade e UX

- [ ] 19. Implementar melhorias de acessibilidade
  - Adicionar navegação por teclado
  - Implementar ARIA labels
  - Testar com leitor de tela
  - Verificar contraste de cores
  - Adicionar focus indicators
  - Respeitar preferências visuais do usuário
  - _Requirements: 6.4, 6.6, 6.8_

- [ ] 20. Implementar feedback visual consistente
  - Adicionar toast notifications para todas as ações
  - Implementar loading states
  - Adicionar skeleton loaders
  - Criar estados vazios informativos
  - Implementar confirmações para ações destrutivas
  - _Requirements: 6.3, 6.5_

---

## Fase 18: Responsividade

- [ ] 21. Implementar design responsivo
  - Adaptar layouts para mobile (< 640px)
  - Otimizar para tablet (640px - 1024px)
  - Testar em diferentes dispositivos
  - Implementar menu mobile
  - Adicionar botões flutuantes para ações principais
  - _Requirements: 6.1_

---

## Fase 19: Integração e Testes

- [ ] 22. Criar testes unitários
- [ ] 22.1 Testar API layer
  - Escrever testes para funções de concursos
  - Escrever testes para funções de questões
  - Escrever testes para funções de simulados
  - Escrever testes para funções de registros
  - _Requirements: 5.4_

- [ ] 22.2 Testar Store
  - Escrever testes para ações de concursos
  - Escrever testes para ações de questões
  - Escrever testes para ações de simulados
  - Escrever testes para ações de registros
  - _Requirements: 5.2_

- [ ] 23. Criar testes de integração
  - Testar fluxo completo de criação de concurso
  - Testar fluxo de criação e realização de simulado
  - Testar sincronização real-time
  - _Requirements: 5.2, 5.7_

---

## Fase 20: Documentação e Polimento

- [ ] 24. Criar documentação
  - Documentar componentes principais
  - Criar guia de uso do módulo
  - Adicionar comentários JSDoc
  - Atualizar README se necessário
  - _Requirements: 6.1_

- [ ] 25. Polimento final
  - Revisar toda a UI/UX
  - Corrigir bugs encontrados
  - Otimizar animações e transições
  - Realizar testes de usabilidade
  - _Requirements: 6.1, 6.2, 6.3_

---

**Última atualização:** 20 de Outubro de 2025
