# Design Document - Modo Demo

## Overview

O Modo Demo permite que visitantes explorem a aplicação StayFocus sem necessidade de cadastro, utilizando dados simulados armazenados no Local Storage do navegador. Esta funcionalidade reduz a barreira de entrada e permite que usuários experimentem o valor da aplicação antes de se comprometerem com o cadastro.

A implementação utiliza uma abordagem de "dual-mode" onde a aplicação pode operar em dois estados:
1. **Modo Autenticado**: Dados persistidos no Supabase (comportamento atual)
2. **Modo Demo**: Dados persistidos no Local Storage do navegador

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Página de Login                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Anúncio Demo (Banner)                                 │ │
│  │  - Texto explicativo                                   │ │
│  │  - Botão "Experimentar Demo"                           │ │
│  │  - Botão fechar (X)                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Formulário de Login]                                       │
│  [Botão Google OAuth]                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Modo Demo Ativado?     │
              └─────────────────────────┘
                     │            │
              ┌──────┘            └──────┐
              │ Sim                      │ Não
              ▼                          ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  Local Storage   │      │    Supabase      │
    │  Data Provider   │      │  Data Provider   │
    └──────────────────┘      └──────────────────┘
              │                          │
              └──────────┬───────────────┘
                         ▼
              ┌──────────────────────┐
              │  Zustand Stores      │
              │  (Interface Única)   │
              └──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Componentes UI      │
              └──────────────────────┘
```

### Component Architecture

A arquitetura segue o padrão de abstração de camada de dados, onde os Zustand stores não precisam saber a origem dos dados:

```
UI Components
     ↓
Zustand Stores (Interface)
     ↓
Data Provider Layer (Abstração)
     ↓
┌─────────────┬─────────────┐
│  Supabase   │ LocalStorage│
│  Provider   │  Provider   │
└─────────────┴─────────────┘
```

## Components and Interfaces

### 1. Demo Context Provider

**Arquivo**: `app/contexts/DemoContext.tsx`

Gerencia o estado global do modo demo e fornece funções utilitárias.

```typescript
interface DemoContextType {
  isDemoMode: boolean
  activateDemoMode: () => void
  deactivateDemoMode: () => void
  migrateDemoData: (userId: string) => Promise<void>
}
```

**Responsabilidades**:
- Detectar se o modo demo está ativo
- Ativar/desativar modo demo
- Gerenciar flag no Local Storage
- Coordenar migração de dados

### 2. Local Storage Data Provider

**Arquivo**: `app/lib/localStorage/provider.ts`

Implementa operações CRUD no Local Storage com interface compatível com Supabase.

```typescript
interface LocalStorageProvider {
  // Generic CRUD operations
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  update<T>(key: string, updates: Partial<T>): void
  delete(key: string): void
  
