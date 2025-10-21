-- ============================================
-- CORREÇÃO DE VULNERABILIDADES CRÍTICAS
-- ============================================
-- Data: 2025-10-19
-- Prioridade: CRÍTICA
-- Executar IMEDIATAMENTE

-- ============================================
-- 1. CORRIGIR VIEWS COM SECURITY DEFINER
-- ============================================
-- Problema: Views executam com permissões do criador (postgres)
-- Solução: Usar SECURITY INVOKER (permissões do usuário)

-- View 1: v_hiperfocos_progresso
ALTER VIEW v_hiperfocos_progresso SET (security_invoker = on);

-- View 2: v_estatisticas_humor_mensal
ALTER VIEW v_estatisticas_humor_mensal SET (security_invoker = on);

-- View 3: v_financas_resumo_mensal
ALTER VIEW v_financas_resumo_mensal SET (security_invoker = on);

-- View 4: v_medicamentos_proxima_tomada
ALTER VIEW v_medicamentos_proxima_tomada SET (security_invoker = on);

-- View 5: v_proximas_tomadas
ALTER VIEW v_proximas_tomadas SET (security_invoker = on);

-- ============================================
-- 2. FIXAR SEARCH_PATH EM FUNÇÕES SECURITY DEFINER
-- ============================================
-- Problema: Funções podem ser exploradas via search_path injection
-- Solução: Definir search_path fixo

-- Funções de cálculo
ALTER FUNCTION calcular_adesao_medicamento(uuid, date, date) 
SET search_path = public, pg_temp;

ALTER FUNCTION calcular_tendencia_humor(uuid, integer) 
SET search_path = public, pg_temp;

ALTER FUNCTION calcular_saldo_usuario(uuid) 
SET search_path = public, pg_temp;

ALTER FUNCTION progresso_hiperfoco(uuid) 
SET search_path = public, pg_temp;

-- Funções de verificação
ALTER FUNCTION verificar_meta_hidratacao(uuid, date) 
SET search_path = public, pg_temp;

ALTER FUNCTION verificar_saude_banco() 
SET search_path = public, pg_temp;

ALTER FUNCTION validar_intervalo_medicamento() 
SET search_path = public, pg_temp;

-- Funções de manutenção
ALTER FUNCTION limpar_dados_antigos() 
SET search_path = public, pg_temp;

ALTER FUNCTION find_orphaned_photos() 
SET search_path = public, pg_temp;

-- Funções de trigger
ALTER FUNCTION update_updated_at_column() 
SET search_path = public, pg_temp;

ALTER FUNCTION update_blocos_tempo_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION update_hiperfoco_tarefas_updated_at() 
SET search_path = public, pg_temp;

ALTER FUNCTION audit_trigger_func() 
SET search_path = public, pg_temp;

-- Funções de inicialização
ALTER FUNCTION criar_categorias_financas_padrao() 
SET search_path = public, pg_temp;

ALTER FUNCTION handle_new_user_financas_categorias() 
SET search_path = public, pg_temp;

-- ============================================
-- 3. VERIFICAÇÃO PÓS-CORREÇÃO
-- ============================================

-- Verificar se views ainda têm SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views
WHERE schemaname = 'public'
    AND viewname IN (
        'v_hiperfocos_progresso',
        'v_estatisticas_humor_mensal',
        'v_financas_resumo_mensal',
        'v_medicamentos_proxima_tomada',
        'v_proximas_tomadas'
    );

-- Verificar se funções têm search_path fixo
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    p.proconfig as config_settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prosecdef = true
ORDER BY p.proname;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Após executar este script:
-- ✅ 5 views corrigidas (SECURITY INVOKER)
-- ✅ 15 funções com search_path fixo
-- ✅ Vulnerabilidades críticas resolvidas
