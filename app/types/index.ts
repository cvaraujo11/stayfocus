// Tipos compartilhados para todo o aplicativo

// Categorias principais do aplicativo
export type Categoria = 'inicio' | 'alimentacao' | 'saude' | 'lazer' | 'nenhuma'

// Opções de humor para o monitor de humor
export type OpcaoHumor = 'otimo' | 'bom' | 'neutro' | 'baixo' | 'ruim'

// Interface para atividades de lazer
export type AtividadeLazer = {
  id: string
  nome: string
  descricao: string
  duracao: number // em minutos
  categoria: 'ativo' | 'passivo' | 'criativo' | 'social'
}

// Interface para registro de humor
export type RegistroHumor = {
  id: string
  data: string // formato YYYY-MM-DD
  humor: OpcaoHumor
  notas?: string
}

// Interface para lembretes
export type Lembrete = {
  id: string
  titulo: string
  descricao?: string
  data: string // formato YYYY-MM-DD
  hora: string // formato HH:MM
  recorrente: boolean
  diasRecorrencia?: ('seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom')[]
  categoria: Categoria
  completado: boolean
}

// Interface para registro de hidratação
export type RegistroHidratacao = {
  id: string
  data: string // formato YYYY-MM-DD
  quantidade: number // em ml
  hora: string // formato HH:MM
}

// Tipos para componentes do Dashboard
export type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  color: string
  activeColor: string
  iconClasses?: string
}

export type PlaceholderProps = {
  className?: string
}

export type DashboardCardProps = {
  children: React.ReactNode
  title?: string
  className?: string
  isLoading?: boolean
}

export type DashboardSectionProps = {
  id?: string
  title?: string
  children: React.ReactNode
  className?: string
}

// Tipos para componentes de Suspense do Dashboard
export type SuspenseWrapperProps = {
  children: React.ReactNode
  fallback: React.ReactNode
}

// ============================================
// MÓDULO DE ESTUDOS E CONCURSOS
// ============================================

// Status de concurso
export type StatusConcurso = 'em_andamento' | 'concluido' | 'cancelado'

// Letras das alternativas
export type LetraAlternativa = 'A' | 'B' | 'C' | 'D' | 'E'

// Interface para Concurso
export type Concurso = {
  id: string
  userId: string
  nome: string
  dataProva: string | null
  instituicao: string | null
  cargo: string | null
  disciplinas: string[]
  status: StatusConcurso
  createdAt: string
}

// Interface para Alternativa de Questão
export type AlternativaQuestao = {
  letra: LetraAlternativa
  texto: string
}

// Interface para Questão
export type Questao = {
  id: string
  userId: string
  concursoId: string | null
  disciplina: string
  enunciado: string
  alternativas: AlternativaQuestao[]
  respostaCorreta: LetraAlternativa
  explicacao: string | null
  tags: string[]
  createdAt: string
}

// Interface para Simulado
export type Simulado = {
  id: string
  userId: string
  concursoId: string | null
  titulo: string
  questoesIds: string[]
  dataRealizacao: string | null
  tempoLimiteMinutos: number | null
  acertos: number | null
  totalQuestoes: number | null
  createdAt: string
}

// Interface para Resposta de Simulado
export type RespostaSimulado = {
  questaoId: string
  respostaSelecionada: LetraAlternativa
  correta: boolean
  tempoResposta?: number
}

// Interface para Resultado de Simulado
export type ResultadoSimulado = {
  simuladoId: string
  acertos: number
  totalQuestoes: number
  percentual: number
  tempoTotal: number
  respostas: RespostaSimulado[]
  estatisticasPorDisciplina: EstatisticaDisciplina[]
}

// Interface para Estatística por Disciplina
export type EstatisticaDisciplina = {
  disciplina: string
  acertos: number
  total: number
  percentual: number
}

// Interface para Registro de Estudo
export type RegistroEstudo = {
  id: string
  userId: string
  data: string
  disciplina: string
  duracaoMinutos: number
  topicos: string[]
  observacoes: string | null
  createdAt: string
}

// Interface para Estatísticas de Estudo
export type EstatisticasEstudo = {
  totalHoras: number
  horasPorDisciplina: { disciplina: string; horas: number }[]
  mediaHorasDia: number
  diasEstudados: number
  disciplinaMaisEstudada: string
  disciplinaMenosEstudada: string
}

// ============================================
// TIPOS DE MAPEAMENTO DO BANCO DE DADOS
// ============================================

// Tipos de Row do banco de dados (importados de database.ts)
export type ConcursoRow = {
  id: string
  user_id: string
  nome: string
  data_prova: string | null
  instituicao: string | null
  cargo: string | null
  disciplinas: string[] | null
  status: string
  created_at: string
}

export type QuestaoRow = {
  id: string
  user_id: string
  concurso_id: string | null
  disciplina: string
  enunciado: string
  alternativas: unknown // JSON
  resposta_correta: string
  explicacao: string | null
  tags: string[] | null
  created_at: string
}

export type SimuladoRow = {
  id: string
  user_id: string
  concurso_id: string | null
  titulo: string
  questoes_ids: string[] | null
  data_realizacao: string | null
  tempo_limite_minutos: number | null
  acertos: number | null
  total_questoes: number | null
  created_at: string
}

export type RegistroEstudoRow = {
  id: string
  user_id: string
  data: string
  disciplina: string
  duracao_minutos: number
  topicos: string[] | null
  observacoes: string | null
  created_at: string
}

// Tipos de Insert para o banco de dados
export type ConcursoInsert = Omit<ConcursoRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type QuestaoInsert = Omit<QuestaoRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type SimuladoInsert = Omit<SimuladoRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type RegistroEstudoInsert = Omit<RegistroEstudoRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

// Tipos de Update para o banco de dados
export type ConcursoUpdate = Partial<ConcursoRow>
export type QuestaoUpdate = Partial<QuestaoRow>
export type SimuladoUpdate = Partial<SimuladoRow>
export type RegistroEstudoUpdate = Partial<RegistroEstudoRow>

// ============================================
// TIPOS DE FORMULÁRIOS E VALIDAÇÕES
// ============================================

// Formulário de Concurso
export type ConcursoFormData = {
  nome: string
  dataProva?: string
  instituicao?: string
  cargo?: string
  disciplinas: string[]
  status: StatusConcurso
}

// Formulário de Questão
export type QuestaoFormData = {
  concursoId?: string
  disciplina: string
  enunciado: string
  alternativas: AlternativaQuestao[]
  respostaCorreta: LetraAlternativa
  explicacao?: string
  tags?: string[]
}

// Formulário de Simulado
export type SimuladoFormData = {
  concursoId?: string
  titulo: string
  questoesIds: string[]
  tempoLimiteMinutos?: number
}

// Formulário de Registro de Estudo
export type RegistroEstudoFormData = {
  data: string
  disciplina: string
  duracaoMinutos: number
  topicos: string[]
  observacoes?: string
}

// Filtros para Questões
export type FiltrosQuestao = {
  concursoId?: string
  disciplina?: string
  tags?: string[]
  busca?: string
}

// Filtros para geração aleatória de questões
export type FiltrosAleatorio = {
  concursoId?: string
  disciplinas?: string[]
  tags?: string[]
}

// Resultado de validação
export type ValidationResult = {
  valid: boolean
  errors?: string[]
}

// Estado de simulado em andamento (para localStorage)
export type SimuladoEmAndamento = {
  simuladoId: string
  questaoAtual: number
  respostas: RespostaSimulado[]
  tempoInicio: string
  questoesMarcadas: string[]
}