  // Collection operations (similar to Supabase tables)
  getCollection<T>(collectionName: string): T[]
  addToCollection<T>(collectionName: string, item: T): T
  updateInCollection<T>(collectionName: string, id: string, updates: Partial<T>): T
  removeFromCollection(collectionName: string, id: string): void
  queryCollection<T>(collectionName: string, filter: (item: T) => boolean): T[]
}
```

**Estrutura de Dados no Local Storage**:
```json
{
  "demo_mode": true,
  "demo_data": {
    "prioridades": [...],
    "saude_medicamentos": [...],
    "saude_registros_humor": [...],
    "alimentacao_refeicoes": [...],
    "alimentacao_hidratacao": [...],
    "sono_registros": [...],
    "estudos_concursos": [...],
    "financas_transacoes": [...]
  }
}
```

### 3. Demo Data Generator

**Arquivo**: `app/lib/demo/dataGenerator.ts`

Gera dados simulados realistas para popular o modo demo.

```typescript
interface DemoDataGenerator {
  generateAllData(): DemoData
  generatePrioridades(days: number): Prioridade[]
  generateMedicamentos(): Medicamento[]
  generateRegistrosHumor(days: number): RegistroHumor[]
  generateRefeicoes(days: number): RegistroRefeicao[]
  generateHidratacao(days: number): HidratacaoDiaria[]
  generateSono(days: number): RegistroSono[]
  generateEstudos(days: number): RegistroEstudo[]
  generateFinancas(days: number): Transacao[]
}
```

**Características dos Dados Simulados**:
- 7 dias de histórico
- Padrões realistas (ex: medicamentos tomados em horários regulares)
- Variação natural (ex: humor oscilando, algumas prioridades não concluídas)
- Dados coerentes entre categorias

### 4. Demo Banner Component

**Arquivo**: `app/components/demo/DemoBanner.tsx`

Banner informativo exibido na página de login.

```typescript
interface DemoBannerProps {
  onStartDemo: () => void
  onClose: () => void
}
```

**Design Visual**:
- Posicionado acima do formulário de login
- Cor de destaque (azul claro)
- Ícone informativo
- Texto claro e conciso
- Botão CTA proeminente
- Botão fechar (X) no canto superior direito

### 5. Demo Indicator Component

**Arquivo**: `app/components/demo/DemoIndicator.tsx`

Indicador visual persistente mostrando que o usuário está no modo demo.

```typescript
interface DemoIndicatorProps {
  onCreateAccount: () => void
}
```

**Design Visual**:
- Badge fixo no topo da página
- Cor distintiva (laranja/amarelo)
- Texto: "Modo Demo - Seus dados são temporários"
- Link para criar conta

### 6. Demo Migration Dialog

**Arquivo**: `app/components/demo/DemoMigrationDialog.tsx`

Dialog exibido quando usuário decide criar conta no modo demo.

```typescript
interface DemoMigrationDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onDecline: () => void
  onClose: () => void
}
```

**Fluxo**:
1. Usuário clica em "Criar Conta" no indicador demo
2. Dialog pergunta se deseja manter dados
3. Opções: "Sim, manter meus dados" / "Não, começar do zero"
4. Redireciona para página de registro com flag de migração

## Data Models

### Demo Mode Flag

```typescript
interface DemoModeConfig {
  enabled: boolean
  activatedAt: string // ISO timestamp
  dataVersion: string // Para versionamento futuro
}
```

**Local Storage Key**: `demo_mode_config`

### Demo Data Structure

Cada coleção no Local Storage segue o mesmo formato das tabelas Supabase:

```typescript
interface DemoDataCollection<T> {
  items: T[]
  lastModified: string
}
```

### Migration Metadata

```typescript
interface MigrationMetadata {
  sourceMode: 'demo'
  migratedAt: string
  collectionsCount: number
  itemsCount: number
}
```

## Error Handling

### Estratégias de Error Handling

1. **Local Storage Quota Exceeded**
   - Detectar erro de quota
   - Mostrar mensagem amigável
   - Sugerir criar conta para dados ilimitados

2. **Data Corruption**
   - Validar estrutura ao carregar
   - Regenerar dados se corrompidos
   - Log de erros para debugging

3. **Migration Failures**
   - Transação atômica (tudo ou nada)
   - Manter dados demo até confirmação de sucesso
   - Rollback em caso de falha
   - Mensagem clara de erro ao usuário

### Error Messages

```typescript
const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: 'Espaço de armazenamento local cheio. Crie uma conta para dados ilimitados.',
  DATA_CORRUPTED: 'Dados corrompidos detectados. Reiniciando modo demo.',
  MIGRATION_FAILED: 'Erro ao migrar dados. Seus dados demo estão seguros. Tente novamente.',
  LOAD_FAILED: 'Erro ao carregar dados. Tente recarregar a página.',
}
```

## Testing Strategy

### Unit Tests

1. **Local Storage Provider**
   - CRUD operations
   - Collection queries
   - Error handling (quota, corruption)

2. **Demo Data Generator**
   - Data structure validation
   - Data consistency
   - Date ranges

3. **Demo Context**
   - Mode activation/deactivation
   - Flag persistence
   - Migration coordination

### Integration Tests

1. **Store Integration**
   - Zustand stores com Local Storage provider
   - Data persistence
   - Real-time updates (simulated)

2. **Migration Flow**
   - Demo → Authenticated transition
   - Data integrity após migração
   - Cleanup de dados demo

### E2E Tests

1. **Demo Flow Completo**
   - Ativar modo demo
   - Navegar pela aplicação
   - Adicionar/editar dados
   - Criar conta e migrar

2. **Banner Behavior**
   - Exibição na página login
   - Fechar e não mostrar novamente
   - Reabrir em nova sessão

## Implementation Details

### Zustand Store Modifications

Os stores existentes serão modificados para suportar dual-mode através de um adapter pattern:

```typescript
// Exemplo: saudeStore.ts
const dataProvider = isDemoMode() 
  ? localStorageProvider 
  : supabaseProvider

