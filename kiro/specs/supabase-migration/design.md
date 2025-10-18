# Design Document - Supabase Migration

## Overview

This design document outlines the technical architecture for migrating StayFocus from a localStorage/Google Drive architecture to Supabase. The migration will be executed in phases to minimize risk and ensure data integrity throughout the process.

### Migration Strategy

The migration follows a **phased rollout approach** with feature flags, allowing for:
- Gradual migration of stores and components
- Parallel operation of old and new systems during transition
- Quick rollback capability if issues arise
- User-by-user data migration on first login

### Key Design Principles

1. **Zero Data Loss**: All existing user data must be preserved and migrated
2. **Minimal Downtime**: Application remains functional throughout migration
3. **Security First**: RLS policies protect all user data from unauthorized access
4. **Performance**: Optimize queries and use caching to maintain responsiveness
5. **Maintainability**: Clean separation of concerns with clear data access patterns

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│                                                               │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Pages (21)    │  │ Components   │  │  Zustand Stores │ │
│  │  - Dashboard   │  │ - UI         │  │  (18 stores)    │ │
│  │  - Financas    │  │ - Features   │  │                 │ │
│  │  - Estudos     │  │ - Layout     │  │                 │ │
│  │  - etc.        │  │              │  │                 │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│           │                  │                    │          │
│           └──────────────────┴────────────────────┘          │
│                              │                               │
│                    ┌─────────▼──────────┐                   │
│                    │   Auth Context     │                   │
│                    │   - useAuth()      │                   │
│                    │   - User Session   │                   │
│                    └─────────┬──────────┘                   │
│                              │                               │
│                    ┌─────────▼──────────┐                   │
│                    │  Supabase Client   │                   │
│                    │  - Auth            │                   │
│                    │  - Database        │                   │
│                    │  - Storage         │                   │
│                    │  - Realtime        │                   │
│                    └─────────┬──────────┘                   │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               │ HTTPS
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      Supabase Backend                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Supabase     │  │ PostgreSQL   │  │ Supabase Storage │  │
│  │ Auth         │  │ Database     │  │                  │  │
│  │              │  │ - 18 Tables  │  │ - user-photos    │  │
│  │ - Email/Pass │  │ - RLS        │  │ - user-backups   │  │
│  │ - Google     │  │ - Triggers   │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Supabase Realtime                         │   │
│  │            - WebSocket Connections                   │   │
│  │            - Change Data Capture                     │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```


## Components and Interfaces

### 1. Authentication Layer

#### AuthContext (`app/contexts/AuthContext.tsx`)

**Purpose**: Centralized authentication state management and user session handling.

**Interface**:
```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}
```

**Key Responsibilities**:
- Manage authentication state (user, session, loading)
- Provide authentication methods (login, signup, logout)
- Listen to auth state changes via Supabase
- Trigger store data loading on authentication
- Clean up subscriptions on logout

**Implementation Details**:
- Uses `@supabase/auth-helpers-nextjs` for Next.js integration
- Subscribes to `onAuthStateChange` for real-time auth updates
- Stores session in HTTP-only cookies (handled by auth helpers)
- Provides context to entire application via Provider pattern

#### Middleware (`middleware.ts`)

**Purpose**: Protect routes and manage authentication at the edge.

**Key Responsibilities**:
- Verify session on every request
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login` and `/registro`
- Refresh expired tokens automatically

**Route Protection**:
- Public routes: `/login`, `/registro`, `/auth/callback`
- Protected routes: All other routes
- Static assets: Excluded from middleware


### 2. Data Access Layer

#### Supabase Client (`app/lib/supabase/client.ts`)

**Purpose**: Provide configured Supabase clients for different contexts.

**Exports**:
```typescript
// For client components
export const createSupabaseClient = () => createClientComponentClient()

// For server-side operations (API routes, server actions)
export const createSupabaseServerClient = () => createClient(url, serviceKey)
```

**Configuration**:
- Uses environment variables for URL and keys
- Client-side: Uses anon key (RLS enforced)
- Server-side: Uses service role key (bypasses RLS when needed)

#### Supabase Server (`app/lib/supabase/server.ts`)

**Purpose**: Server component client creation.

**Export**:
```typescript
export const createSupabaseServerComponent = () => 
  createServerComponentClient({ cookies })
```

**Usage**: For Next.js Server Components that need database access

#### Sync Manager (`app/lib/supabase/sync.ts`)

**Purpose**: Manage real-time subscriptions and synchronization.

**Interface**:
```typescript
class SupabaseSync {
  subscribe<T>(
    table: string,
    onInsert?: (payload: T) => void,
    onUpdate?: (payload: T) => void,
    onDelete?: (payload: { id: string }) => void
  ): () => void
  
  unsubscribe(table: string): void
  unsubscribeAll(): void
}
```

**Key Features**:
- Manages WebSocket connections to Supabase Realtime
- Provides typed callbacks for INSERT, UPDATE, DELETE events
- Handles subscription cleanup
- Prevents duplicate subscriptions

