-- =====================================================
-- QUERIES DE VERIFICAÇÃO - Categorias de Finanças
-- =====================================================
-- Use estas queries para verificar a implementação das categorias
-- de finanças no Supabase

-- ======================================
-- 1. VERIFICAR ESTRUTURA DA TABELA
-- ======================================

-- Ver detalhes da tabela financas_categorias
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'financas_categorias'
ORDER BY ordinal_position;

-- Ver constraints da tabela
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
AND tc.table_name = 'financas_categorias';

-- Ver índices da tabela
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'financas_categorias';

-- ======================================
-- 2. VERIFICAR POLÍTICAS RLS
-- ======================================

-- Verificar se RLS está habilitado
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'financas_categorias';

-- Listar todas as políticas RLS
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
WHERE tablename = 'financas_categorias'
ORDER BY policyname;

-- ======================================
-- 3. VERIFICAR FUNÇÕES
-- ======================================

-- Listar funções relacionadas a categorias
SELECT
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%categorias%financas%'
ORDER BY routine_name;

-- Ver código da função criar_categorias_financas_padrao
SELECT 
    pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'criar_categorias_financas_padrao';

-- Ver código da função do trigger
SELECT 
    pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user_financas_categorias';

-- ======================================
-- 4. VERIFICAR TRIGGERS
-- ======================================

-- Listar triggers relacionados a categorias
SELECT
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%financas_categorias%'
ORDER BY trigger_name;

-- ======================================
-- 5. ESTATÍSTICAS DAS CATEGORIAS
-- ======================================

-- Total de categorias no sistema
SELECT COUNT(*) AS total_categorias
FROM financas_categorias;

-- Total de usuários com categorias
SELECT COUNT(DISTINCT user_id) AS usuarios_com_categorias
FROM financas_categorias;

-- Média de categorias por usuário
SELECT 
    ROUND(AVG(categoria_count), 2) AS media_categorias_por_usuario
FROM (
    SELECT user_id, COUNT(*) AS categoria_count
    FROM financas_categorias
    GROUP BY user_id
) AS subquery;

-- Distribuição de categorias por usuário
SELECT
    categoria_count,
    COUNT(*) AS usuarios_com_essa_quantidade
FROM (
    SELECT user_id, COUNT(*) AS categoria_count
    FROM financas_categorias
    GROUP BY user_id
) AS subquery
GROUP BY categoria_count
ORDER BY categoria_count;

-- Categorias mais populares (por nome)
SELECT
    nome,
    COUNT(*) AS quantidade_usuarios
FROM financas_categorias
GROUP BY nome
ORDER BY quantidade_usuarios DESC
LIMIT 10;

-- ======================================
-- 6. LISTAR CATEGORIAS POR USUÁRIO
-- ======================================

-- Ver todas as categorias com informações do usuário
SELECT
    u.email AS usuario_email,
    c.id AS categoria_id,
    c.nome AS categoria_nome,
    c.cor,
    c.icone,
    c.created_at
FROM financas_categorias c
JOIN auth.users u ON u.id = c.user_id
ORDER BY u.email, c.created_at;

-- Ver categorias de um usuário específico (substitua o UUID)
-- SELECT
--     id,
--     nome,
--     cor,
--     icone,
--     created_at
-- FROM financas_categorias
-- WHERE user_id = 'COLOQUE-SEU-USER-ID-AQUI'
-- ORDER BY created_at;

-- ======================================
-- 7. VERIFICAR CATEGORIAS PADRÃO
-- ======================================

-- Verificar se as 8 categorias padrão existem
WITH categorias_padrao AS (
    SELECT unnest(ARRAY[
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Lazer',
        'Compras',
        'Educação',
        'Outros'
    ]) AS nome_esperado
)
SELECT
    cp.nome_esperado,
    COUNT(fc.id) AS usuarios_com_categoria
FROM categorias_padrao cp
LEFT JOIN financas_categorias fc ON fc.nome = cp.nome_esperado
GROUP BY cp.nome_esperado
ORDER BY usuarios_com_categoria DESC;

-- Verificar usuários sem alguma categoria padrão
WITH categorias_padrao AS (
    SELECT unnest(ARRAY[
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Lazer',
        'Compras',
        'Educação',
        'Outros'
    ]) AS nome_padrao
),
usuarios_categorias AS (
    SELECT DISTINCT
        u.id AS user_id,
        u.email,
        cp.nome_padrao
    FROM auth.users u
    CROSS JOIN categorias_padrao cp
)
SELECT
    uc.email,
    uc.nome_padrao AS categoria_faltante
FROM usuarios_categorias uc
LEFT JOIN financas_categorias fc 
    ON fc.user_id = uc.user_id 
    AND fc.nome = uc.nome_padrao
