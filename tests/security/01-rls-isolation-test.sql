-- ============================================
-- TESTE 1: Isolamento RLS entre Usuários
-- ============================================
-- Objetivo: Verificar se um usuário consegue acessar dados de outro
-- Data: 2025-10-19

-- Criar dois usuários de teste temporários
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
BEGIN
    -- Inserir dados de teste para user1
    SELECT id INTO user1_id FROM auth.users LIMIT 1;
    
    -- Inserir dados de teste para user2 (segundo usuário)
    SELECT id INTO user2_id FROM auth.users OFFSET 1 LIMIT 1;
    
    RAISE NOTICE 'User 1 ID: %', user1_id;
    RAISE NOTICE 'User 2 ID: %', user2_id;
    
    -- Inserir dados de teste em tabelas críticas
    INSERT INTO saude_medicamentos (user_id, nome, dosagem, horarios)
    VALUES 
        (user1_id, 'Medicamento Teste User1', '10mg', ARRAY['08:00']),
        (user2_id, 'Medicamento Teste User2', '20mg', ARRAY['09:00']);
    
    INSERT INTO financas_transacoes (user_id, data, valor, descricao, tipo)
    VALUES 
        (user1_id, CURRENT_DATE, 100.00, 'Transação User1', 'receita'),
        (user2_id, CURRENT_DATE, 200.00, 'Transação User2', 'despesa');
    
    RAISE NOTICE 'Dados de teste inseridos com sucesso';
END $$;

-- Verificar total de registros (deve mostrar todos como admin)
SELECT 
    'saude_medicamentos' as tabela,
    COUNT(*) as total_registros
FROM saude_medicamentos
UNION ALL
SELECT 
    'financas_transacoes' as tabela,
    COUNT(*) as total_registros
FROM financas_transacoes;