// As operações permanecem iguais
adicionarMedicamento: async (medicamento) => {
  const novoMedicamento = await dataProvider.add('saude_medicamentos', medicamento)
  set(state => ({
    medicamentos: [novoMedicamento, ...state.medicamentos]
  }))
}
```

### AuthContext Modifications

O AuthContext será modificado para reconhecer modo demo:

```typescript
// Novo estado
const [isDemoMode, setIsDemoMode] = useState(false)

// Novo método
const activateDemoMode = () => {
  setIsDemoMode(true)
  localStorage.setItem('demo_mode_config', JSON.stringify({
    enabled: true,
    activatedAt: new Date().toISOString(),
    dataVersion: '1.0'
  }))
  router.push('/')
}
```

### Middleware Modifications

O middleware será atualizado para permitir acesso em modo demo:

```typescript
// middleware.ts
const isDemoMode = request.cookies.get('demo_mode')?.value === 'true'

if (!session && !isDemoMode) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

### Data Seeding Strategy

Dados demo serão gerados na primeira ativação:

```typescript
const seedDemoData = () => {
  const generator = new DemoDataGenerator()
  const demoData = generator.generateAllData()
  
  localStorage.setItem('demo_data', JSON.stringify(demoData))
}
```

**Dados Incluídos** (7 dias de histórico):
- 15-20 prioridades (mix de concluídas e pendentes)
- 2-3 medicamentos com tomadas registradas
- 7 registros de humor (variados)
- 21 refeições (3 por dia)
- 7 registros de hidratação
- 7 registros de sono
- 5-7 registros de estudo
- 10-15 transações financeiras
- 2-3 hiperfocos ativos
- 3-5 atividades de lazer

## Security Considerations

1. **Sem Dados Sensíveis**
   - Dados demo são genéricos e não-sensíveis
   - Nenhuma informação pessoal real

2. **Isolamento de Dados**
   - Dados demo completamente separados de dados reais
   - Limpeza completa ao sair do modo demo

3. **Migração Segura**
   - Validação de dados antes de migração
   - Sanitização de inputs
   - Transação atômica

4. **Rate Limiting**
   - Limitar criação de contas demo (se necessário)
   - Prevenir abuso do sistema

## Performance Considerations

1. **Local Storage Size**
   - Monitorar tamanho dos dados
   - Limite de ~5MB para dados demo
   - Alertar usuário se aproximando do limite

2. **Data Loading**
   - Lazy loading de dados demo
   - Cache em memória após primeira carga
   - Debounce de operações de escrita

3. **Migration Performance**
   - Batch inserts no Supabase
   - Progress indicator para usuário
   - Timeout handling

## Accessibility

1. **Banner**
   - ARIA labels apropriados
   - Keyboard navigation
   - Screen reader friendly

2. **Indicator**
   - Alto contraste
   - Texto legível
   - Posicionamento não intrusivo

3. **Migration Dialog**
   - Focus management
   - Escape key para fechar
   - Clear action buttons

## Future Enhancements

1. **Dados Demo Personalizados**
   - Permitir usuário escolher tipo de dados (estudante, profissional, etc.)

2. **Compartilhamento de Sessão Demo**
   - Gerar link para compartilhar sessão demo específica

3. **Analytics de Demo**
   - Rastrear quais features são mais usadas no demo
   - Taxa de conversão demo → cadastro

4. **Demo Guiado**
   - Tour interativo das funcionalidades
   - Tooltips contextuais

5. **Exportação de Dados Demo**
   - Permitir download dos dados demo em JSON
   - Importação posterior após criar conta