WHERE fc.id IS NULL
ORDER BY uc.email, uc.nome_padrao;

-- ======================================
-- 8. TESTAR INTEGRIDADE DOS DADOS
-- ======================================

-- Verificar se há categorias órfãs (sem usuário)
SELECT
    c.id,
    c.nome,
    c.user_id,
    c.created_at
FROM financas_categorias c
LEFT JOIN auth.users u ON u.id = c.user_id
WHERE u.id IS NULL;

-- Verificar se há nomes vazios ou inválidos
SELECT
    id,
    nome,
    char_length(nome) AS tamanho_nome
FROM financas_categorias
WHERE nome IS NULL
OR char_length(nome) < 1
OR char_length(nome) > 50;

-- Verificar se há cores inválidas (não começam com #)
SELECT
    id,
    nome,
    cor
FROM financas_categorias
WHERE cor NOT LIKE '#%'
OR char_length(cor) NOT IN (4, 7); -- #RGB ou #RRGGBB

-- ======================================
-- 9. ANÁLISE DE USO DAS CATEGORIAS
-- ======================================

-- Categorias mais utilizadas em transações (se a tabela existir)
-- Descomente quando a tabela financas_transacoes estiver criada
/*
SELECT
    c.nome AS categoria,
    c.cor,
    COUNT(t.id) AS total_transacoes,
    SUM(CASE WHEN t.tipo = 'despesa' THEN 1 ELSE 0 END) AS despesas,
    SUM(CASE WHEN t.tipo = 'receita' THEN 1 ELSE 0 END) AS receitas,
    SUM(CASE WHEN t.tipo = 'despesa' THEN t.valor ELSE 0 END) AS total_despesas,
    SUM(CASE WHEN t.tipo = 'receita' THEN t.valor ELSE 0 END) AS total_receitas
FROM financas_categorias c
LEFT JOIN financas_transacoes t ON t.categoria_id = c.id
GROUP BY c.id, c.nome, c.cor
ORDER BY total_transacoes DESC;
*/

-- Categorias sem uso (não têm transações)
-- Descomente quando a tabela financas_transacoes estiver criada
/*
SELECT
    c.id,
    u.email,
    c.nome,
    c.cor,
    c.created_at
FROM financas_categorias c
JOIN auth.users u ON u.id = c.user_id
LEFT JOIN financas_transacoes t ON t.categoria_id = c.id
WHERE t.id IS NULL
ORDER BY c.created_at DESC;
*/

-- ======================================
-- 10. FUNÇÕES AUXILIARES PARA TESTES
-- ======================================

-- Criar categorias para um usuário específico (teste manual)
-- SELECT criar_categorias_financas_padrao('COLOQUE-SEU-USER-ID-AQUI');

-- Contar categorias de um usuário específico
-- SELECT COUNT(*) AS total_categorias
-- FROM financas_categorias
-- WHERE user_id = 'COLOQUE-SEU-USER-ID-AQUI';

-- ======================================
-- 11. PERFORMANCE E OTIMIZAÇÃO
-- ======================================

-- Verificar uso dos índices
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS vezes_usado,
    idx_tup_read AS tuplas_lidas,
    idx_tup_fetch AS tuplas_buscadas
FROM pg_stat_user_indexes
WHERE tablename = 'financas_categorias'
ORDER BY idx_scan DESC;

-- Estatísticas da tabela
SELECT
    schemaname,
    tablename,
    n_live_tup AS linhas_ativas,
    n_dead_tup AS linhas_mortas,
    n_tup_ins AS inserções,
    n_tup_upd AS atualizações,
    n_tup_del AS deleções,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE tablename = 'financas_categorias';

-- ======================================
-- 12. LIMPEZA E MANUTENÇÃO
-- ======================================

-- Encontrar categorias duplicadas (mesmo nome e usuário)
SELECT
    user_id,
    nome,
    COUNT(*) AS quantidade
FROM financas_categorias
GROUP BY user_id, nome
HAVING COUNT(*) > 1;

-- Ver categorias mais antigas
SELECT
    u.email,
    c.nome,
    c.created_at,
    AGE(NOW(), c.created_at) AS idade
FROM financas_categorias c
JOIN auth.users u ON u.id = c.user_id
ORDER BY c.created_at ASC
LIMIT 10;

-- Ver categorias mais recentes
SELECT
    u.email,
    c.nome,
    c.created_at,
    AGE(NOW(), c.created_at) AS idade
FROM financas_categorias c
JOIN auth.users u ON u.id = c.user_id
ORDER BY c.created_at DESC
LIMIT 10;

-- =====================================================
-- FIM DAS QUERIES DE VERIFICAÇÃO
-- =====================================================

-- DICA: Copie e cole as queries individualmente no SQL Editor
-- do Supabase para testar cada verificação separadamente.
