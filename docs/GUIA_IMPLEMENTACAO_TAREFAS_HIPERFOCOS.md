# Guia de Implementação - Persistência de Tarefas em Hiperfocos

## 📋 Resumo das Alterações

Este guia documenta a implementação da **persistência de tarefas e subtarefas** para os hiperfocos no banco de dados Supabase.

### Problema Original
Os projetos de hiperfoco estavam sendo salvos **sem as tarefas** porque:
- A tabela `hiperfocos` não tinha campo para armazenar tarefas
- As tarefas eram armazenadas apenas em memória (client-side no Zustand)
- Ao recarregar a página, todas as tarefas eram perdidas

### Solução Implementada
Criação de uma tabela separada `hiperfoco_tarefas` com relacionamento 1:N com `hiperfocos`.

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `hiperfoco_tarefas`

```sql
CREATE TABLE public.hiperfoco_tarefas (
    id UUID PRIMARY KEY,
    hiperfoco_id UUID NOT NULL (FK -> hiperfocos),
    user_id UUID NOT NULL (FK -> auth.users),
    texto TEXT NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    tarefa_pai_id UUID NULL (FK -> hiperfoco_tarefas), -- Para subtarefas
    ordem INTEGER DEFAULT 0,
    cor TEXT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Características:**
- Suporta **tarefas principais** (tarefa_pai_id = NULL)
- Suporta **subtarefas** (tarefa_pai_id aponta para a tarefa pai)
- **Cascade delete**: Ao deletar hiperfoco, remove todas as tarefas
- **RLS habilitado**: Cada usuário vê apenas suas tarefas

---

## 🚀 Passo a Passo para Executar

### 1. Executar a Migration no Supabase

**Opção A: Via Dashboard do Supabase**
```bash
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: SQL Editor
4. Cole o conteúdo de: docs/migrations/009_create_hiperfoco_tarefas.sql
5. Clique em "Run"
```

**Opção B: Via CLI do Supabase**
```bash
# Se você tem o Supabase CLI instalado
supabase db push
```

**Opção C: Via psql (PostgreSQL CLI)**
```bash
psql -h <seu-host>.supabase.co -U postgres -d postgres -f docs/migrations/009_create_hiperfoco_tarefas.sql
```

### 2. Verificar se a Tabela foi Criada

Execute no SQL Editor:
```sql
-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'hiperfoco_tarefas'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'hiperfoco_tarefas';

-- Verificar relacionamentos
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'hiperfoco_tarefas';
```

### 3. Testar a Aplicação

```bash
# Instalar dependências (se necessário)
npm install

# Executar em modo de desenvolvimento
npm run dev

# Abrir no navegador
# http://localhost:3000/hiperfocos
```

### 4. Testar Funcionalidades

**Checklist de Testes:**
- [ ] Criar um novo hiperfoco com tarefas
- [ ] Verificar se as tarefas aparecem após recarregar a página
- [ ] Adicionar subtarefas a uma tarefa
- [ ] Marcar tarefas como concluídas/não concluídas
- [ ] Editar o texto de uma tarefa
- [ ] Remover uma tarefa (deve remover subtarefas também)
- [ ] Remover um hiperfoco (deve remover todas as tarefas)
- [ ] Verificar que usuários diferentes não veem tarefas uns dos outros

---

## 📁 Arquivos Modificados

### 1. Migrations SQL
- ✅ `docs/migrations/009_create_hiperfoco_tarefas.sql` - Criar tabela
- ✅ `docs/migrations/009_rollback_hiperfoco_tarefas.sql` - Reverter

### 2. Tipos TypeScript
- ✅ `app/types/database.ts` - Adicionado tipo `hiperfoco_tarefas`

### 3. Store (Zustand)
- ✅ `app/stores/hiperfocosStore.ts`
  - Adicionado `carregarTarefas()` - Carregar tarefas do banco
  - Modificado `adicionarTarefa()` - Agora persiste no banco (async)
  - Modificado `atualizarTarefa()` - Agora persiste no banco (async)
  - Modificado `toggleTarefaConcluida()` - Agora persiste no banco (async)
  - Modificado `removerTarefa()` - Agora persiste no banco (async)
  - Modificado `adicionarSubTarefa()` - Agora persiste no banco (async)
  - Modificado `atualizarSubTarefa()` - Agora persiste no banco (async)
  - Modificado `toggleSubTarefaConcluida()` - Agora persiste no banco (async)
  - Modificado `removerSubTarefa()` - Agora persiste no banco (async)

### 4. Componentes React
- ✅ `app/components/hiperfocos/ConversorInteresses.tsx`
  - Modificado para usar `await` ao adicionar tarefas
  
- ✅ `app/components/hiperfocos/VisualizadorProjetos.tsx`
  - Adicionado `useEffect` para carregar tarefas ao selecionar hiperfoco
  - Modificado handlers para usar `async/await`

---

## 🔄 Como Reverter (Rollback)

Se algo der errado, execute:

```sql
-- Arquivo: docs/migrations/009_rollback_hiperfoco_tarefas.sql
-- Isso irá remover a tabela e todos os dados relacionados
```

**⚠️ ATENÇÃO:** Isso irá **apagar todas as tarefas** salvas!

---

## 🔍 Queries Úteis para Debug

### Ver todas as tarefas de um usuário
```sql
SELECT 
    ht.id,
    ht.texto,
    ht.concluida,
    ht.tarefa_pai_id,
    h.titulo as hiperfoco_titulo