**Usage Pattern**:
```typescript
// In a store or component
useEffect(() => {
  const cleanup = supabaseSync.subscribe(
    'financas_transacoes',
    (newTransaction) => addTransaction(newTransaction),
    (updatedTransaction) => updateTransaction(updatedTransaction),
    (deleted) => removeTransaction(deleted.id)
  )
  
  return cleanup
}, [])
```


#### Storage Helper (`app/lib/supabase/storage.ts`)

**Purpose**: Simplify file upload/delete operations.

**Interface**:
```typescript
export async function uploadPhoto(
  userId: string,
  file: File,
  bucket?: string
): Promise<string | null>

export async function deletePhoto(
  url: string,
  bucket?: string
): Promise<boolean>
```

**Key Features**:
- Generates unique filenames with timestamps
- Organizes files by user_id
- Returns public URLs for stored files
- Handles errors gracefully
- Supports multiple buckets

**File Organization**:
```
user-photos/
  ├── {user_id_1}/
  │   ├── 1634567890123.jpg
  │   └── 1634567891456.png
  └── {user_id_2}/
      └── 1634567892789.jpg
```

### 3. Store Layer

#### Store Architecture Pattern

All 18 Zustand stores will follow a consistent pattern:

**Structure**:
```typescript
interface StoreState {
  // Data
  items: Item[]
  
  // UI State
  loading: boolean
  error: string | null
  
  // Actions
  loadData: (userId: string) => Promise<void>
  addItem: (item: Omit<Item, 'id'>) => Promise<void>
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  
  // Real-time
  setupRealtimeSync: (userId: string) => () => void
}
```

**Implementation Pattern**:
```typescript
export const useExampleStore = create<StoreState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  
  loadData: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ items: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  addItem: async (item) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data, error } = await supabase
      .from('table_name')
      .insert({ ...item, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    set(state => ({ items: [data, ...state.items] }))
  },
  
  // ... other actions
  
  setupRealtimeSync: (userId: string) => {
    return supabaseSync.subscribe(
      'table_name',
      (newItem) => set(state => ({ items: [newItem, ...state.items] })),
      (updated) => set(state => ({
        items: state.items.map(item => 
          item.id === updated.id ? updated : item
        )
      })),
      (deleted) => set(state => ({
        items: state.items.filter(item => item.id !== deleted.id)
      }))
    )
  }
}))
```

**Key Design Decisions**:
- Optimistic updates: Update UI immediately, rollback on error
- Error handling: Capture and expose errors to UI
- Loading states: Track loading for better UX
- Real-time: Separate setup method for subscription management


#### Store-to-Table Mapping

| Store | Primary Table(s) | Special Considerations |
|-------|------------------|------------------------|
| perfilStore | users_profile, preferencias_visuais, metas_diarias | Multiple tables, single user record |
| financasStore | financas_categorias, financas_transacoes, financas_envelopes, financas_pagamentos_recorrentes | Complex relationships, aggregations |
| alimentacaoStore | alimentacao_refeicoes | File uploads (photos) |
| sonoStore | sono_registros | Date-based queries, analytics |
| registroEstudosStore | estudos_registros | Array fields (topicos) |
| concursosStore | estudos_concursos | Array fields (disciplinas) |
| questoesStore | estudos_questoes | JSONB (alternativas), foreign keys |
| simuladoStore | estudos_simulados | Array of IDs, complex queries |
| historicoSimuladosStore | estudos_simulados | Read-only view, analytics |
| hiperfocosStore | hiperfocos | Status management |
| autoconhecimentoStore | autoconhecimento_registros | Array fields (gatilhos), type filtering |
| atividadesStore | atividades | Category filtering |
| pomodoroStore | pomodoro_sessoes | Auto-creation, time tracking |
| prioridadesStore | prioridades | Date-based, completion tracking |
| receitasStore | receitas, lista_compras | JSONB (ingredientes), file uploads |
| painelDiaStore | Aggregates from multiple tables | Read-only, computed data |
| dataTransferStore | All tables | Export/import functionality |
| sugestoesStore | Client-side only | No database persistence |

### 4. Component Layer

#### Component Update Pattern

All components will be updated to:

1. **Use Auth Context**:
```typescript
const { user, loading: authLoading } = useAuth()
```

2. **Load Data on Mount**:
```typescript
useEffect(() => {
  if (user) {
    loadData(user.id)
  }
}, [user])
```

3. **Handle Loading States**:
```typescript
if (authLoading || loading) {
  return <LoadingSpinner />
}
```

4. **Handle Errors**:
```typescript
if (error) {
  return <ErrorMessage message={error} onRetry={() => loadData(user.id)} />
}
```

5. **Setup Real-time Sync**:
```typescript
useEffect(() => {
  if (user) {
    const cleanup = setupRealtimeSync(user.id)
    return cleanup
  }
}, [user])
```

#### New Shared Components

