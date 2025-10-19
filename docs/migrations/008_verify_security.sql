-- ==========================================
-- Verificação: Script para validar configurações de segurança
-- Data: 19 de outubro de 2025
-- Descrição: Verifica se RLS e policies estão configurados corretamente
-- ==========================================

-- 1. Verificar se RLS está habilitado nas tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN (
  'alimentacao_refeicoes',
  'alimentacao_planejamento',
  'alimentacao_hidratacao'
)
ORDER BY tablename;

-- 2. Listar todas as policies das tabelas de alimentação
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename LIKE 'alimentacao_%'
ORDER BY tablename, policyname;

-- 3. Verificar policies do Storage
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%photo%'
ORDER BY policyname;

-- 4. Verificar configurações do bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'user-photos';

-- 5. Contar registros e verificar integridade
SELECT 
  'alimentacao_refeicoes' as tabela,
  COUNT(*) as total_registros,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  COUNT(foto_url) as registros_com_foto
FROM alimentacao_refeicoes
UNION ALL
SELECT 
  'alimentacao_planejamento',
  COUNT(*),
  COUNT(DISTINCT user_id),
  NULL
FROM alimentacao_planejamento
UNION ALL
SELECT 
  'alimentacao_hidratacao',
  COUNT(*),
  COUNT(DISTINCT user_id),
  NULL
FROM alimentacao_hidratacao;

-- 6. Verificar índices criados
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'alimentacao_%'
ORDER BY tablename, indexname;

-- 7. Listar fotos no Storage
SELECT 
  COUNT(*) as total_fotos,
  SUM((metadata->>'size')::bigint) as tamanho_total_bytes,
  ROUND(SUM((metadata->>'size')::bigint)::numeric / 1024 / 1024, 2) as tamanho_total_mb
FROM storage.objects
WHERE bucket_id = 'user-photos';

-- 8. Verificar fotos órfãs (opcional - pode demorar com muitos registros)
/*
SELECT 
  so.name as foto_orfã,
  so.created_at,
  (so.metadata->>'size')::bigint as tamanho_bytes
FROM storage.objects so
WHERE so.bucket_id = 'user-photos'
  AND NOT EXISTS (
    SELECT 1 
    FROM alimentacao_refeicoes ar 
    WHERE ar.foto_url LIKE '%' || so.name || '%'
  )
ORDER BY so.created_at DESC
LIMIT 10;
*/
