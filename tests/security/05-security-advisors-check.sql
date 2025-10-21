-- ============================================
-- TESTE 5: Verificação de Vulnerabilidades
-- ============================================
-- Objetivo: Identificar problemas de segurança conhecidos
-- Data: 2025-10-19

-- Verificar tabelas sem políticas RLS
SELECT 
    'CRÍTICO: Tabela com RLS habilitado mas SEM políticas' as alerta,
    t.tablename,
    t.rowsecurity as rls_enabled
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
    AND t.rowsecurity = true
    AND p.policyname IS NULL
GROUP BY t.tablename, t.rowsecurity;

-- Verificar colunas sensíveis sem criptografia
SELECT 
    'AVISO: Coluna potencialmente sensível' as alerta,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND (
        column_name ILIKE '%senha%'
        OR column_name ILIKE '%password%'
        OR column_name ILIKE '%cpf%'
        OR column_name ILIKE '%cartao%'
        OR column_name ILIKE '%card%'
    )
ORDER BY table_name, column_name;

-- Verificar funções que podem bypassar RLS
SELECT 
    'AVISO: Função com SECURITY DEFINER' as alerta,
    n.nspname as schema,
    p.proname as function_name,
    pg_get_userbyid(p.proowner) as owner,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prosecdef = true
ORDER BY p.proname;

-- Verificar permissões em tabelas
SELECT 
    'INFO: Permissões de tabela' as tipo,
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT') as anon_can_select,
    has_table_privilege('authenticated', schemaname || '.' || tablename, 'SELECT') as auth_can_select
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename
LIMIT 10;
