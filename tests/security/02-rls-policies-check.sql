-- ============================================
-- TESTE 2: Verificação de Políticas RLS
-- ============================================
-- Objetivo: Listar todas as políticas RLS existentes
-- Data: 2025-10-19

-- Verificar políticas RLS em todas as tabelas
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar quais tabelas têm RLS habilitado mas sem políticas
SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as num_policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.schemaname, t.tablename, t.rowsecurity
HAVING t.rowsecurity = true
ORDER BY num_policies ASC, t.tablename;