**LoadingSpinner** (`app/components/common/LoadingSpinner.tsx`):
- Consistent loading indicator across app
- Supports different sizes and colors
- Accessible with ARIA labels

**ErrorMessage** (`app/components/common/ErrorMessage.tsx`):
- User-friendly error display
- Retry button
- Error details in development mode

**EmptyState** (`app/components/common/EmptyState.tsx`):
- Consistent empty state messaging
- Call-to-action buttons
- Illustrations/icons


## Data Models

### Database Schema Design Principles

1. **Normalization**: Reduce data redundancy through proper table relationships
2. **User Isolation**: Every table includes `user_id` for RLS
3. **Soft Deletes**: Consider adding `deleted_at` for important data
4. **Timestamps**: All tables have `created_at`, many have `updated_at`
5. **Type Safety**: Use CHECK constraints and ENUM-like constraints
6. **Flexibility**: Use JSONB for semi-structured data, arrays for lists

### Core Tables

#### Authentication & Profile

**users_profile**
```sql
CREATE TABLE users_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT DEFAULT 'Usuário',
  notificacoes_ativas BOOLEAN DEFAULT true,
  pausas_ativas BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_profile_user_id ON users_profile(user_id);
```

**preferencias_visuais**
```sql
CREATE TABLE preferencias_visuais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  alto_contraste BOOLEAN DEFAULT false,
  reducao_estimulos BOOLEAN DEFAULT false,
  texto_grande BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preferencias_user_id ON preferencias_visuais(user_id);
```

**metas_diarias**
```sql
CREATE TABLE metas_diarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  horas_sono INTEGER DEFAULT 8 CHECK (horas_sono >= 0 AND horas_sono <= 24),
  tarefas_prioritarias INTEGER DEFAULT 3 CHECK (tarefas_prioritarias >= 0),
  copos_agua INTEGER DEFAULT 8 CHECK (copos_agua >= 0),
  pausas_programadas INTEGER DEFAULT 4 CHECK (pausas_programadas >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metas_user_id ON metas_diarias(user_id);
```

#### Financial Management

**financas_categorias**
```sql
CREATE TABLE financas_categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL,
  icone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financas_categorias_user_id ON financas_categorias(user_id);
```

**financas_transacoes**
```sql
CREATE TABLE financas_transacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id UUID REFERENCES financas_categorias(id) ON DELETE SET NULL,
  tipo TEXT CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financas_transacoes_user_id ON financas_transacoes(user_id);
CREATE INDEX idx_financas_transacoes_data ON financas_transacoes(data);
CREATE INDEX idx_financas_transacoes_categoria ON financas_transacoes(categoria_id);
```

**financas_envelopes**
```sql
CREATE TABLE financas_envelopes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL,
  valor_alocado DECIMAL(10,2) DEFAULT 0 CHECK (valor_alocado >= 0),
  valor_utilizado DECIMAL(10,2) DEFAULT 0 CHECK (valor_utilizado >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financas_envelopes_user_id ON financas_envelopes(user_id);
```

**financas_pagamentos_recorrentes**
```sql
CREATE TABLE financas_pagamentos_recorrentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento TEXT NOT NULL,
  categoria_id UUID REFERENCES financas_categorias(id) ON DELETE SET NULL,
  proximo_pagamento DATE,
  pago BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financas_pagamentos_user_id ON financas_pagamentos_recorrentes(user_id);
CREATE INDEX idx_financas_pagamentos_proximo ON financas_pagamentos_recorrentes(proximo_pagamento);
```


#### Health & Wellness

**alimentacao_refeicoes**
```sql
CREATE TABLE alimentacao_refeicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora TEXT NOT NULL,
  descricao TEXT NOT NULL,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alimentacao_user_id ON alimentacao_refeicoes(user_id);
CREATE INDEX idx_alimentacao_data ON alimentacao_refeicoes(data);
```

**sono_registros**
```sql
CREATE TABLE sono_registros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_dormir TEXT,
  hora_acordar TEXT,
  qualidade INTEGER CHECK (qualidade >= 1 AND qualidade <= 5),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sono_user_id ON sono_registros(user_id);
CREATE INDEX idx_sono_data ON sono_registros(data);
CREATE UNIQUE INDEX idx_sono_user_data ON sono_registros(user_id, data);
```

**autoconhecimento_registros**
```sql
CREATE TABLE autoconhecimento_registros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('humor', 'energia', 'ansiedade')),
  nivel INTEGER CHECK (nivel >= 1 AND nivel <= 5),
  gatilhos TEXT[],
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_autoconhecimento_user_id ON autoconhecimento_registros(user_id);
CREATE INDEX idx_autoconhecimento_data ON autoconhecimento_registros(data);
CREATE INDEX idx_autoconhecimento_tipo ON autoconhecimento_registros(tipo);
```

#### Study Management

