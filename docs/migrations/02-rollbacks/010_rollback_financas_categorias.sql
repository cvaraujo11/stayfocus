-- =====================================================
-- Rollback Migration: 010 - Remover Categorias de Finanças
-- Descrição: Remove a tabela de categorias e funções relacionadas
-- Data: 19/10/2025
-- =====================================================

-- AVISO: Este script irá remover PERMANENTEMENTE todos os dados de categorias
-- Faça backup antes de executar!

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO ROLLBACK DA MIGRATION 010';
    RAISE NOTICE '========================================';
END $$;

-- ======================================
-- 1. REMOVER TRIGGER
-- ======================================

DROP TRIGGER IF EXISTS on_auth_user_created_financas_categorias ON auth.users;
RAISE NOTICE 'Trigger removido';

-- ======================================
-- 2. REMOVER FUNÇÕES
-- ======================================

DROP FUNCTION IF EXISTS public.handle_new_user_financas_categorias();
RAISE NOTICE 'Função de trigger removida';

DROP FUNCTION IF EXISTS public.criar_categorias_financas_padrao(UUID);
RAISE NOTICE 'Função de criação de categorias padrão removida';

-- ======================================
-- 3. REMOVER POLÍTICAS RLS
-- ======================================

DROP POLICY IF EXISTS "Usuários podem visualizar suas categorias" ON public.financas_categorias;
DROP POLICY IF EXISTS "Usuários podem inserir suas categorias" ON public.financas_categorias;
DROP POLICY IF EXISTS "Usuários podem atualizar suas categorias" ON public.financas_categorias;
DROP POLICY IF EXISTS "Usuários podem deletar suas categorias" ON public.financas_categorias;
RAISE NOTICE 'Políticas RLS removidas';

-- ======================================
-- 4. REMOVER TABELA
-- ======================================

DROP TABLE IF EXISTS public.financas_categorias CASCADE;
RAISE NOTICE 'Tabela financas_categorias removida';

-- ======================================
-- VERIFICAÇÃO FINAL
-- ======================================

DO $$
BEGIN
    -- Verificar se a tabela foi realmente removida
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'financas_categorias'
    ) THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Rollback executado com sucesso!';
        RAISE NOTICE 'Tabela financas_categorias foi removida';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING 'ERRO: A tabela financas_categorias ainda existe!';
    END IF;
END $$;
