-- ==========================================
-- ROLLBACK: Migration 002 - Alimentação Completa
-- Versão: 002
-- Data: 2025-10-19
-- Descrição: Reverter todas as alterações da migration 002
-- ==========================================

-- ATENÇÃO: Este script remove tabelas e dados!
-- Execute apenas se tiver certeza que deseja reverter a migration.
-- Faça backup antes de executar!

-- ==========================================
-- PARTE 1: Remover Views
-- ==========================================

DROP VIEW IF EXISTS alimentacao_hidratacao_stats CASCADE;
DROP VIEW IF EXISTS alimentacao_refeicoes_resumo CASCADE;

-- ==========================================
-- PARTE 2: Remover Funções
-- ==========================================

DROP FUNCTION IF EXISTS find_orphaned_photos() CASCADE;
-- DROP FUNCTION IF EXISTS create_default_meal_plan() CASCADE; -- Descomente se criou

-- ==========================================
-- PARTE 3: Remover Storage Policies
-- ==========================================

DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;

-- Nota: O bucket 'user-photos' não é removido pois pode conter dados de outros módulos
-- Se desejar remover o bucket completamente, execute manualmente:
-- DELETE FROM storage.objects WHERE bucket_id = 'user-photos';
-- DELETE FROM storage.buckets WHERE id = 'user-photos';

-- ==========================================
-- PARTE 4: Remover Tabela de Hidratação
-- ==========================================

-- Remover triggers
DROP TRIGGER IF EXISTS update_alimentacao_hidratacao_updated_at ON alimentacao_hidratacao;

-- Remover policies
DROP POLICY IF EXISTS "Users can view their hydration data" ON alimentacao_hidratacao;
DROP POLICY IF EXISTS "Users can insert their hydration data" ON alimentacao_hidratacao;
DROP POLICY IF EXISTS "Users can update their hydration data" ON alimentacao_hidratacao;
DROP POLICY IF EXISTS "Users can delete their hydration data" ON alimentacao_hidratacao;

-- Desabilitar RLS
ALTER TABLE IF EXISTS alimentacao_hidratacao DISABLE ROW LEVEL SECURITY;

-- Remover tabela
DROP TABLE IF EXISTS alimentacao_hidratacao CASCADE;

-- ==========================================
-- PARTE 5: Remover Tabela de Planejamento
-- ==========================================

-- Remover triggers
DROP TRIGGER IF EXISTS update_alimentacao_planejamento_updated_at ON alimentacao_planejamento;

-- Remover policies
DROP POLICY IF EXISTS "Users can view their meal plans" ON alimentacao_planejamento;
DROP POLICY IF EXISTS "Users can insert their meal plans" ON alimentacao_planejamento;
DROP POLICY IF EXISTS "Users can update their meal plans" ON alimentacao_planejamento;
DROP POLICY IF EXISTS "Users can delete their meal plans" ON alimentacao_planejamento;

-- Desabilitar RLS
ALTER TABLE IF EXISTS alimentacao_planejamento DISABLE ROW LEVEL SECURITY;

-- Remover tabela
DROP TABLE IF EXISTS alimentacao_planejamento CASCADE;

-- ==========================================
-- PARTE 6: Reverter RLS em alimentacao_refeicoes
-- ==========================================

-- Remover policies criadas pela migration
DROP POLICY IF EXISTS "Users can view their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can insert their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can update their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can delete their own meals" ON alimentacao_refeicoes;

-- Desabilitar RLS (se não estava ativo antes)
-- ATENÇÃO: Só execute se tinha certeza que RLS não estava ativo antes!
-- ALTER TABLE alimentacao_refeicoes DISABLE ROW LEVEL SECURITY;

-- Remover índices criados pela migration
DROP INDEX IF EXISTS idx_alimentacao_refeicoes_user_data;
DROP INDEX IF EXISTS idx_alimentacao_refeicoes_created;

-- ==========================================
-- PARTE 7: Remover função de trigger (opcional)
-- ==========================================

-- Nota: Só remova se esta função não for usada por outras tabelas!
-- Verifique antes de executar:
-- SELECT DISTINCT trigger_name, event_object_table 
-- FROM information_schema.triggers 
-- WHERE action_statement LIKE '%update_updated_at_column%';

-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ==========================================
-- VERIFICAÇÕES FINAIS
-- ==========================================

-- Verificar tabelas restantes
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'alimentacao%';

-- Verificar policies restantes
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'alimentacao%';

-- ==========================================
-- FIM DO ROLLBACK
-- ==========================================

RAISE NOTICE 'Rollback da migration 002 concluído.';
RAISE NOTICE 'Tabela alimentacao_refeicoes mantida (apenas policies e índices removidos).';
RAISE NOTICE 'Tabelas alimentacao_planejamento e alimentacao_hidratacao removidas.';
RAISE NOTICE 'Storage bucket user-photos mantido (pode conter dados de outros módulos).';