**estudos_registros**
```sql
CREATE TABLE estudos_registros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  disciplina TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
  topicos TEXT[],
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estudos_registros_user_id ON estudos_registros(user_id);
CREATE INDEX idx_estudos_registros_data ON estudos_registros(data);
CREATE INDEX idx_estudos_registros_disciplina ON estudos_registros(disciplina);
```

**estudos_concursos**
```sql
CREATE TABLE estudos_concursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_prova DATE,
  instituicao TEXT,
  cargo TEXT,
  disciplinas TEXT[],
  status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estudos_concursos_user_id ON estudos_concursos(user_id);
CREATE INDEX idx_estudos_concursos_status ON estudos_concursos(status);
CREATE INDEX idx_estudos_concursos_data_prova ON estudos_concursos(data_prova);
```

**estudos_questoes**
```sql
CREATE TABLE estudos_questoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_id UUID REFERENCES estudos_concursos(id) ON DELETE CASCADE,
  disciplina TEXT NOT NULL,
  enunciado TEXT NOT NULL,
  alternativas JSONB NOT NULL,
  resposta_correta TEXT NOT NULL,
  explicacao TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estudos_questoes_user_id ON estudos_questoes(user_id);
CREATE INDEX idx_estudos_questoes_concurso ON estudos_questoes(concurso_id);
CREATE INDEX idx_estudos_questoes_disciplina ON estudos_questoes(disciplina);
CREATE INDEX idx_estudos_questoes_tags ON estudos_questoes USING GIN(tags);
```

**estudos_simulados**
```sql
CREATE TABLE estudos_simulados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concurso_id UUID REFERENCES estudos_concursos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  questoes_ids UUID[],
  data_realizacao TIMESTAMPTZ,
  tempo_limite_minutos INTEGER,
  acertos INTEGER,
  total_questoes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estudos_simulados_user_id ON estudos_simulados(user_id);
CREATE INDEX idx_estudos_simulados_concurso ON estudos_simulados(concurso_id);
CREATE INDEX idx_estudos_simulados_data ON estudos_simulados(data_realizacao);
```


#### Productivity & Activities

**hiperfocos**
```sql
CREATE TABLE hiperfocos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  intensidade INTEGER CHECK (intensidade >= 1 AND intensidade <= 5),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'concluido')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hiperfocos_user_id ON hiperfocos(user_id);
CREATE INDEX idx_hiperfocos_status ON hiperfocos(status);
CREATE INDEX idx_hiperfocos_data_inicio ON hiperfocos(data_inicio);
```

**atividades**
```sql
CREATE TABLE atividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('lazer', 'saude', 'social')),
  duracao_minutos INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_atividades_user_id ON atividades(user_id);
CREATE INDEX idx_atividades_data ON atividades(data);
CREATE INDEX idx_atividades_categoria ON atividades(categoria);
```

**pomodoro_sessoes**
```sql
CREATE TABLE pomodoro_sessoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data TIMESTAMPTZ NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  tipo TEXT CHECK (tipo IN ('foco', 'pausa')) NOT NULL,
  tarefa TEXT,
  concluida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pomodoro_user_id ON pomodoro_sessoes(user_id);
CREATE INDEX idx_pomodoro_data ON pomodoro_sessoes(data);
CREATE INDEX idx_pomodoro_tipo ON pomodoro_sessoes(tipo);
```

**prioridades**
```sql
CREATE TABLE prioridades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  nivel_prioridade INTEGER CHECK (nivel_prioridade >= 1 AND nivel_prioridade <= 3),
  concluida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prioridades_user_id ON prioridades(user_id);
CREATE INDEX idx_prioridades_data ON prioridades(data);
CREATE INDEX idx_prioridades_nivel ON prioridades(nivel_prioridade);
CREATE INDEX idx_prioridades_concluida ON prioridades(concluida);
```

#### Recipes & Shopping

**receitas**
```sql
CREATE TABLE receitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  ingredientes JSONB NOT NULL,
  modo_preparo TEXT NOT NULL,
  tempo_preparo_minutos INTEGER,
  porcoes INTEGER,
  categoria TEXT,
  foto_url TEXT,
  favorita BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receitas_user_id ON receitas(user_id);
CREATE INDEX idx_receitas_categoria ON receitas(categoria);
CREATE INDEX idx_receitas_favorita ON receitas(favorita);
CREATE INDEX idx_receitas_ingredientes ON receitas USING GIN(ingredientes);
```

**lista_compras**
```sql
CREATE TABLE lista_compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantidade TEXT,
  categoria TEXT,
  comprado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lista_compras_user_id ON lista_compras(user_id);
CREATE INDEX idx_lista_compras_comprado ON lista_compras(comprado);
```

### Data Type Decisions

**JSONB vs Separate Tables**:
- Use JSONB for: Semi-structured data that varies (ingredientes, alternativas)
- Use separate tables for: Structured relationships (categorias, concursos)

**Arrays vs Junction Tables**:
- Use arrays for: Simple lists without relationships (disciplinas, tags, topicos)
- Use junction tables for: Many-to-many with metadata

