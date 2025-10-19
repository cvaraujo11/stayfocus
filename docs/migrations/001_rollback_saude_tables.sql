-- ============================================================================
-- Script de Rollback: Módulo de Saúde
-- Data: 19/10/2025
-- Descrição: Remove todas as tabelas, views, functions e políticas RLS
--            relacionadas ao módulo de saúde
-- ============================================================================

-- ATENÇÃO: Este script irá DELETAR PERMANENTEMENTE todos os dados do módulo
--          de saúde. Use apenas se necessário e certifique-se de ter um backup!

-- ============================================================================
-- 1. REMOVER VIEWS
-- ============================================================================

DROP VIEW IF EXISTS v_proximas_tomadas CASCADE;
DROP VIEW IF EXISTS v_estatisticas_humor_mensal CASCADE;

-- ============================================================================
-- 2. REMOVER FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS calcular_adesao_medicamento(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS calcular_tendencia_humor(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- 3. REMOVER TABELAS (ordem importante por causa das foreign keys)
-- ============================================================================

DROP TABLE IF EXISTS saude_tomadas_medicamentos CASCADE;
DROP TABLE IF EXISTS saude_registros_humor CASCADE;
DROP TABLE IF EXISTS saude_medicamentos CASCADE;

-- ============================================================================
-- 4. VERIFICAÇÃO
-- ============================================================================

SELECT 'Rollback executado com sucesso!' as status;

-- Verificar se as tabelas foram removidas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'saude_%'
ORDER BY table_name;

-- Se a query acima não retornar nenhum resultado, o rollback foi bem-sucedido
