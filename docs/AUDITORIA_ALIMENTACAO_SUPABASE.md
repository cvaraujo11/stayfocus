# Auditoria de Implementação Supabase - Rota /alimentacao

**Data da Auditoria:** 19 de outubro de 2025  
**Auditor:** GitHub Copilot  
**Módulo:** Alimentação (`/app/alimentacao`)

---

## 📋 Sumário Executivo

Esta auditoria avalia a implementação do Supabase nos componentes da rota `/alimentacao`. O módulo possui **implementação parcial**, com alguns componentes totalmente integrados ao Supabase e outros funcionando apenas com estado local.

### Status Geral: ⚠️ **PARCIALMENTE IMPLEMENTADO**

---

## 🔍 Análise por Componente

### 1. **RegistroRefeicoes.tsx** - ✅ **TOTALMENTE IMPLEMENTADO**

**Status:** Implementação completa com Supabase

#### Funcionalidades Implementadas:
- ✅ Persistência de dados no Supabase
- ✅ Upload de fotos no Supabase Storage
- ✅ Real-time sync via WebSocket
- ✅ Autenticação de usuário
- ✅ Tratamento de erros
- ✅ Loading states
- ✅ Operações CRUD completas

#### Detalhes Técnicos:

**Tabela Supabase:** `alimentacao_refeicoes`

**Schema:**
```typescript
{
  id: string (UUID)
  user_id: string (FK to auth.users)
  data: string (date)
  hora: string (time)
  descricao: string
  foto_url: string | null
  created_at: string (timestamp)
}
```

**Operações Implementadas:**
1. **Carregar Refeições** (`carregarRefeicoes`)
   - Query com filtro por `user_id`
   - Ordenação por data e hora (descendente)
   - Suporte a filtros de data (início/fim)

2. **Adicionar Registro** (`adicionarRegistro`)
   - Validação de autenticação
   - Upload de foto (opcional) com resize e validação
   - Insert no banco com foto_url
   - Atualização do estado local

3. **Atualizar Registro** (`atualizarRegistro`)
   - Suporte para atualização parcial
   - Gerenciamento de foto (substituição/remoção)
   - Delete de foto antiga ao atualizar

4. **Remover Registro** (`removerRegistro`)
   - Delete do registro no banco
   - Delete da foto no Storage
   - Atualização do estado local

5. **Real-time Sync** (`setupRealtimeSync`)
   - Inscrição em mudanças da tabela
   - Callbacks para INSERT, UPDATE, DELETE
   - Limpeza automática de subscription

**Upload de Fotos:**
- Bucket: `user-photos`
- Organização: `{userId}/{timestamp}.{ext}`
- Validações:
  - Tamanho máximo: 5MB
  - Tipos permitidos: JPG, PNG, WEBP
  - Resize automático: max width 1200px
  - Qualidade JPEG: 85%

#### Pontos Fortes:
- ✅ Implementação robusta com tratamento de erros
- ✅ UI responsiva com feedback visual (loading, estados vazios)
- ✅ Preview de imagem antes do upload
- ✅ Integração completa com Storage
- ✅ Real-time sync implementado

#### Pontos de Atenção:
- ⚠️ Não há paginação (pode ter problemas de performance com muitos registros)
- ⚠️ Preview de imagem usa data URL (memory intensive para imagens grandes)
- ⚠️ Falta validação de tamanho de arquivo no frontend antes do upload

---

### 2. **PlanejadorRefeicoes.tsx** - ❌ **NÃO IMPLEMENTADO**

**Status:** Apenas estado local (client-side)

#### Estado Atual:
- ❌ Sem persistência no Supabase
- ❌ Sem sincronização entre dispositivos
- ❌ Dados perdidos ao recarregar a página
- ❌ Sem backup/recuperação

#### Funcionalidades Locais:
- Adicionar refeição planejada (horário + descrição)
- Editar refeição existente
- Remover refeição
- Estado inicial com 4 refeições pré-definidas

#### Impacto:
🔴 **ALTO** - Dados do planejamento de refeições são perdidos entre sessões

#### Recomendações:
1. Criar tabela `alimentacao_planejamento` no Supabase
2. Implementar CRUD com persistência
3. Adicionar real-time sync
4. Considerar planejamento por dia da semana