**TEXT vs VARCHAR**:
- Use TEXT for: All string fields (PostgreSQL optimizes internally)
- Avoid VARCHAR unless specific length constraint needed

**TIMESTAMPTZ vs TIMESTAMP**:
- Use TIMESTAMPTZ for: All timestamps (timezone-aware)
- Use DATE for: Date-only fields (data, data_prova)
- Use TEXT for: Time-only fields (hora, hora_dormir) - allows flexible formats


## Error Handling

### Error Handling Strategy

#### 1. Database Errors

**Constraint Violations**:
```typescript
try {
  await supabase.from('table').insert(data)
} catch (error) {
  if (error.code === '23505') {
    // Unique constraint violation
    return { error: 'Este item já existe' }
  }
  if (error.code === '23503') {
    // Foreign key violation
    return { error: 'Referência inválida' }
  }
  if (error.code === '23514') {
    // Check constraint violation
    return { error: 'Valor fora do intervalo permitido' }
  }
  return { error: 'Erro ao salvar dados' }
}
```

**RLS Policy Violations**:
```typescript
// Returns empty result set, not an error
const { data, error } = await supabase.from('table').select()
// data will be [] if RLS blocks access
```

#### 2. Authentication Errors

**Session Expiration**:
```typescript
// Handled automatically by auth helpers
// Middleware refreshes tokens
// If refresh fails, redirect to login
```

**Invalid Credentials**:
```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) {
  if (error.message.includes('Invalid')) {
    return 'Email ou senha incorretos'
  }
  return 'Erro ao fazer login'
}
```

#### 3. Network Errors

**Offline Detection**:
```typescript
if (!navigator.onLine) {
  return { error: 'Sem conexão com a internet' }
}
```

**Timeout Handling**:
```typescript
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 10000)
)

try {
  await Promise.race([supabaseOperation(), timeout])
} catch (error) {
  if (error.message === 'Timeout') {
    return { error: 'Operação demorou muito. Tente novamente.' }
  }
}
```

#### 4. Storage Errors

**Upload Failures**:
```typescript
const { error } = await supabase.storage.from('bucket').upload(path, file)
if (error) {
  if (error.message.includes('size')) {
    return 'Arquivo muito grande (máximo 5MB)'
  }
  if (error.message.includes('type')) {
    return 'Tipo de arquivo não permitido'
  }
  return 'Erro ao fazer upload'
}
```

### Error Logging

**Development**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.error('Detailed error:', error)
}
```

**Production**:
```typescript
// Send to monitoring service (Sentry, LogRocket, etc.)
if (process.env.NODE_ENV === 'production') {
  errorMonitoring.captureException(error, {
    user: user?.id,
    context: 'store_action',
    extra: { action: 'addTransaction', data }
  })
}
```


## Testing Strategy

### Testing Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /--------\
                /          \
               / Integration \
              /--------------\
             /                \
            /   Unit Tests     \
           /____________________\
```

### 1. Unit Tests

**What to Test**:
- Store actions (add, update, delete)
- Data transformations
- Utility functions
- Error handling logic

**Tools**:
- Jest
- @testing-library/react
- Mock Supabase client

**Example**:
```typescript
describe('financasStore', () => {
  it('should add transaction', async () => {
    const mockSupabase = createMockSupabase()
    const { result } = renderHook(() => useFinancasStore())
    
    await act(async () => {
      await result.current.addTransaction({
        data: '2024-01-01',
        valor: 100,
        descricao: 'Test',
        tipo: 'receita'
      })
    })
    
    expect(result.current.transacoes).toHaveLength(1)
  })
})
```

### 2. Integration Tests

**What to Test**:
- Component + Store interactions
- Auth flow
- Real-time sync
- File uploads

**Tools**:
- Playwright or Cypress
- Supabase local development

**Example**:
```typescript
test('user can add and see transaction', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')
  
  await page.goto('/financas')
  await page.click('button:has-text("Adicionar")')
  await page.fill('[name=descricao]', 'Salário')
  await page.fill('[name=valor]', '5000')
  await page.click('button:has-text("Salvar")')
  
  await expect(page.locator('text=Salário')).toBeVisible()
})
```

### 3. E2E Tests

**What to Test**:
- Critical user journeys
- Multi-device sync
- Data migration
- Error recovery

**Scenarios**:
1. New user signup → complete onboarding → add data
2. Existing user login → view data → sync across devices
3. User adds transaction → sees in dashboard → views in reports
4. User uploads photo → deletes meal → photo is removed

### 4. Manual Testing Checklist

See the comprehensive testing plan in the migration document (migração.md) covering:
- Authentication (email/password + Google OAuth)
- All 18 stores and their CRUD operations
- Real-time synchronization
- RLS security
- Performance
- Error handling


## Migration Strategy

### Phase 0: Preparation (Before Code Changes)

**Supabase Setup**:
1. Create Supabase project
2. Configure Google OAuth provider
3. Set up environment variables
4. Create database schema
5. Apply RLS policies
6. Create storage buckets
7. Test database connection

