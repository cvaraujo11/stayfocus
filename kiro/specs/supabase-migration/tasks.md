# Implementation Plan - Supabase Migration

## Phase 0: Supabase Setup and Configuration

- [ ] 1. Create Supabase project and configure authentication
  - Create new Supabase project at supabase.com
  - Configure Google OAuth provider with existing credentials
  - Add redirect URLs for development and production
  - Enable email/password authentication
  - Configure email templates
  - Save project URL and API keys
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Set up environment variables whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
  - Create `.env.local` file with Supabase credentials
  - Add `NEXT_PUBLIC_SUPABASE_URL`
  - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Add `SUPABASE_SERVICE_ROLE_KEY`
  - Update `.env.example` with new variables
  - Add `.env.local` to `.gitignore` if not already present
  - _Requirements: 1.1_

- [x] 3. Install Supabase dependencies
  - Run `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
  - Verify installation in `package.json`
  - _Requirements: 1.1_

## Phase 1: Database Schema Creation

- [ ] 4. Create authentication and profile tables whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
- [ ] 4.1 Create users_profile table with RLS policies
  - Write SQL for `users_profile` table with columns: id, user_id, nome, notificacoes_ativas, pausas_ativas, created_at, updated_at
  - Add foreign key to auth.users with ON DELETE CASCADE
  - Create index on user_id
  - Enable RLS on table
  - Create SELECT, INSERT, UPDATE, DELETE policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.2 Create preferencias_visuais table with RLS
  - Write SQL for table with columns: id, user_id, alto_contraste, reducao_estimulos, texto_grande, updated_at
  - Add foreign key and index
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Create metas_diarias table with RLS policies
  - Write SQL for table with columns: id, user_id, horas_sono, tarefas_prioritarias, copos_agua, pausas_programadas, updated_at
  - Add CHECK constraints for valid ranges
  - Add foreign key and index
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Create financial management tables whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
- [ ] 5.1 Create financas_categorias table with RLS policies
  - Write SQL for table with columns: id, user_id, nome, cor, icone, created_at
  - Add foreign key and index
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.2 Create financas_transacoes table with RLS policies
  - Write SQL for table with columns: id, user_id, data, valor, descricao, categoria_id, tipo, created_at
  - Add foreign key to financas_categorias with ON DELETE SET NULL
  - Add CHECK constraint for tipo (receita/despesa)
  - Create indexes on user_id, data, categoria_id
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.3 Create financas_envelopes table with RLS policies
  - Write SQL for table with columns: id, user_id, nome, cor, valor_alocado, valor_utilizado, created_at
  - Add CHECK constraints for non-negative values
  - Add foreign key and index
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.4 Create financas_pagamentos_recorrentes table with RLS policies
  - Write SQL for table with columns: id, user_id, descricao, valor, data_vencimento, categoria_id, proximo_pagamento, pago, created_at
  - Add foreign key to financas_categorias
  - Create indexes on user_id and proximo_pagamento
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_


- [ ] 6. Create health and wellness tables whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
- [ ] 6.1 Create alimentacao_refeicoes table with RLS policies
  - Write SQL for table with columns: id, user_id, data, hora, descricao, foto_url, created_at
  - Create indexes on user_id and data
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6.2 Create sono_registros table with RLS policies
  - Write SQL for table with columns: id, user_id, data, hora_dormir, hora_acordar, qualidade, observacoes, created_at
  - Add CHECK constraint for qualidade (1-5)
  - Create indexes on user_id and data
  - Create unique index on (user_id, data)
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6.3 Create autoconhecimento_registros table with RLS policies
  - Write SQL for table with columns: id, user_id, data, tipo, nivel, gatilhos (TEXT[]), observacoes, created_at
  - Add CHECK constraints for tipo (humor/energia/ansiedade) and nivel (1-5)
  - Create indexes on user_id, data, and tipo
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Create study management tables whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
- [ ] 7.1 Create estudos_registros table with RLS policies
  - Write SQL for table with columns: id, user_id, data, disciplina, duracao_minutos, topicos (TEXT[]), observacoes, created_at
  - Add CHECK constraint for duracao_minutos > 0
  - Create indexes on user_id, data, and disciplina
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7.2 Create estudos_concursos table with RLS policies
  - Write SQL for table with columns: id, user_id, nome, data_prova, instituicao, cargo, disciplinas (TEXT[]), status, created_at
  - Add CHECK constraint for status (em_andamento/concluido/cancelado)
  - Create indexes on user_id, status, and data_prova
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7.3 Create estudos_questoes table with RLS policies
  - Write SQL for table with columns: id, user_id, concurso_id, disciplina, enunciado, alternativas (JSONB), resposta_correta, explicacao, tags (TEXT[]), created_at
  - Add foreign key to estudos_concursos with ON DELETE CASCADE
  - Create indexes on user_id, concurso_id, disciplina
  - Create GIN index on tags array
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7.4 Create estudos_simulados table with RLS policies
  - Write SQL for table with columns: id, user_id, concurso_id, titulo, questoes_ids (UUID[]), data_realizacao, tempo_limite_minutos, acertos, total_questoes, created_at
  - Add foreign key to estudos_concursos with ON DELETE SET NULL
  - Create indexes on user_id, concurso_id, and data_realizacao
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Create productivity and activity tables whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
- [ ] 8.1 Create hiperfocos table with RLS policies
  - Write SQL for table with columns: id, user_id, titulo, descricao, data_inicio, data_fim, intensidade, status, created_at
  - Add CHECK constraints for intensidade (1-5) and status (ativo/pausado/concluido)
  - Create indexes on user_id, status, and data_inicio
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.2 Create atividades table with RLS policies
  - Write SQL for table with columns: id, user_id, data, titulo, categoria, duracao_minutos, observacoes, created_at
  - Add CHECK constraint for categoria (lazer/saude/social)
  - Create indexes on user_id, data, and categoria
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.3 Create pomodoro_sessoes table with RLS policies
  - Write SQL for table with columns: id, user_id, data, duracao_minutos, tipo, tarefa, concluida, created_at
  - Add CHECK constraint for tipo (foco/pausa)
  - Create indexes on user_id, data, and tipo
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.4 Create prioridades table with RLS policies
  - Write SQL for table with columns: id, user_id, data, titulo, categoria, nivel_prioridade, concluida, created_at
  - Add CHECK constraint for nivel_prioridade (1-3)
  - Create indexes on user_id, data, nivel_prioridade, and concluida
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Create recipe and shopping tables whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
- [ ] 9.1 Create receitas table with RLS policies
  - Write SQL for table with columns: id, user_id, titulo, ingredientes (JSONB), modo_preparo, tempo_preparo_minutos, porcoes, categoria, foto_url, favorita, created_at
  - Create indexes on user_id, categoria, and favorita
  - Create GIN index on ingredientes JSONB
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9.2 Create lista_compras table with RLS policies
  - Write SQL for table with columns: id, user_id, item, quantidade, categoria, comprado, created_at
  - Create indexes on user_id and comprado
  - Enable RLS and create policies
  - Execute in Supabase SQL Editor
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Create database triggers for updated_at columns whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
  - Write SQL function `update_updated_at_column()` that sets NEW.updated_at to NOW()
  - Create triggers for all tables with updated_at column
  - Execute in Supabase SQL Editor
  - Test by updating a record and verifying updated_at changes
  - _Requirements: 2.4_

- [ ] 11. Configure Supabase Storage buckets whit mcp supabase for project ID: llwcibvofptjyxxrcbvu
- [ ] 11.1 Create user-photos bucket with RLS policies
  - Create storage bucket named 'user-photos' (private)
  - Create INSERT policy for users to upload to their own folder
  - Create SELECT policy for users to view their own photos
  - Create DELETE policy for users to delete their own photos
  - Test by uploading a file via Supabase dashboard
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_




## Phase 2: Core Infrastructure

- [x] 12. Create Supabase client utilities
- [x] 12.1 Create client-side Supabase client
  - Create file `app/lib/supabase/client.ts`
  - Import `createClientComponentClient` from auth helpers
  - Export `createSupabaseClient` function
  - Add TypeScript types for database schema
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 12.2 Create server-side Supabase clients
  - Create file `app/lib/supabase/server.ts`
  - Import `createServerComponentClient` from auth helpers
  - Export `createSupabaseServerComponent` function
  - Add cookie handling for server components
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 12.3 Create storage helper utilities
  - Create file `app/lib/supabase/storage.ts`
  - Implement `uploadPhoto` function with file resize logic
  - Implement `deletePhoto` function
  - Add error handling for upload failures
  - Add file type and size validation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7_

- [x] 12.4 Create real-time sync manager
  - Create file `app/lib/supabase/sync.ts`
  - Implement `SupabaseSync` class with subscribe/unsubscribe methods
  - Add support for INSERT, UPDATE, DELETE events
  - Add channel management to prevent duplicates
  - Export singleton instance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

- [x] 13. Implement authentication system
- [x] 13.1 Create AuthContext
  - Create file `app/contexts/AuthContext.tsx`
  - Define `AuthContextType` interface
  - Implement `AuthProvider` component
  - Add `useAuth` hook
  - Implement `signInWithGoogle` method
  - Implement `signInWithEmail` method
  - Implement `signUpWithEmail` method
  - Implement `signOut` method
  - Add `onAuthStateChange` listener
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.6_

- [x] 13.2 Create authentication callback route
  - Create file `app/auth/callback/route.ts`
  - Implement GET handler for OAuth callback
  - Exchange code for session
  - Redirect to dashboard after successful auth
  - _Requirements: 1.4_

- [x] 13.3 Create middleware for route protection
  - Create file `middleware.ts` in project root
  - Implement session verification
  - Add redirect logic for unauthenticated users
  - Add redirect logic for authenticated users on public routes
  - Configure matcher to exclude static assets
  - _Requirements: 1.7, 1.8_

- [x] 13.4 Update providers to include AuthProvider
  - Edit `app/providers.tsx`
  - Wrap children with `AuthProvider`
  - Ensure proper nesting with other providers
  - _Requirements: 1.5, 7.6_

- [x] 14. Create login and registration pages
- [x] 14.1 Create login page
  - Create file `app/login/page.tsx`
  - Implement email/password login form
  - Add Google OAuth button
  - Add loading states
  - Add error handling and display
  - Add link to registration page
  - Add redirect logic if already authenticated
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8, 10.3, 10.4_

- [x] 14.2 Create registration page
  - Create file `app/registro/page.tsx`
  - Implement email/password registration form
  - Add password confirmation field
  - Add password validation (minimum 6 characters)
  - Add Google OAuth button
  - Add success message for email confirmation
  - Add link to login page
  - Add redirect logic if already authenticated
  - _Requirements: 1.2, 1.3, 1.8, 10.3, 10.4_

- [x] 15. Create shared UI components
- [x] 15.1 Create LoadingSpinner component
  - Create file `app/components/common/LoadingSpinner.tsx`
  - Implement spinner with different sizes
  - Add ARIA labels for accessibility
  - Export component
  - _Requirements: 7.3, 8.4_

- [x] 15.2 Create ErrorMessage component
  - Create file `app/components/common/ErrorMessage.tsx`
  - Implement error display with message prop
  - Add retry button with onRetry callback
  - Add conditional dev mode details
  - Export component
  - _Requirements: 7.4, 10.1, 10.2, 10.4, 10.5_

- [x] 15.3 Create EmptyState component
  - Create file `app/components/common/EmptyState.tsx`
  - Implement empty state with message and icon
  - Add optional call-to-action button
  - Export component
  - _Requirements: 7.3_


## Phase 3: Store Migration - Simple Stores

- [x] 16. Migrate perfilStore to Supabase
- [x] 16.1 Refactor perfilStore for Supabase
  - Create file `app/stores/perfilStore.v2.ts` (or update existing)
  - Add loading and error state properties
  - Implement `carregarPerfil` method to fetch from users_profile, preferencias_visuais, metas_diarias
  - Implement `atualizarNome` method with upsert to users_profile
  - Implement `atualizarPreferenciasVisuais` method with upsert
  - Implement `atualizarMetasDiarias` method with upsert
  - Implement `alternarNotificacoes` and `alternarPausas` methods
  - Add error handling to all methods
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 16.2 Update perfil components to use new store
  - Update `app/components/perfil/InformacoesPessoais.tsx` to call carregarPerfil on mount
  - Update `app/components/perfil/PreferenciasVisuais.tsx` to use new store methods
  - Update `app/components/perfil/MetasDiarias.tsx` to use new store methods
  - Add loading states to all components
  - Add error handling to all components
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 16.3 Update perfil page
  - Update `app/perfil/page.tsx` to use useAuth hook
  - Add authentication check
  - Add loading state while data loads
  - Test full CRUD flow
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 16.4 Add real-time sync to perfilStore
  - Implement `setupRealtimeSync` method in perfilStore
  - Subscribe to changes on users_profile, preferencias_visuais, metas_diarias
  - Update store state when changes are received
  - Return cleanup function
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 17. Migrate prioridadesStore to Supabase
- [x] 17.1 Refactor prioridadesStore for Supabase
  - Update `app/stores/prioridadesStore.ts`
  - Add loading and error state
  - Implement `carregarPrioridades` method to fetch from prioridades table
  - Implement `adicionarPrioridade` method with insert
  - Implement `atualizarPrioridade` method with update
  - Implement `removerPrioridade` method with delete
  - Implement `marcarConcluida` toggle method
  - Add error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 17.2 Update prioridades components
  - Update `app/components/inicio/ListaPrioridades.tsx` to call carregarPrioridades on mount
  - Add loading and error states
  - Test adding, updating, deleting, and toggling prioridades
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17.3 Add real-time sync to prioridadesStore
  - Implement `setupRealtimeSync` method
  - Subscribe to prioridades table changes
  - Update store on INSERT, UPDATE, DELETE events
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 18. Migrate sonoStore to Supabase
- [x] 18.1 Refactor sonoStore for Supabase
  - Update `app/stores/sonoStore.ts`
  - Add loading and error state
  - Implement `carregarRegistros` method with date range filtering
  - Implement `adicionarRegistro` method with validation
  - Implement `atualizarRegistro` method
  - Implement `removerRegistro` method
  - Add error handling for unique constraint (user_id, data)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 18.2 Update sono components
  - Update `app/components/sono/RegistroSono.tsx` to use new store
  - Update `app/components/sono/VisualizadorSemanal.tsx` to use new store
  - Update `app/components/sono/ConfiguracaoLembretes.tsx` if needed
  - Add loading and error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 18.3 Update sono page
  - Update `app/sono/page.tsx` to use useAuth
  - Add authentication and loading checks
  - Test full CRUD flow
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 18.4 Add real-time sync to sonoStore
  - Implement `setupRealtimeSync` method
  - Subscribe to sono_registros table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 19. Migrate atividadesStore to Supabase
- [x] 19.1 Refactor atividadesStore for Supabase
  - Update `app/stores/atividadesStore.ts`
  - Add loading and error state
  - Implement `carregarAtividades` with category filtering
  - Implement `adicionarAtividade` method
  - Implement `atualizarAtividade` method
  - Implement `removerAtividade` method
  - Add error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 19.2 Update atividades components
  - Update `app/components/lazer/AtividadesLazer.tsx` to use new store
  - Add loading and error states
  - Test CRUD operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 19.3 Update lazer and saude pages
  - Update `app/lazer/page.tsx` to use useAuth
  - Update `app/saude/page.tsx` if it uses atividades
  - Add authentication and loading checks
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 19.4 Add real-time sync to atividadesStore
  - Implement `setupRealtimeSync` method
  - Subscribe to atividades table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 20. Migrate pomodoroStore to Supabase
- [x] 20.1 Refactor pomodoroStore for Supabase
  - Update `app/stores/pomodoroStore.ts`
  - Add loading and error state
  - Implement `carregarSessoes` method
  - Implement `registrarSessao` method (auto-called on timer completion)
  - Implement `obterEstatisticas` method for aggregations
  - Add error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 20.2 Update pomodoro components
  - Update `app/components/estudos/TemporizadorPomodoro.tsx` to auto-save sessions
  - Add loading and error states
  - Test session recording
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 20.3 Add real-time sync to pomodoroStore
  - Implement `setupRealtimeSync` method
  - Subscribe to pomodoro_sessoes table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_


## Phase 4: Store Migration - Complex Stores

- [x] 21. Migrate financasStore to Supabase
- [x] 21.1 Refactor financasStore for Supabase
  - Update `app/stores/financasStore.ts`
  - Add loading and error state
  - Implement `carregarDados` to fetch categorias, transacoes, envelopes, pagamentos
  - Implement categoria CRUD methods
  - Implement transacao CRUD methods with categoria relationship
  - Implement envelope CRUD methods with calculations
  - Implement pagamento recorrente CRUD methods
  - Add error handling for foreign key constraints
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 21.2 Update financas components
  - Update `app/components/financas/AdicionarDespesa.tsx` to use new store
  - Update `app/components/financas/RastreadorGastos.tsx` to use new store
  - Update `app/components/financas/EnvelopesVirtuais.tsx` to use new store
  - Update `app/components/financas/CalendarioPagamentos.tsx` to use new store
  - Add loading and error states to all components
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 21.3 Update financas page
  - Update `app/financas/page.tsx` to use useAuth
  - Add authentication and loading checks
  - Test all CRUD operations
  - Test category relationships
  - Test envelope calculations
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 21.4 Add real-time sync to financasStore
  - Implement `setupRealtimeSync` method
  - Subscribe to all 4 financial tables
  - Update store on changes
  - Handle cascading updates
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 22. Migrate alimentacaoStore to Supabase
- [x] 22.1 Refactor alimentacaoStore for Supabase
  - Update `app/stores/alimentacaoStore.ts`
  - Add loading and error state
  - Implement `carregarRefeicoes` method
  - Implement `adicionarRefeicao` method with photo upload support
  - Implement `atualizarRefeicao` method
  - Implement `removerRefeicao` method with photo deletion
  - Use storage helper for photo operations
  - Add error handling for storage operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 6.1, 6.2, 6.3, 6.4_

- [x] 22.2 Update alimentacao components
  - Update `app/components/alimentacao/RegistroRefeicoes.tsx` to use new store
  - Update `app/components/alimentacao/PlanejadorRefeicoes.tsx` if needed
  - Update `app/components/alimentacao/LembreteHidratacao.tsx` if needed
  - Add file upload UI with preview
  - Add loading states for uploads
  - Add error handling for upload failures
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 6.7_

- [x] 22.3 Update alimentacao page
  - Update `app/alimentacao/page.tsx` to use useAuth
  - Add authentication and loading checks
  - Test photo upload and deletion
  - Verify photos are deleted when refeicao is removed
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 6.4_

- [x] 22.4 Add real-time sync to alimentacaoStore
  - Implement `setupRealtimeSync` method
  - Subscribe to alimentacao_refeicoes table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 23. Migrate receitasStore to Supabase
- [x] 23.1 Refactor receitasStore for Supabase
  - Update `app/stores/receitasStore.ts`
  - Add loading and error state
  - Implement `carregarReceitas` method
  - Implement `adicionarReceita` method with JSONB ingredientes and photo upload
  - Implement `atualizarReceita` method
  - Implement `removerReceita` method with photo deletion
  - Implement `marcarFavorita` toggle method
  - Implement lista de compras CRUD methods
  - Implement `adicionarIngredientesNaLista` method
  - Add error handling for JSONB validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 6.1, 6.2, 6.3, 6.4_

- [x] 23.2 Update receitas components
  - Update `app/components/receitas/AdicionarReceitaForm.tsx` to use new store
  - Update `app/components/receitas/ListaReceitas.tsx` to use new store
  - Update `app/components/receitas/DetalhesReceita.tsx` to use new store
  - Update `app/components/receitas/ListaCompras.tsx` to use new store
  - Update `app/components/receitas/FiltroCategorias.tsx` if needed
  - Update `app/components/receitas/ImportadorReceitas.tsx` to handle JSONB format
  - Add loading and error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 23.3 Update receitas pages
  - Update `app/receitas/page.tsx` to use useAuth
  - Update `app/receitas/adicionar/page.tsx` to use useAuth
  - Update `app/receitas/[id]/page.tsx` to use useAuth
  - Update `app/receitas/editar/[id]/page.tsx` to use useAuth
  - Update `app/receitas/lista-compras/page.tsx` to use useAuth
  - Add authentication and loading checks to all pages
  - Test JSONB ingredientes operations
  - Test photo upload and deletion
  - Test lista de compras integration
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 23.4 Add real-time sync to receitasStore
  - Implement `setupRealtimeSync` method
  - Subscribe to receitas and lista_compras tables
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 24. Migrate autoconhecimentoStore to Supabase
- [x] 24.1 Refactor autoconhecimentoStore for Supabase
  - Update `app/stores/autoconhecimentoStore.ts`
  - Add loading and error state
  - Implement `carregarRegistros` with type filtering
  - Implement `adicionarRegistro` method with array gatilhos
  - Implement `atualizarRegistro` method
  - Implement `removerRegistro` method
  - Implement `obterTendencias` method for analytics
  - Add error handling for array operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 24.2 Update autoconhecimento components
  - Update `app/components/autoconhecimento/EditorNotas.tsx` to use new store
  - Update `app/components/autoconhecimento/ListaNotas.tsx` to use new store
  - Update `app/components/autoconhecimento/ModoRefugio.tsx` if needed
  - Add loading and error states
  - Test array gatilhos operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 24.3 Update autoconhecimento page
  - Update `app/autoconhecimento/page.tsx` to use useAuth
  - Add authentication and loading checks
  - Test type filtering (humor, energia, ansiedade)
  - Test gatilhos array operations
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 24.4 Add real-time sync to autoconhecimentoStore
  - Implement `setupRealtimeSync` method
  - Subscribe to autoconhecimento_registros table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 25. Migrate hiperfocosStore to Supabase
- [x] 25.1 Refactor hiperfocosStore for Supabase
  - Update `app/stores/hiperfocosStore.ts`
  - Add loading and error state
  - Implement `carregarHiperfocos` with status filtering
  - Implement `adicionarHiperfoco` method
  - Implement `atualizarHiperfoco` method
  - Implement `removerHiperfoco` method
  - Implement `alterarStatus` method (ativo/pausado/concluido)
  - Add error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 25.2 Update hiperfocos components
  - Update `app/components/hiperfocos/VisualizadorProjetos.tsx` to use new store
  - Update `app/components/hiperfocos/TemporizadorFoco.tsx` if needed
  - Update `app/components/hiperfocos/SistemaAlternancia.tsx` if needed
  - Update `app/components/hiperfocos/ConversorInteresses.tsx` if needed
  - Add loading and error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 25.3 Update hiperfocos page
  - Update `app/hiperfocos/page.tsx` to use useAuth
  - Add authentication and loading checks
  - Test status transitions
  - Test intensidade validation
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 25.4 Add real-time sync to hiperfocosStore
  - Implement `setupRealtimeSync` method
  - Subscribe to hiperfocos table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_


## Phase 5: Store Migration - Study System

- [x] 26. Migrate concursosStore to Supabase
- [x] 26.1 Refactor concursosStore for Supabase
  - Update `app/stores/concursosStore.ts`
  - Add loading and error state
  - Implement `carregarConcursos` with status filtering
  - Implement `adicionarConcurso` method with array disciplinas
  - Implement `atualizarConcurso` method
  - Implement `removerConcurso` method (cascade deletes questoes)
  - Implement `alterarStatus` method
  - Add error handling for array operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 26.2 Update concursos components
  - Update `app/components/concursos/ConcursoForm.tsx` to use new store
  - Update `app/components/concursos/ImportarConcursoJsonModal.tsx` to handle new format
  - Add loading and error states
  - Test array disciplinas operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 26.3 Update concursos pages
  - Update `app/concursos/page.tsx` to use useAuth
  - Update `app/concursos/[id]/page.tsx` to use useAuth
  - Add authentication and loading checks
  - Test CRUD operations
  - Test status filtering
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 26.4 Add real-time sync to concursosStore
  - Implement `setupRealtimeSync` method
  - Subscribe to estudos_concursos table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 27. Migrate questoesStore to Supabase
- [x] 27.1 Refactor questoesStore for Supabase
  - Update `app/stores/questoesStore.ts`
  - Add loading and error state
  - Implement `carregarQuestoes` with concurso_id and disciplina filtering
  - Implement `adicionarQuestao` method with JSONB alternativas and array tags
  - Implement `atualizarQuestao` method
  - Implement `removerQuestao` method
  - Implement `buscarPorTags` method using GIN index
  - Add error handling for JSONB validation and foreign keys
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 27.2 Update questoes components
  - Update `app/components/concursos/QuestaoForm.tsx` to use new store
  - Update `app/components/concursos/QuestaoCard.tsx` to use new store
  - Update `app/components/concursos/QuestaoList.tsx` to use new store
  - Update `app/components/concursos/GeradorQuestoesLLM.tsx` to format for JSONB
  - Update `app/components/concursos/GeradorContextoLLM.tsx` if needed
  - Add loading and error states
  - Test JSONB alternativas operations
  - Test tags array operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 27.3 Update concursos detail page for questoes
  - Update `app/concursos/[id]/page.tsx` to load and display questoes
  - Add questao CRUD operations
  - Test foreign key relationship with concursos
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 27.4 Add real-time sync to questoesStore
  - Implement `setupRealtimeSync` method
  - Subscribe to estudos_questoes table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 28. Migrate registroEstudosStore to Supabase
- [x] 28.1 Refactor registroEstudosStore for Supabase
  - Update `app/stores/registroEstudosStore.ts`
  - Add loading and error state
  - Implement `carregarRegistros` with date range filtering
  - Implement `adicionarRegistro` method with array topicos
  - Implement `atualizarRegistro` method
  - Implement `removerRegistro` method
  - Implement `obterEstatisticas` method for aggregations by disciplina
  - Add error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 28.2 Update estudos components
  - Update `app/components/estudos/RegistroEstudos.tsx` to use new store
  - Add loading and error states
  - Test array topicos operations
  - Test statistics calculations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 28.3 Update estudos page
  - Update `app/estudos/page.tsx` to use useAuth
  - Add authentication and loading checks
  - Test CRUD operations
  - Test disciplina filtering
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 28.4 Add real-time sync to registroEstudosStore
  - Implement `setupRealtimeSync` method
  - Subscribe to estudos_registros table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 29. Migrate simuladoStore to Supabase

- [x] 29.1 Refactor simuladoStore for Supabase
  - Update `app/stores/simuladoStore.ts`
  - Add loading and error state
  - Implement `carregarSimulados` method
  - Implement `criarSimulado` method with array questoes_ids
  - Implement `iniciarSimulado` method
  - Implement `finalizarSimulado` method with acertos calculation
  - Implement `obterQuestoes` method to fetch questoes by IDs
  - Add error handling for array operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 29.2 Update simulado components
  - Update `app/components/estudos/simulado/SimuladoLoader.tsx` to use new store
  - Update `app/components/estudos/simulado/SimuladoResults.tsx` to use new store
  - Update `app/components/estudos/simulado/SimuladoReview.tsx` to use new store
  - Add loading and error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 29.3 Update simulado pages
  - Update `app/estudos/simulado/page.tsx` to use useAuth
  - Update `app/estudos/simulado-personalizado/page.tsx` to use useAuth
  - Add authentication and loading checks
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 29.4 Add real-time sync to simuladoStore
  - Implement `setupRealtimeSync` method
  - Subscribe to estudos_simulados table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 30. Migrate historicoSimuladosStore to Supabase
- [x] 30.1 Refactor historicoSimuladosStore for Supabase
  - Update `app/stores/historicoSimuladosStore.ts`
  - Add loading and error state
  - Implement `carregarHistorico` method (read-only view of estudos_simulados)
  - Implement `obterEstatisticas` method for performance analytics
  - Implement `obterEvolucao` method for trend analysis
  - Add error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 30.2 Update historico components
  - Update `app/components/estudos/simulado/HistoricoModal.tsx` to use new store
  - Add loading and error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 30.3 Add real-time sync to historicoSimuladosStore
  - Implement `setupRealtimeSync` method
  - Subscribe to estudos_simulados table
  - Update store on changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_


## Phase 6: Store Migration - Special Cases

- [x] 31. Migrate painelDiaStore to Supabase
- [x] 31.1 Refactor painelDiaStore for Supabase
  - Update `app/stores/painelDiaStore.ts`
  - Add loading and error state
  - Implement `carregarDadosDia` method that aggregates from multiple tables
  - Query prioridades for today
  - Query sono_registros for last night
  - Query pomodoro_sessoes for today
  - Query alimentacao_refeicoes for today
  - Query estudos_registros for today
  - Combine data into dashboard summary
  - Add error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 31.2 Update painel dia components
  - Update `app/components/inicio/PainelDia.tsx` to use new store
  - Update `app/components/inicio/ChecklistMedicamentos.tsx` if needed
  - Update `app/components/inicio/LembretePausas.tsx` if needed
  - Update `app/components/inicio/ProximaProvaCard.tsx` to query estudos_concursos
  - Add loading and error states
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 31.3 Update dashboard page
  - Update `app/page.tsx` to use useAuth
  - Add authentication and loading checks
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 31.4 Add real-time sync to painelDiaStore
  - Implement `setupRealtimeSync` method
  - Subscribe to multiple tables (prioridades, sono_registros, pomodoro_sessoes, etc.)
  - Update store when any relevant data changes
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 32. Remove data import/export functionality

- [x] 32.1 Remove dataTransferStore
  - Delete `app/stores/dataTransferStore.ts` file
  - Remove all references to dataTransferStore from other files
  - Clean up any imports or dependencies
  - _Requirements: Cleanup_

- [x] 32.2 Remove data transfer component
  - Delete `app/components/ExportarImportarDados.tsx` file
  - Remove component from any parent components that use it (likely in perfil or settings pages)
  - Remove any related UI elements or menu items for manual export/import
  - Clean up imports and references
  - Note: Keep localStorage migration functionality (different from manual export/import)
  - Note: Keep ImportadorReceitas and ImportarConcursoJsonModal (these are feature-specific imports, not general data export/import)
  - _Requirements: Cleanup_

- [ ] 33. Handle sugestoesStore
- [ ] 33.1 Evaluate sugestoesStore migration needs
  - Review `app/stores/sugestoesStore.ts` implementation
  - Determine if data needs to be persisted (likely client-side only)
  - If persistence needed, create sugestoes table
  - If client-side only, update to work with Supabase data sources
  - Document decision
  - _Requirements: 4.1_

- [ ] 33.2 Update sugestoes components if needed
  - Update `app/components/lazer/SugestoesDescanso.tsx` if needed
  - Test suggestions generation
  - _Requirements: 7.1_

## Phase 7: Data Migration Tool

- [ ] 34. Create data migration utility
- [ ] 34.1 Implement localStorage detection and migration
  - Create file `app/lib/migration/migrateFromLocalStorage.ts`
  - Implement `detectLocalStorageData` function to check for existing data
  - Implement `migrateUserData` function to migrate all stores
  - For each store, read from localStorage, transform to Supabase format, insert
  - Handle data transformation (e.g., dates, IDs, relationships)
  - Implement error handling and rollback on failure
  - Clear localStorage only after successful migration
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 34.2 Create migration UI component
  - Create file `app/components/migration/MigrationPrompt.tsx`
  - Implement modal/dialog to prompt user for migration
  - Add "Migrate Now" and "Skip" buttons
  - Show migration progress
  - Show success/error messages
  - Add retry functionality on failure
  - _Requirements: 9.2, 9.5, 9.7_

- [ ] 34.3 Integrate migration prompt into app
  - Update `app/layout.tsx` or `app/page.tsx` to show migration prompt
  - Check for localStorage data on first authenticated load
  - Show prompt if data exists
  - Don't show again after successful migration or skip
  - _Requirements: 9.1, 9.2_

- [ ]* 34.4 Test data migration with sample data
  - Create sample localStorage data for all stores
  - Run migration
  - Verify all data migrated correctly
  - Verify relationships preserved
  - Verify no data loss
  - _Requirements: 9.3, 9.4, 9.5, 9.6_


## Phase 8: Testing and Quality Assurance

- [ ] 35. Authentication testing
- [ ]* 35.1 Test email/password authentication flow
  - Test user registration with email/password
  - Test email confirmation
  - Test login with valid credentials
  - Test login with invalid credentials
  - Test password validation (minimum 6 characters)
  - Test password mismatch on registration
  - Verify error messages are clear
  - _Requirements: 1.2, 1.3, 10.3_

- [ ]* 35.2 Test Google OAuth authentication flow
  - Test Google OAuth login
  - Test OAuth callback handling
  - Test account creation via OAuth
  - Test linking existing account
  - Verify redirect URLs work
  - _Requirements: 1.4_

- [ ]* 35.3 Test session management
  - Test session persistence across page refreshes
  - Test session persistence across browser restarts
  - Test logout functionality
  - Test automatic token refresh
  - Test session expiration handling
  - _Requirements: 1.5, 1.6_

- [ ]* 35.4 Test route protection
  - Test unauthenticated access to protected routes (should redirect to login)
  - Test authenticated access to login/registro (should redirect to dashboard)
  - Test middleware on all routes
  - _Requirements: 1.7, 1.8_

- [ ] 36. Database and RLS testing
- [ ]* 36.1 Test CRUD operations for all stores
  - For each of the 18 stores, test create, read, update, delete
  - Verify data persists correctly
  - Verify data loads correctly
  - Verify updates reflect immediately
  - Verify deletes remove data
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ]* 36.2 Test Row Level Security
  - Create two test users
  - Add data with user 1
  - Attempt to access user 1's data with user 2 (should fail)
  - Verify RLS policies block unauthorized access
  - Test for all tables
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ]* 36.3 Test data relationships and constraints
  - Test foreign key relationships (e.g., transacoes → categorias)
  - Test CASCADE deletes (e.g., delete concurso deletes questoes)
  - Test CHECK constraints (e.g., qualidade 1-5)
  - Test UNIQUE constraints (e.g., sono_registros per user per day)
  - Verify constraint violations show appropriate errors
  - _Requirements: 2.2, 2.7, 10.4_

- [ ]* 36.4 Test JSONB and array operations
  - Test JSONB storage and retrieval (ingredientes, alternativas)
  - Test array storage and retrieval (disciplinas, tags, gatilhos, topicos)
  - Test querying by JSONB fields
  - Test querying by array fields (GIN indexes)
  - _Requirements: 2.5, 2.6_

- [ ] 37. Real-time synchronization testing
- [ ]* 37.1 Test real-time sync across devices
  - Open app in two browsers/devices with same account
  - Add data in browser 1
  - Verify data appears in browser 2 within 2 seconds
  - Update data in browser 2
  - Verify update appears in browser 1
  - Delete data in browser 1
  - Verify deletion reflects in browser 2
  - Test for multiple stores
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 37.2 Test subscription management
  - Verify subscriptions are created on component mount
  - Verify subscriptions are cleaned up on component unmount
  - Verify no duplicate subscriptions
  - Test reconnection after network interruption
  - _Requirements: 5.5, 5.7_

- [ ] 38. File storage testing
- [ ]* 38.1 Test photo upload and retrieval
  - Test uploading photo for refeicao
  - Test uploading photo for receita
  - Verify photos are stored in correct user folder
  - Verify photo URLs are accessible
  - Test different file types (jpg, png)
  - Test file size limits
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ]* 38.2 Test photo deletion
  - Delete refeicao with photo
  - Verify photo is deleted from storage
  - Delete receita with photo
  - Verify photo is deleted from storage
  - _Requirements: 6.4_

- [ ]* 38.3 Test storage RLS
  - Attempt to access another user's photo (should fail)
  - Verify storage policies enforce user isolation
  - _Requirements: 6.5_

- [ ] 39. Error handling testing
- [ ]* 39.1 Test network error handling
  - Simulate offline mode
  - Attempt operations
  - Verify appropriate error messages
  - Reconnect and verify recovery
  - _Requirements: 10.1, 10.6_

- [ ]* 39.2 Test validation error handling
  - Submit invalid data (e.g., qualidade = 10)
  - Verify validation errors are caught
  - Verify error messages are user-friendly
  - _Requirements: 10.3, 10.4_

- [ ]* 39.3 Test authentication error handling
  - Expire session manually
  - Attempt operation
  - Verify redirect to login
  - _Requirements: 10.2_

- [ ] 40. Performance testing
- [ ]* 40.1 Test query performance
  - Measure page load times
  - Verify queries complete within 500ms average
  - Test with large datasets
  - Verify indexes are being used
  - _Requirements: 11.1, 11.2, 11.5_

- [ ]* 40.2 Test pagination
  - Load pages with many items (e.g., 100+ transacoes)
  - Verify pagination limits initial load
  - Test "load more" functionality
  - _Requirements: 11.3_

- [ ]* 40.3 Test real-time performance
  - Measure real-time message latency
  - Verify updates appear within 2 seconds
  - Test with multiple concurrent subscriptions
  - _Requirements: 11.6_

- [ ] 41. Security testing
- [ ]* 41.1 Test SQL injection prevention
  - Attempt SQL injection in input fields
  - Verify Supabase client prevents injection
  - _Requirements: 12.6_

- [ ]* 41.2 Test XSS prevention
  - Input malicious scripts in text fields
  - Verify React escapes output
  - Verify no script execution
  - _Requirements: 12.7_

- [ ]* 41.3 Test authentication security
  - Verify passwords are hashed (not visible in database)
  - Verify session tokens are HTTP-only
  - Verify HTTPS in production
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 42. End-to-end user journey testing
- [ ]* 42.1 Test new user onboarding
  - Register new account
  - Confirm email
  - Login
  - Complete profile setup
  - Add first data in each module
  - Verify all features work
  - _Requirements: 1.2, 1.3, 8.1, 8.2_

- [ ]* 42.2 Test existing user migration
  - Create localStorage data
  - Login with new account
  - Accept migration prompt
  - Verify all data migrated
  - Verify app functions normally
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ]* 42.3 Test multi-device workflow
  - Login on device 1
  - Add data
  - Login on device 2
  - Verify data synced
  - Modify data on device 2
  - Verify changes on device 1
  - _Requirements: 5.1, 5.2, 5.4_


## Phase 9: Documentation and Deployment

- [ ] 43. Update documentation
- [ ] 43.1 Update README with Supabase setup instructions
  - Document Supabase project creation
  - Document environment variable setup
  - Document database schema setup
  - Document OAuth configuration
  - Document local development setup
  - _Requirements: 14.1, 14.2_

- [ ] 43.2 Create .env.example file
  - Add all required environment variables
  - Add comments explaining each variable
  - Add example values (non-sensitive)
  - _Requirements: 14.2_

- [ ] 43.3 Document database migrations
  - Create migrations folder with SQL files
  - Document migration execution process
  - Create rollback scripts
  - _Requirements: 14.3_

- [ ] 43.4 Create deployment checklist
  - List all pre-deployment steps
  - List deployment steps
  - List post-deployment verification steps
  - _Requirements: 14.4_

- [ ] 43.5 Document API usage
  - Document Supabase client methods
  - Document store patterns
  - Document real-time sync setup
  - Add code examples
  - _Requirements: 14.5_

- [ ] 43.6 Create troubleshooting guide
  - Document common issues and solutions
  - Add debugging tips
  - Add links to Supabase docs
  - _Requirements: 14.6_

- [ ] 44. Prepare for deployment
- [ ] 44.1 Set up staging environment
  - Create staging Supabase project
  - Configure staging environment variables in Vercel
  - Deploy to staging
  - _Requirements: 15.1, 15.2_

- [ ] 44.2 Run full test suite on staging
  - Run all authentication tests
  - Run all CRUD tests
  - Run real-time sync tests
  - Run security tests
  - Verify all features work
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 44.3 Set up production environment
  - Create production Supabase project
  - Configure production environment variables in Vercel
  - Set up custom domain if needed
  - Configure OAuth redirect URLs for production
  - _Requirements: 15.1, 15.2_

- [ ] 44.4 Create rollback plan
  - Document rollback procedure
  - Create feature flag for localStorage fallback
  - Test feature flag toggle
  - Document when to rollback
  - _Requirements: 15.3, 15.4, 15.5, 15.6, 15.7_

- [ ] 45. Deploy to production
- [ ] 45.1 Execute deployment
  - Deploy to production Vercel
  - Verify deployment successful
  - Verify environment variables set
  - Verify OAuth working
  - _Requirements: 14.4_

- [ ] 45.2 Post-deployment verification
  - Test authentication flows
  - Test data operations
  - Test real-time sync
  - Test file uploads
  - Monitor error rates
  - Monitor performance metrics
  - _Requirements: 14.4, 14.7_

- [ ] 45.3 Monitor for 24 hours
  - Check error logs regularly
  - Monitor Supabase dashboard
  - Monitor Vercel analytics
  - Respond to user feedback
  - Document any issues
  - _Requirements: 14.7_

- [ ] 46. Post-deployment tasks
- [ ] 46.1 Announce migration to users
  - Prepare announcement message
  - Explain new features (real-time sync, multi-device)
  - Provide migration instructions
  - Provide support contact
  - _Requirements: 12.4_

- [ ] 46.2 Monitor usage and performance
  - Track active users
  - Monitor database size growth
  - Monitor storage usage
  - Monitor API request counts
  - Set up alerts for limits
  - _Requirements: 14.7_

- [ ] 46.3 Gather user feedback
  - Create feedback form
  - Monitor for issues
  - Track feature requests
  - Plan improvements
  - _Requirements: 14.7_

- [ ] 46.4 Clean up old code (after 2 weeks of stability)
  - Remove localStorage fallback code
  - Remove old Google Drive integration
  - Remove iron-session code
  - Remove unused dependencies
  - _Requirements: 15.5_

## Summary

This implementation plan covers the complete migration from localStorage/Google Drive to Supabase across 46 major tasks with numerous sub-tasks. The plan is organized into 9 phases:

1. **Phase 0**: Supabase setup and configuration (3 tasks)
2. **Phase 1**: Database schema creation (11 tasks)
3. **Phase 2**: Core infrastructure (4 tasks)
4. **Phase 3**: Simple store migration (5 tasks)
5. **Phase 4**: Complex store migration (5 tasks)
6. **Phase 5**: Study system migration (5 tasks)
7. **Phase 6**: Special cases (3 tasks)
8. **Phase 7**: Data migration tool (1 task)
9. **Phase 8**: Testing (8 tasks)
10. **Phase 9**: Documentation and deployment (4 tasks)

**Total**: 46 main tasks, with many containing multiple sub-tasks

**Estimated Timeline**: 8-10 weeks for full implementation and testing

**Key Success Factors**:
- Incremental approach (one store at a time)
- Comprehensive testing at each phase
- Clear rollback plan
- User data migration tool
- Real-time synchronization
- Security-first with RLS

The migration will transform StayFocus into a modern, cloud-native application with robust authentication, real-time sync, and scalability for future growth.
