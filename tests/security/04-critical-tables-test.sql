-- ============================================
-- TESTE 4: Auditoria de Tabelas Críticas
-- ============================================
-- Objetivo: Verificar distribuição de dados sensíveis por usuário
-- Data: 2025-10-19

-- Verificar distribuição de dados de saúde
SELECT 
    'saude_medicamentos' as tabela,
    user_id,
    COUNT(*) as registros
FROM saude_medicamentos
GROUP BY user_id
UNION ALL
SELECT 
    'saude_tomadas_medicamentos' as tabela,
    user_id,
    COUNT(*) as registros
FROM saude_tomadas_medicamentos
GROUP BY user_id
UNION ALL
SELECT 
    'saude_registros_humor' as tabela,
    user_id,
    COUNT(*) as registros
FROM saude_registros_humor
GROUP BY user_id
ORDER BY tabela, user_id;

-- Verificar distribuição de dados financeiros
SELECT 
    'financas_transacoes' as tabela,
    user_id,
    COUNT(*) as registros,
    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receitas,
    SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesas
FROM financas_transacoes
GROUP BY user_id
UNION ALL
SELECT 
    'financas_envelopes' as tabela,
    user_id,
    COUNT(*) as registros,
    SUM(valor_alocado) as total_alocado,
    SUM(valor_utilizado) as total_utilizado
FROM financas_envelopes
GROUP BY user_id
ORDER BY tabela, user_id;

-- Verificar dados de alimentação e sono
SELECT 
    'alimentacao_refeicoes' as tabela,
    user_id,
    COUNT(*) as registros
FROM alimentacao_refeicoes
GROUP BY user_id
UNION ALL
SELECT 
    'sono_registros' as tabela,
    user_id,
    COUNT(*) as registros
FROM sono_registros
GROUP BY user_id
ORDER BY tabela, user_id;

-- Resumo geral de dados por usuário
SELECT 
    u.id as user_id,
    u.email,
    (SELECT COUNT(*) FROM saude_medicamentos WHERE user_id = u.id) as medicamentos,
    (SELECT COUNT(*) FROM financas_transacoes WHERE user_id = u.id) as transacoes,
    (SELECT COUNT(*) FROM alimentacao_refeicoes WHERE user_id = u.id) as refeicoes,
    (SELECT COUNT(*) FROM hiperfocos WHERE user_id = u.id) as hiperfocos,
    (SELECT COUNT(*) FROM prioridades WHERE user_id = u.id) as prioridades
FROM auth.users u
ORDER BY u.created_at;