**Schema Sugerido:**
```sql
CREATE TABLE alimentacao_planejamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dia_semana INTEGER, -- 0-6 (opcional, para planejamento semanal)
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE alimentacao_planejamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their meal plans"
  ON alimentacao_planejamento
  FOR ALL
  USING (auth.uid() = user_id);
```

---

### 3. **LembreteHidratacao.tsx** - ❌ **NÃO IMPLEMENTADO**

**Status:** Apenas estado local (client-side)

#### Estado Atual:
- ❌ Sem persistência no Supabase
- ❌ Progresso perdido ao recarregar
- ❌ Sem histórico de hidratação
- ❌ Sem análise de padrões

#### Funcionalidades Locais:
- Contador de copos bebidos (0-15)
- Meta diária ajustável
- Barra de progresso
- Visualização de copos
- Último registro (timestamp local)

#### Impacto:
🟡 **MÉDIO** - Perda de dados de hidratação, mas reset diário é aceitável

#### Recomendações:
1. Criar tabela `alimentacao_hidratacao` para histórico
2. Implementar tracking diário
3. Gerar relatórios/gráficos de hidratação ao longo do tempo

**Schema Sugerido:**
```sql
CREATE TABLE alimentacao_hidratacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  copos_bebidos INTEGER NOT NULL DEFAULT 0,
  meta_diaria INTEGER NOT NULL DEFAULT 8,
  ultimo_registro TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- RLS
ALTER TABLE alimentacao_hidratacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their hydration data"
  ON alimentacao_hidratacao
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🗄️ Storage do Supabase

### Bucket: `user-photos`

**Configuração Implementada:**
- Upload com resize automático (max 1200px)
- Organização por `userId`
- Nome único com timestamp
- Cache control: 3600s
- Upsert: false (nomes únicos)

**Funcionalidades de Storage:**
- ✅ Upload com validação
- ✅ Delete de fotos antigas
- ✅ URLs públicas
- ✅ Resize automático

**Pontos de Atenção:**
- ⚠️ Falta configuração de políticas de acesso (RLS no Storage)
- ⚠️ Sem limpeza automática de fotos órfãs
- ⚠️ Sem limite de espaço por usuário

**Policies Sugeridas:**
```sql
-- Storage policies para user-photos
CREATE POLICY "Users can upload their own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🔐 Segurança e RLS (Row Level Security)

### Status Atual: ⚠️ **NÃO VERIFICADO**

**Tabela:** `alimentacao_refeicoes`

#### Verificações Necessárias:
- [ ] RLS está habilitado?
- [ ] Policies estão configuradas?
- [ ] Usuários só podem acessar seus próprios dados?
- [ ] Validações server-side estão implementadas?

