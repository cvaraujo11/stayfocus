# 🔍 Queries Úteis para Verificação - Módulo Alimentação

## Após Executar as Migrations

### 1. Verificar se as Tabelas Foram Criadas

```sql
-- Listar todas as tabelas de alimentação
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name LIKE 'alimentacao_%'
ORDER BY table_name;
```

**Resultado esperado:**
```
table_name                    | table_type
------------------------------|------------
alimentacao_hidratacao        | BASE TABLE
alimentacao_planejamento      | BASE TABLE
alimentacao_refeicoes         | BASE TABLE
```

---

### 2. Verificar se RLS Está Habilitado

```sql
-- Verificar RLS em todas as tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename LIKE 'alimentacao_%'
ORDER BY tablename;
```

**Resultado esperado:** Todas com `rls_enabled = true`

---

### 3. Verificar Policies Criadas

```sql
-- Listar todas as policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'CREATE'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
    WHEN cmd = 'ALL' THEN 'ALL'
  END as permission_type
FROM pg_policies
WHERE tablename LIKE 'alimentacao_%'
ORDER BY tablename, policyname;
```

**Resultado esperado:**
- `alimentacao_refeicoes`: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- `alimentacao_planejamento`: 1 policy (ALL)
- `alimentacao_hidratacao`: 1 policy (ALL)

---

### 4. Verificar Índices Criados

```sql
-- Listar índices das tabelas
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'alimentacao_%'
ORDER BY tablename, indexname;
```

---

### 5. Verificar Estrutura das Tabelas

#### alimentacao_planejamento
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'alimentacao_planejamento'
ORDER BY ordinal_position;
```

#### alimentacao_hidratacao
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'alimentacao_hidratacao'
ORDER BY ordinal_position;
```

---

### 6. Verificar Constraints

```sql
-- Verificar constraints (CHECK, UNIQUE, FK)
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name LIKE 'alimentacao_%'
ORDER BY tc.table_name, tc.constraint_type;
```

---

### 7. Verificar Triggers

```sql
-- Listar triggers (updated_at)
SELECT 
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table LIKE 'alimentacao_%'
ORDER BY event_object_table;
```

---

### 8. Verificar Storage Bucket e Policies

```sql
-- Verificar bucket user-photos
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'user-photos';

-- Verificar storage policies
SELECT 
  policyname,
  cmd AS operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'UPLOAD'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
  END as permission_type
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%photo%'
ORDER BY policyname;
```

---

## Queries de Teste com Dados

### 9. Contar Registros por Tabela

```sql
-- Total de registros
SELECT 
  'alimentacao_refeicoes' as tabela,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as usuarios
FROM alimentacao_refeicoes
UNION ALL
SELECT 
  'alimentacao_planejamento',
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM alimentacao_planejamento
UNION ALL
SELECT 
  'alimentacao_hidratacao',
  COUNT(*),
  COUNT(DISTINCT user_id)
FROM alimentacao_hidratacao;
```

---

### 10. Ver Últimos Registros por Tabela

#### Planejamento
```sql
SELECT 
  id,
  horario,
  descricao,
  dia_semana,
  ativo,
  created_at
FROM alimentacao_planejamento
ORDER BY created_at DESC
LIMIT 10;
```

#### Hidratação
```sql
SELECT 
  id,
  data,
  copos_bebidos,
  meta_diaria,
  ultimo_registro,
  created_at
FROM alimentacao_hidratacao
ORDER BY data DESC
LIMIT 10;
```

#### Refeições
```sql
SELECT 
  id,
  data,
  hora,
  descricao,
  foto_url IS NOT NULL as tem_foto,
  created_at
FROM alimentacao_refeicoes
ORDER BY data DESC, hora DESC
LIMIT 10;
```

---

### 11. Verificar Fotos no Storage