**Documentation**:
1. Update README with setup instructions
2. Create .env.example with all required variables
3. Document migration process for users

### Phase 1: Foundation (Week 1)

**Goals**:
- Set up authentication
- Create base infrastructure
- No user-facing changes yet

**Tasks**:
1. Install Supabase dependencies
2. Create Supabase client utilities
3. Implement AuthContext
4. Create middleware for route protection
5. Build login and registration pages
6. Create shared components (Loading, Error, Empty)

**Validation**:
- Can create account with email/password
- Can login with Google OAuth
- Session persists across refreshes
- Protected routes redirect to login

### Phase 2: Core Stores (Week 2-3)

**Goals**:
- Migrate simplest stores first
- Establish patterns
- Build confidence

**Order** (simple → complex):
1. perfilStore (single user, multiple tables)
2. prioridadesStore (simple CRUD)
3. sonoStore (simple with date queries)
4. atividadesStore (simple with categories)
5. pomodoroStore (auto-creation)

**For Each Store**:
1. Create/verify database tables
2. Refactor store to use Supabase
3. Update related components
4. Test CRUD operations
5. Implement real-time sync
6. Update related pages

**Validation**:
- All CRUD operations work
- Data persists across sessions
- Real-time sync works
- No localStorage dependencies

### Phase 3: Complex Stores (Week 4-5)

**Goals**:
- Migrate stores with relationships
- Handle file uploads
- Manage complex queries

**Order**:
1. financasStore (multiple tables, relationships)
2. alimentacaoStore (file uploads)
3. receitasStore (JSONB, file uploads)
4. autoconhecimentoStore (arrays, type filtering)
5. hiperfocosStore (status management)

**Validation**:
- Foreign keys work correctly
- File uploads and deletes work
- JSONB queries work
- Array operations work
- Aggregations are correct

### Phase 4: Study System (Week 6)

**Goals**:
- Migrate interconnected study stores
- Handle complex relationships

**Order**:
1. concursosStore
2. questoesStore (depends on concursos)
3. registroEstudosStore
4. simuladoStore (depends on questoes)
5. historicoSimuladosStore (read-only view)

**Validation**:
- Concurso → Questões relationship works
- Simulado → Questões relationship works
- JSONB alternativas work
- Array operations work
- Statistics calculations correct

### Phase 5: Special Cases (Week 7)

**Goals**:
- Handle edge cases
- Migrate utility stores

**Stores**:
1. painelDiaStore (aggregation from multiple tables)
2. dataTransferStore (export/import)
3. sugestoesStore (client-side only, may not need migration)

**Validation**:
- Dashboard aggregations correct
- Export includes all data
- Import creates correct records

### Phase 6: Data Migration Tool (Week 8)

**Goals**:
- Build tool to migrate existing user data
- Test with real localStorage data

**Features**:
1. Detect localStorage data
2. Prompt user for migration
3. Transform data to Supabase format
4. Handle errors gracefully
5. Verify migration success
6. Clear localStorage after success

**Implementation**:
```typescript
// app/lib/migration/migrateFromLocalStorage.ts
export async function migrateUserData(userId: string) {
  const stores = [
    'perfil-storage',
    'financas-storage',
    // ... all store keys
  ]
  
  for (const storeKey of stores) {
    const data = localStorage.getItem(storeKey)
    if (!data) continue
    
    try {
      const parsed = JSON.parse(data)
      await migrateStore(storeKey, parsed, userId)
    } catch (error) {
      console.error(`Failed to migrate ${storeKey}:`, error)
      throw error
    }
  }
  
  // Clear localStorage after successful migration
  stores.forEach(key => localStorage.removeItem(key))
}
```

**Validation**:
- All localStorage data migrated
- Relationships preserved
- No data loss
- User can continue using app

### Phase 7: Testing & Refinement (Week 9)

**Goals**:
- Comprehensive testing
- Performance optimization
- Bug fixes

**Activities**:
1. Run full test suite
2. Manual testing of all features
3. Multi-device sync testing
4. Performance profiling
5. Security audit
6. Fix identified issues

### Phase 8: Deployment (Week 10)

**Goals**:
- Deploy to production
- Monitor for issues
- Support users

**Steps**:
1. Deploy to staging environment
2. Test with production-like data
3. Create rollback plan
4. Deploy to production
5. Monitor error rates
6. Monitor performance
7. Gather user feedback

**Rollback Plan**:
- Keep feature flag to switch back to localStorage
- Maintain localStorage code for 2 weeks
- Can revert with environment variable change


## Performance Considerations

### Query Optimization

**1. Select Only Needed Columns**:
```typescript
// Bad
const { data } = await supabase.from('receitas').select('*')

// Good
const { data } = await supabase.from('receitas').select('id, titulo, categoria, favorita')
```

**2. Use Indexes**:
- All foreign keys have indexes
- Date columns used in queries have indexes
- Frequently filtered columns have indexes
- GIN indexes for JSONB and array columns