#### Policies Recomendadas:
```sql
-- RLS para alimentacao_refeicoes
ALTER TABLE alimentacao_refeicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meals"
  ON alimentacao_refeicoes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
  ON alimentacao_refeicoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON alimentacao_refeicoes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON alimentacao_refeicoes
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔄 Real-time Sync

### Status: ✅ **IMPLEMENTADO** (para RegistroRefeicoes)

**Implementação:**
- Usa `supabaseSync.subscribeToUserData`
- Gerenciamento de subscriptions com contagem de referências
- Delay antes de unsubscribe (1 segundo)
- Reutilização de canais existentes

**Funcionalidades:**
- ✅ Subscribe a mudanças da tabela filtradas por `user_id`
- ✅ Callbacks para INSERT, UPDATE, DELETE
- ✅ Cleanup automático no unmount
- ✅ Prevenção de múltiplas subscriptions

**Pontos Fortes:**
- ✅ Implementação robusta com reference counting
- ✅ Logging detalhado para debugging
- ✅ Gerenciamento eficiente de canais WebSocket

**Pontos de Atenção:**
- ⚠️ Sem retry automático em caso de falha de conexão
- ⚠️ Sem indicador visual de status da conexão real-time

---

## 📊 Store (Zustand)

### Arquivo: `alimentacaoStore.ts`

**Estrutura:**
- ✅ Separação clara entre dados locais e persistidos
- ✅ Funções assíncronas para operações do Supabase
- ✅ Estados de loading e error
- ✅ Comentários claros sobre o que é persistido

**Pontos Fortes:**
- ✅ Tipagem completa com TypeScript
- ✅ Integração com Database types gerados
- ✅ Tratamento de erros consistente
- ✅ Atualização otimista do estado local

**Pontos de Melhoria:**
- ⚠️ Mistura estado local e persistido na mesma store
- ⚠️ Poderia separar em múltiplas stores especializadas
- ⚠️ Falta reset de erro após operações bem-sucedidas

---

## 🎨 UX/UI

### Feedback Visual:
- ✅ LoadingSpinner durante operações assíncronas
- ✅ ErrorMessage com opção de retry
- ✅ EmptyState quando não há dados
- ✅ Estados desabilitados durante loading
- ✅ Preview de imagem antes do upload

### Acessibilidade:
- ✅ Labels e aria-labels
- ✅ Roles e atributos ARIA
- ⚠️ Falta feedback sonoro para ações importantes
- ⚠️ Falta focus management após ações

---

## 🐛 Problemas Identificados

### Críticos:
1. ❌ **Falta de RLS verificado** - Possível vazamento de dados entre usuários
2. ❌ **Dados não persistidos** - Planejador e Hidratação perdem dados

### Médios:
3. ⚠️ **Sem paginação** - Performance pode degradar com muitos registros
4. ⚠️ **Sem Storage policies** - Acesso não controlado às fotos
5. ⚠️ **Sem limpeza de fotos órfãs** - Crescimento descontrolado do storage

### Menores:
6. ⚠️ **Preview usa data URL** - Alto consumo de memória
7. ⚠️ **Sem validação de tamanho no frontend** - Feedback tardio
8. ⚠️ **Sem indicador de conexão real-time** - Usuário não sabe se sync está ativo

---

## ✅ Checklist de Implementação

### Implementado:
- [x] Tabela `alimentacao_refeicoes` criada
- [x] CRUD completo para registros de refeições
- [x] Upload de fotos no Storage
- [x] Real-time sync para registros
- [x] Autenticação integrada
- [x] Loading states
- [x] Error handling

### ✅ Implementado (19/10/2025):
- [x] Criar tabela `alimentacao_planejamento` (Migration 003)
- [x] Implementar persistência do planejador (Store + Componente)
- [x] Criar tabela `alimentacao_hidratacao` (Migration 004)
- [x] Implementar persistência de hidratação (Store + Componente)
- [x] Configurar RLS na tabela `alimentacao_refeicoes` (Migration 005)
- [x] Configurar Storage policies (Migration 006)
- [x] Criar job de limpeza de fotos órfãs (Migration 007)
- [x] Criar script de verificação de segurança (Migration 008)
- [x] Implementar Real-time sync para planejamento
- [x] Implementar Real-time sync para hidratação
- [x] Documentar processo de migration

### Pendente - Importante:
- [ ] **EXECUTAR AS MIGRATIONS NO SUPABASE**
- [ ] Regenerar tipos do database (`app/types/database.ts`)
- [ ] Implementar paginação nos registros
- [ ] Implementar validação de tamanho de arquivo no frontend
- [ ] Adicionar indicador de status da conexão real-time

### Pendente - Melhorias:
- [ ] Otimizar preview de imagem (usar URL.createObjectURL)
- [ ] Adicionar compressão de imagem no frontend
- [ ] Implementar retry automático para real-time
- [ ] Adicionar telemetria/logs de erro

---

## 📝 Scripts SQL Necessários

### 1. Migration para Planejador de Refeições

```sql
-- ==========================================
-- Migration: Criar tabela de planejamento
-- Data: 2025-10-19
-- ==========================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS alimentacao_planejamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alimentacao_planejamento_user ON alimentacao_planejamento(user_id);
CREATE INDEX idx_alimentacao_planejamento_dia ON alimentacao_planejamento(dia_semana) WHERE dia_semana IS NOT NULL;

-- RLS
ALTER TABLE alimentacao_planejamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their meal plans"
  ON alimentacao_planejamento
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_alimentacao_planejamento_updated_at
  BEFORE UPDATE ON alimentacao_planejamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE alimentacao_planejamento IS 'Planejamento de refeições dos usuários';