```sql
-- Total de fotos e espaço usado
SELECT 
  COUNT(*) as total_fotos,
  COUNT(DISTINCT (storage.foldername(name))[1]) as total_usuarios,
  ROUND(SUM((metadata->>'size')::bigint)::numeric / 1024 / 1024, 2) as tamanho_mb
FROM storage.objects
WHERE bucket_id = 'user-photos';

-- Fotos por usuário
SELECT 
  (storage.foldername(name))[1] as user_id,
  COUNT(*) as total_fotos,
  ROUND(SUM((metadata->>'size')::bigint)::numeric / 1024 / 1024, 2) as tamanho_mb
FROM storage.objects
WHERE bucket_id = 'user-photos'
GROUP BY (storage.foldername(name))[1]
ORDER BY total_fotos DESC;
```

---

### 12. Detectar Fotos Órfãs

```sql
-- Fotos que não têm registro correspondente
SELECT 
  so.name as foto_nome,
  (storage.foldername(so.name))[1] as user_id,
  so.created_at,
  ROUND(((so.metadata->>'size')::bigint)::numeric / 1024, 2) as tamanho_kb
FROM storage.objects so
WHERE so.bucket_id = 'user-photos'
  AND NOT EXISTS (
    SELECT 1 
    FROM alimentacao_refeicoes ar 
    WHERE ar.foto_url LIKE '%' || so.name || '%'
  )
ORDER BY so.created_at DESC
LIMIT 10;
```

---

### 13. Verificar Real-time Replication

```sql
-- Ver configuração de replication para real-time
SELECT 
  schemaname,
  tablename,
  attname as column_name
FROM pg_publication_tables pt
JOIN pg_attribute pa ON pa.attrelid = (pt.schemaname || '.' || pt.tablename)::regclass
WHERE tablename LIKE 'alimentacao_%'
ORDER BY tablename;
```

---

## Queries de Limpeza/Manutenção

### 14. Limpar Dados de Teste

```sql
-- ⚠️ CUIDADO: Remove TODOS os dados de teste
-- Descomentar apenas se necessário

-- DELETE FROM alimentacao_planejamento WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM alimentacao_hidratacao WHERE user_id = 'USER_ID_AQUI';
-- DELETE FROM alimentacao_refeicoes WHERE user_id = 'USER_ID_AQUI';
```

---

### 15. Resetar Sequências (se necessário)

```sql
-- Resetar IDs (raramente necessário)
-- SELECT setval('alimentacao_planejamento_id_seq', 1, false);
-- SELECT setval('alimentacao_hidratacao_id_seq', 1, false);
```

---

## Performance Checks

### 16. Verificar Uso de Índices

```sql
-- Estatísticas de uso dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename LIKE 'alimentacao_%'
ORDER BY tablename, idx_scan DESC;
```

---

### 17. Tamanho das Tabelas

```sql
-- Ver tamanho de cada tabela
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho,
  pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE tablename LIKE 'alimentacao_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎯 Checklist de Verificação Rápida

Execute esta query para verificar tudo de uma vez:

```sql
-- VERIFICAÇÃO COMPLETA
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verificar tabelas
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_name LIKE 'alimentacao_%';
  
  RAISE NOTICE '✓ Tabelas criadas: %', v_count;
  
  -- Verificar RLS
  SELECT COUNT(*) INTO v_count
  FROM pg_tables
  WHERE tablename LIKE 'alimentacao_%' AND rowsecurity = true;
  
  RAISE NOTICE '✓ Tabelas com RLS: %', v_count;
  
  -- Verificar policies
  SELECT COUNT(*) INTO v_count
  FROM pg_policies
  WHERE tablename LIKE 'alimentacao_%';
  
  RAISE NOTICE '✓ Policies criadas: %', v_count;
  
  -- Verificar índices
  SELECT COUNT(*) INTO v_count
  FROM pg_indexes
  WHERE tablename LIKE 'alimentacao_%';
  
  RAISE NOTICE '✓ Índices criados: %', v_count;
  
  RAISE NOTICE '✓ Verificação completa!';
END $$;
```

---

**Última atualização:** 19 de outubro de 2025