**3. Pagination**:
```typescript
const { data } = await supabase
  .from('financas_transacoes')
  .select('*')
  .range(0, 49) // First 50 items
  .order('data', { ascending: false })
```

**4. Aggregations in Database**:
```typescript
// Bad - fetch all and calculate in JS
const { data } = await supabase.from('financas_transacoes').select('*')
const total = data.reduce((sum, t) => sum + t.valor, 0)

// Good - use database aggregation
const { data } = await supabase
  .from('financas_transacoes')
  .select('valor.sum()')
```

### Caching Strategy

**1. Zustand Store as Cache**:
- Store fetched data in memory
- Only refetch when necessary
- Use real-time to keep cache fresh

**2. React Query (Optional Enhancement)**:
```typescript
// Could add React Query for advanced caching
const { data, isLoading } = useQuery(
  ['transacoes', userId],
  () => fetchTransacoes(userId),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  }
)
```

**3. Supabase Client Cache**:
- Supabase client caches auth session
- Reuses connections

### Real-time Optimization

**1. Limit Subscriptions**:
- Only subscribe to tables actively displayed
- Unsubscribe when component unmounts
- Use single channel per table

**2. Debounce Updates**:
```typescript
const debouncedUpdate = debounce(async (data) => {
  await supabase.from('table').update(data)
}, 500)
```

**3. Batch Operations**:
```typescript
// Bad - multiple inserts
for (const item of items) {
  await supabase.from('table').insert(item)
}

// Good - single batch insert
await supabase.from('table').insert(items)
```

### Image Optimization

**1. Resize Before Upload**:
```typescript
async function resizeImage(file: File): Promise<File> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const maxWidth = 1200
  const scale = maxWidth / img.width
  canvas.width = maxWidth
  canvas.height = img.height * scale
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], file.name, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.85)
  })
}
```

**2. Lazy Load Images**:
```typescript
<img 
  src={photoUrl} 
  loading="lazy" 
  alt="Refeição"
/>
```

### Bundle Size

**1. Code Splitting**:
```typescript
// Lazy load heavy components
const SimuladoPage = lazy(() => import('./estudos/simulado/page'))
```

**2. Tree Shaking**:
- Import only needed Supabase functions
- Use named imports

**3. Analyze Bundle**:
```bash
npm run build
npm run analyze
```


## Security Considerations

### Row Level Security (RLS)

**Policy Template for All Tables**:
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);
```

**Storage RLS**:
```sql
-- Users can only access their own folder
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Authentication Security

**1. Password Requirements**:
- Minimum 6 characters (Supabase default)
- Consider increasing to 8+ for better security
- Email confirmation required

**2. Session Management**:
- HTTP-only cookies (handled by auth helpers)
- Automatic token refresh
- Secure flag in production (HTTPS only)

**3. OAuth Security**:
- Use state parameter (handled by Supabase)
- Verify redirect URLs
- Limit OAuth scopes to minimum needed

### API Security

**1. Environment Variables**:
```bash
# Never commit these
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-side only
```

**2. Rate Limiting**:
- Supabase provides built-in rate limiting
- Monitor usage in dashboard
- Implement client-side debouncing

**3. Input Validation**:
```typescript
// Validate before sending to Supabase
function validateTransaction(data: any) {
  if (!data.descricao || data.descricao.length > 200) {
    throw new Error('Descrição inválida')
  }
  if (typeof data.valor !== 'number' || data.valor <= 0) {
    throw new Error('Valor inválido')
  }
  // ... more validations
}
```

### Data Privacy (LGPD Compliance)

**1. Data Collection**:
- Only collect necessary data
- Inform users about data usage
- Get consent for optional features

**2. Data Access**:
- Users can export their data (dataTransferStore)
- Users can delete their account
- Cascade deletes remove all user data

**3. Data Retention**:
- No automatic deletion (user controls their data)
- Soft deletes for important data (optional)
- Backup retention policy

**4. Data Sharing**:
- No data shared with third parties
- Google OAuth only for authentication
- Supabase as data processor

### SQL Injection Prevention

**Supabase Client Handles This**:
```typescript
// Safe - parameterized query
await supabase
  .from('table')
  .select()
  .eq('user_id', userId)

// Never do this (but Supabase doesn't allow raw SQL from client anyway)
// await supabase.rpc('raw_sql', { query: `SELECT * FROM table WHERE id = ${id}` })
```

### XSS Prevention

**1. React Escapes by Default**:
```typescript
// Safe
<div>{userInput}</div>

// Dangerous - avoid
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**2. Sanitize Rich Text** (if needed):
```typescript
import DOMPurify from 'dompurify'

const clean = DOMPurify.sanitize(userInput)
```


## Monitoring and Observability

### Metrics to Track

**1. Performance Metrics**:
- Page load time
- Time to first byte (TTFB)
- Database query duration
- Real-time message latency

**2. Error Metrics**:
- Error rate by type
- Failed authentication attempts
- Failed database operations
- Failed file uploads

**3. Usage Metrics**:
- Active users
- Database size
- Storage usage
- API request count

### Logging Strategy

**Development**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Query:', { table, filter, result })
}
```