COMMENT ON COLUMN alimentacao_planejamento.dia_semana IS '0=Domingo, 1=Segunda, ..., 6=Sábado. NULL=Todos os dias';
```

### 2. Migration para Hidratação

```sql
-- ==========================================
-- Migration: Criar tabela de hidratação
-- Data: 2025-10-19
-- ==========================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS alimentacao_hidratacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  copos_bebidos INTEGER NOT NULL DEFAULT 0 CHECK (copos_bebidos >= 0),
  meta_diaria INTEGER NOT NULL DEFAULT 8 CHECK (meta_diaria > 0 AND meta_diaria <= 20),
  ultimo_registro TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE(user_id, data)
);

-- Índices
CREATE INDEX idx_alimentacao_hidratacao_user_data ON alimentacao_hidratacao(user_id, data DESC);

-- RLS
ALTER TABLE alimentacao_hidratacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their hydration data"
  ON alimentacao_hidratacao
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_alimentacao_hidratacao_updated_at
  BEFORE UPDATE ON alimentacao_hidratacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE alimentacao_hidratacao IS 'Registro diário de hidratação dos usuários';
COMMENT ON COLUMN alimentacao_hidratacao.copos_bebidos IS 'Número de copos de água bebidos no dia';
COMMENT ON COLUMN alimentacao_hidratacao.meta_diaria IS 'Meta de copos para o dia (padrão: 8)';
```

### 3. RLS e Policies para alimentacao_refeicoes

```sql
-- ==========================================
-- RLS: Configurar segurança para refeições
-- Data: 2025-10-19
-- ==========================================

-- Habilitar RLS (se ainda não estiver)
ALTER TABLE alimentacao_refeicoes ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can view their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can insert their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can update their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can delete their own meals" ON alimentacao_refeicoes;

-- Criar policies
CREATE POLICY "Users can view their own meals"
  ON alimentacao_refeicoes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
  ON alimentacao_refeicoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON alimentacao_refeicoes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON alimentacao_refeicoes
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 4. Storage Policies

```sql
-- ==========================================
-- Storage: Configurar políticas de acesso
-- Data: 2025-10-19
-- ==========================================

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Upload policy
CREATE POLICY "Users can upload their own photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- View policy
CREATE POLICY "Users can view their own photos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Delete policy
CREATE POLICY "Users can delete their own photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update policy (para sobrescrever)
CREATE POLICY "Users can update their own photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 🎯 Prioridades de Ação

### 🔴 Urgente (Fazer Imediatamente):
1. **Verificar RLS** - Executar queries para confirmar se RLS está ativo
2. **Aplicar policies** - Executar script SQL de RLS
3. **Configurar Storage policies** - Proteger acesso às fotos

### 🟡 Importante (Próximas 2 semanas):
4. **Implementar persistência do Planejador** - Criar tabela e CRUD
5. **Implementar persistência de Hidratação** - Criar tabela e histórico
6. **Adicionar paginação** - Melhorar performance

### 🟢 Melhorias (Backlog):
7. **Otimizar preview de imagens**
8. **Adicionar job de limpeza**
9. **Implementar retry automático**
10. **Adicionar telemetria**

---

## 📈 Métricas de Qualidade

| Aspecto | Status | Nota |
|---------|--------|------|
| Integração Supabase | ⚠️ Parcial | 6/10 |
| Segurança (RLS) | ⚠️ Não verificado | ?/10 |
| Real-time Sync | ✅ Bom | 8/10 |
| Storage | ✅ Bom | 7/10 |
| UX/Feedback | ✅ Bom | 8/10 |
| Tratamento de Erros | ✅ Bom | 8/10 |
| Documentação | ⚠️ Parcial | 5/10 |
| Testes | ❌ Ausente | 0/10 |

**Nota Geral: 6.5/10** - Boa base, mas precisa completar implementação

---

## 📚 Referências

- [Documentação Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Best Practices - Supabase](https://supabase.com/docs/guides/database/best-practices)

---

## 📧 Contato

Para dúvidas sobre esta auditoria, consulte a documentação do projeto ou abra uma issue no repositório.

---

**Última atualização:** 19 de outubro de 2025