FROM hiperfoco_tarefas ht
JOIN hiperfocos h ON h.id = ht.hiperfoco_id
WHERE ht.user_id = '<seu-user-id>'
ORDER BY ht.ordem;
```

### Ver estrutura hierárquica (tarefas e subtarefas)
```sql
WITH RECURSIVE tarefa_tree AS (
    -- Tarefas principais
    SELECT 
        id,
        hiperfoco_id,
        texto,
        concluida,
        tarefa_pai_id,
        ordem,
        0 as nivel
    FROM hiperfoco_tarefas
    WHERE tarefa_pai_id IS NULL
    
    UNION ALL
    
    -- Subtarefas
    SELECT 
        ht.id,
        ht.hiperfoco_id,
        ht.texto,
        ht.concluida,
        ht.tarefa_pai_id,
        ht.ordem,
        tt.nivel + 1
    FROM hiperfoco_tarefas ht
    INNER JOIN tarefa_tree tt ON ht.tarefa_pai_id = tt.id
)
SELECT 
    REPEAT('  ', nivel) || texto as hierarquia,
    concluida,
    nivel
FROM tarefa_tree
ORDER BY hiperfoco_id, nivel, ordem;
```

### Contar tarefas por hiperfoco
```sql
SELECT 
    h.titulo,
    COUNT(CASE WHEN ht.tarefa_pai_id IS NULL THEN 1 END) as tarefas_principais,
    COUNT(CASE WHEN ht.tarefa_pai_id IS NOT NULL THEN 1 END) as subtarefas,
    COUNT(CASE WHEN ht.concluida = true THEN 1 END) as concluidas,
    COUNT(*) as total
FROM hiperfocos h
LEFT JOIN hiperfoco_tarefas ht ON h.id = ht.hiperfoco_id
GROUP BY h.id, h.titulo
ORDER BY h.created_at DESC;
```

---

## 📊 Diagrama de Relacionamentos

```
┌─────────────────┐
│   auth.users    │
│                 │
│  - id (PK)      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   hiperfocos    │
│                 │
│  - id (PK)      │
│  - user_id (FK) │
│  - titulo       │
│  - descricao    │
│  - status       │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│ hiperfoco_tarefas    │
│                      │
│  - id (PK)           │
│  - hiperfoco_id (FK) │──┐
│  - user_id (FK)      │  │
│  - texto             │  │
│  - concluida         │  │ Auto-referência
│  - tarefa_pai_id (FK)│◄─┘ para subtarefas
│  - ordem             │
└──────────────────────┘
```

---

## ✅ Checklist de Validação

- [ ] Migration executada com sucesso
- [ ] Tabela `hiperfoco_tarefas` criada
- [ ] Índices criados
- [ ] Políticas RLS configuradas
- [ ] Trigger `updated_at` funcionando
- [ ] Aplicação iniciada sem erros
- [ ] Criar hiperfoco com tarefas funciona
- [ ] Tarefas persistem após reload
- [ ] Subtarefas funcionam corretamente
- [ ] Edição de tarefas funciona
- [ ] Remoção de tarefas funciona
- [ ] Cascade delete funciona (remover hiperfoco remove tarefas)
- [ ] RLS funciona (isolamento entre usuários)

---

## 🐛 Solução de Problemas

### Erro: "relation hiperfoco_tarefas does not exist"
**Causa:** Migration não foi executada  
**Solução:** Execute o arquivo `009_create_hiperfoco_tarefas.sql`

### Erro: "permission denied for table hiperfoco_tarefas"
**Causa:** Políticas RLS não configuradas corretamente  
**Solução:** Verifique se o usuário está autenticado e se as políticas foram criadas

### Tarefas não aparecem após criar
**Causa:** Função `carregarTarefas()` não está sendo chamada  
**Solução:** Verifique os `useEffect` nos componentes

### Erro de TypeScript em database.ts
**Causa:** Tipos desatualizados  
**Solução:** Gere novamente os tipos com: `npx supabase gen types typescript`

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do navegador (F12 > Console)
2. Verifique os logs do Supabase (Dashboard > Logs)
3. Execute as queries de debug acima
4. Revise o checklist de validação

---

**Data de Implementação:** 19/10/2025  
**Versão da Migration:** 009  
**Status:** ✅ Implementado