**Production**:
```typescript
// Use structured logging
logger.info('user_action', {
  userId: user.id,
  action: 'add_transaction',
  success: true,
  duration: 150
})
```

### Error Monitoring

**Recommended Tools**:
- Sentry (error tracking)
- LogRocket (session replay)
- Vercel Analytics (if deployed on Vercel)

**Setup Example**:
```typescript
// app/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies
    }
    return event
  }
})
```

### Supabase Dashboard

**Monitor**:
- Database size and growth
- Query performance
- Auth metrics
- Storage usage
- API usage and rate limits

**Alerts**:
- Set up alerts for:
  - High error rates
  - Approaching storage limits
  - Unusual traffic patterns
  - Failed authentication attempts


## Deployment Strategy

### Environment Setup

**Development**:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Staging**:
```bash
# Vercel environment variables
NEXT_PUBLIC_SUPABASE_URL=https://staging-xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://stayfocus-staging.vercel.app
```

**Production**:
```bash
# Vercel environment variables
NEXT_PUBLIC_SUPABASE_URL=https://prod-xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://stayfocus.vercel.app
```

### Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] OAuth redirect URLs configured
- [ ] Performance benchmarks met
- [ ] Security audit completed

**Deployment**:
- [ ] Deploy to staging
- [ ] Run smoke tests on staging
- [ ] Test authentication flows
- [ ] Test data operations
- [ ] Test real-time sync
- [ ] Verify file uploads
- [ ] Check error monitoring
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Verify user access

**Post-Deployment**:
- [ ] Monitor for 24 hours
- [ ] Check error logs
- [ ] Verify user feedback
- [ ] Document any issues
- [ ] Plan fixes if needed

### Rollback Plan

**If Critical Issues Arise**:

1. **Immediate** (< 5 minutes):
   - Revert Vercel deployment to previous version
   - Users continue with old system

2. **Short-term** (< 1 hour):
   - Enable feature flag to use localStorage
   - Deploy flag change
   - Investigate issue

3. **Long-term** (if needed):
   - Fix issue in development
   - Test thoroughly
   - Redeploy when ready

**Feature Flag Implementation**:
```typescript
// app/lib/config.ts
export const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'

// In stores
if (USE_SUPABASE) {
  // Use Supabase
} else {
  // Use localStorage
}
```

### Database Migrations

**Version Control**:
```
migrations/
  ├── 001_initial_schema.sql
  ├── 002_add_indexes.sql
  ├── 003_add_rls_policies.sql
  └── 004_add_triggers.sql
```

**Apply Migrations**:
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard SQL Editor
```

**Rollback Migrations**:
```sql
-- Keep rollback scripts
-- migrations/rollback/001_initial_schema.sql
DROP TABLE IF EXISTS users_profile CASCADE;
-- ... etc
```


## Future Enhancements

### Phase 2 Features (Post-Migration)

**1. Offline Support**:
- Use Service Workers
- Cache data locally
- Sync when online
- Conflict resolution

**2. Advanced Real-time**:
- Presence (who's online)
- Collaborative editing
- Live cursors

**3. Advanced Analytics**:
- Custom dashboards
- Trend analysis
- Predictive insights
- Export reports

**4. Mobile App**:
- React Native app
- Share Supabase backend
- Offline-first architecture
- Push notifications

**5. AI Features**:
- Study recommendations
- Financial insights
- Meal suggestions
- Mood pattern analysis

**6. Social Features**:
- Share recipes
- Study groups
- Leaderboards
- Achievements

### Technical Debt to Address

**1. Type Safety**:
- Generate TypeScript types from database schema
- Use Supabase CLI: `supabase gen types typescript`

**2. Testing**:
- Increase test coverage
- Add E2E tests
- Performance testing
- Load testing

**3. Documentation**:
- API documentation
- Component storybook
- User guides
- Video tutorials

**4. Accessibility**:
- WCAG 2.1 AA compliance
- Screen reader testing
- Keyboard navigation
- Color contrast

**5. Internationalization**:
- Multi-language support
- Date/time localization
- Currency formatting

## Conclusion

This design provides a comprehensive blueprint for migrating StayFocus to Supabase. The phased approach minimizes risk while the detailed technical specifications ensure consistency across the codebase.

Key success factors:
- **Incremental migration**: One store at a time
- **Comprehensive testing**: At every phase
- **Clear rollback plan**: Safety net for issues
- **User-centric**: Minimal disruption to users
- **Security-first**: RLS protects all data
- **Performance-optimized**: Fast and responsive

The migration will transform StayFocus from a local-first app to a cloud-native application with real-time sync, robust security, and scalability for future growth.

---

**Next Steps**: Review this design document and proceed to create the implementation task list.
