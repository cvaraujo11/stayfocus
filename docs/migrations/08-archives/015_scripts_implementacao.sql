-- ============================================================================
-- SCRIPTS DE IMPLEMENTAÇÃO - STAYFOCUS
-- ============================================================================
-- Data: 19 de Outubro de 2025
-- Descrição: Scripts prontos para implementação de otimizações
-- IMPORTANTE: Executar em ordem e testar em ambiente de desenvolvimento primeiro
-- ============================================================================

-- ============================================================================
-- PARTE 1: CRIAÇÃO DE ÍNDICES CRÍTICOS
-- ============================================================================

-- Módulo Finanças
CREATE INDEX IF NOT EXISTS idx_financas_transacoes_user_data 
ON financas_transacoes(user_id, data DESC);

CREATE INDEX IF NOT EXISTS idx_financas_transacoes_categoria 
ON financas_transacoes(categoria_id) 
WHERE categoria_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financas_transacoes_tipo 
ON financas_transacoes(user_id, tipo, data DESC);

CREATE INDEX IF NOT EXISTS idx_financas_pagamentos_pendentes 
ON financas_pagamentos_recorrentes(user_id, pago, proximo_pagamento) 
WHERE pago = false;

-- Módulo Alimentação
CREATE INDEX IF NOT EXISTS idx_alimentacao_refeicoes_user_data 
ON alimentacao_refeicoes(user_id, data DESC, hora DESC);

CREATE INDEX IF NOT EXISTS idx_alimentacao_hidratacao_user_data 
ON alimentacao_hidratacao(user_id, data DESC);

CREATE INDEX IF NOT EXISTS idx_alimentacao_planejamento_ativo 
ON alimentacao_planejamento(user_id, ativo, dia_semana, ordem) 
WHERE ativo = true;

-- Módulo Saúde
CREATE INDEX IF NOT EXISTS idx_saude_medicamentos_ativos 
ON saude_medicamentos(user_id, ativo) 
WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_saude_tomadas_medicamento_data 
ON saude_tomadas_medicamentos(medicamento_id, data_hora DESC);

CREATE INDEX IF NOT EXISTS idx_saude_tomadas_user_data 
ON saude_tomadas_medicamentos(user_id, data_hora DESC);


CREATE INDEX IF NOT EXISTS idx_saude_humor_user_data 
ON saude_registros_humor(user_id, data DESC);

-- Módulo Hiperfocos
CREATE INDEX IF NOT EXISTS idx_hiperfocos_status 
ON hiperfocos(user_id, status, data_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_hiperfoco 
ON hiperfoco_tarefas(hiperfoco_id, ordem);

CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_pai 
ON hiperfoco_tarefas(tarefa_pai_id, ordem) 
WHERE tarefa_pai_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_pendentes 
ON hiperfoco_tarefas(user_id, concluida) 
WHERE concluida = false;

-- Módulo Estudos
CREATE INDEX IF NOT EXISTS idx_estudos_concursos_status 
ON estudos_concursos(user_id, status, data_prova);

CREATE INDEX IF NOT EXISTS idx_estudos_questoes_concurso 
ON estudos_questoes(concurso_id);

CREATE INDEX IF NOT EXISTS idx_estudos_questoes_disciplina 
ON estudos_questoes(user_id, disciplina);

CREATE INDEX IF NOT EXISTS idx_estudos_simulados_concurso 
ON estudos_simulados(concurso_id, data_realizacao DESC);

CREATE INDEX IF NOT EXISTS idx_estudos_registros_data 
ON estudos_registros(user_id, data DESC);

-- Módulo Produtividade
CREATE INDEX IF NOT EXISTS idx_prioridades_user_data 
ON prioridades(user_id, data DESC, nivel_prioridade);

CREATE INDEX IF NOT EXISTS idx_prioridades_pendentes 
ON prioridades(user_id, concluida, data DESC) 
WHERE concluida = false;

CREATE INDEX IF NOT EXISTS idx_blocos_tempo_user_data 
ON blocos_tempo(user_id, data, hora);

CREATE INDEX IF NOT EXISTS idx_pomodoro_user_data 
ON pomodoro_sessoes(user_id, data DESC, tipo);

-- ============================================================================
-- PARTE 2: TABELA DE AUDITORIA
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data jsonb,
    new_data jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user 
ON audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_table 
ON audit_log(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created 
ON audit_log(created_at DESC);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
ON audit_log FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- PARTE 3: FUNÇÃO DE AUDITORIA
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, user_id, action, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, OLD.user_id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, user_id, action, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, NEW.user_id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, user_id, action, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, NEW.user_id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTE 4: APLICAR AUDITORIA EM TABELAS CRÍTICAS
-- ============================================================================

-- Finanças
CREATE TRIGGER trg_audit_financas_transacoes
AFTER INSERT OR UPDATE OR DELETE ON financas_transacoes
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER trg_audit_financas_categorias
AFTER INSERT OR UPDATE OR DELETE ON financas_categorias
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Saúde
CREATE TRIGGER trg_audit_saude_medicamentos
AFTER INSERT OR UPDATE OR DELETE ON saude_medicamentos
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER trg_audit_saude_tomadas
AFTER INSERT OR UPDATE OR DELETE ON saude_tomadas_medicamentos
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Hiperfocos
CREATE TRIGGER trg_audit_hiperfocos
AFTER INSERT OR UPDATE OR DELETE ON hiperfocos
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- PARTE 5: VALIDAÇÃO DE INTERVALO DE MEDICAMENTOS
-- ============================================================================

CREATE OR REPLACE FUNCTION validar_intervalo_medicamento()
RETURNS TRIGGER AS $$
DECLARE
    v_intervalo_minutos integer;
    v_ultima_tomada timestamptz;
BEGIN
    -- Buscar intervalo mínimo do medicamento
    SELECT intervalo_minutos INTO v_intervalo_minutos
    FROM saude_medicamentos
    WHERE id = NEW.medicamento_id AND ativo = true;
    
    -- Se medicamento não existe ou não está ativo, rejeitar
    IF v_intervalo_minutos IS NULL THEN
        RAISE EXCEPTION 'Medicamento não encontrado ou inativo';
    END IF;
    
    -- Buscar última tomada
    SELECT MAX(data_hora) INTO v_ultima_tomada
    FROM saude_tomadas_medicamentos
    WHERE medicamento_id = NEW.medicamento_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    -- Validar intervalo
    IF v_ultima_tomada IS NOT NULL AND 
       NEW.data_hora < v_ultima_tomada + (v_intervalo_minutos || ' minutes')::interval THEN
        RAISE EXCEPTION 'Intervalo mínimo de % minutos entre doses não respeitado. Última tomada: %', 
                        v_intervalo_minutos, v_ultima_tomada;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_intervalo_medicamento
BEFORE INSERT OR UPDATE ON saude_tomadas_medicamentos
FOR EACH ROW EXECUTE FUNCTION validar_intervalo_medicamento();

-- ============================================================================
-- PARTE 6: FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para calcular saldo financeiro
CREATE OR REPLACE FUNCTION calcular_saldo_usuario(
    p_user_id uuid, 
    p_data_inicio date DEFAULT NULL, 
    p_data_fim date DEFAULT NULL
)
RETURNS TABLE(receitas numeric, despesas numeric, saldo numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as receitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as despesas,
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM financas_transacoes
    WHERE user_id = p_user_id
      AND (p_data_inicio IS NULL OR data >= p_data_inicio)
      AND (p_data_fim IS NULL OR data <= p_data_fim);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para obter progresso de hiperfoco
CREATE OR REPLACE FUNCTION progresso_hiperfoco(p_hiperfoco_id uuid)
RETURNS TABLE(
    total_tarefas bigint,
    tarefas_concluidas bigint,
    percentual_conclusao numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tarefas,
        COUNT(CASE WHEN concluida THEN 1 END) as tarefas_concluidas,
        ROUND((COUNT(CASE WHEN concluida THEN 1 END)::numeric / 
               NULLIF(COUNT(*), 0) * 100), 2) as percentual_conclusao
    FROM hiperfoco_tarefas
    WHERE hiperfoco_id = p_hiperfoco_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para verificar meta de hidratação
CREATE OR REPLACE FUNCTION verificar_meta_hidratacao(p_user_id uuid, p_data date DEFAULT CURRENT_DATE)
RETURNS TABLE(
    copos_bebidos integer,
    meta_diaria integer,
    percentual numeric,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ah.copos_bebidos,
        ah.meta_diaria,
        ROUND((ah.copos_bebidos::numeric / NULLIF(ah.meta_diaria, 0) * 100), 2) as percentual,
        CASE 
            WHEN ah.copos_bebidos >= ah.meta_diaria THEN 'Meta atingida'
            WHEN ah.copos_bebidos >= ah.meta_diaria * 0.7 THEN 'Quase lá'
            ELSE 'Abaixo da meta'
        END as status
    FROM alimentacao_hidratacao ah
    WHERE ah.user_id = p_user_id AND ah.data = p_data;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- PARTE 7: VIEWS ÚTEIS
-- ============================================================================

-- View de resumo financeiro mensal
CREATE OR REPLACE VIEW v_financas_resumo_mensal AS
SELECT 
    user_id,
    DATE_TRUNC('month', data) as mes,
    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
    SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas,
    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END) as saldo,
    COUNT(*) as total_transacoes
FROM financas_transacoes
GROUP BY user_id, DATE_TRUNC('month', data);

-- View de hiperfocos com progresso
CREATE OR REPLACE VIEW v_hiperfocos_progresso AS
SELECT 
    h.id,
    h.user_id,
    h.titulo,
    h.descricao,
    h.data_inicio,
    h.data_fim,
    h.intensidade,
    h.status,
    COUNT(ht.id) as total_tarefas,
    COUNT(CASE WHEN ht.concluida THEN 1 END) as tarefas_concluidas,
    ROUND((COUNT(CASE WHEN ht.concluida THEN 1 END)::numeric / 
           NULLIF(COUNT(ht.id), 0) * 100), 2) as percentual_conclusao
FROM hiperfocos h
LEFT JOIN hiperfoco_tarefas ht ON ht.hiperfoco_id = h.id
GROUP BY h.id, h.user_id, h.titulo, h.descricao, h.data_inicio, h.data_fim, h.intensidade, h.status;

-- View de medicamentos com próxima tomada
CREATE OR REPLACE VIEW v_medicamentos_proxima_tomada AS
SELECT 
    sm.id,
    sm.user_id,
    sm.nome,
    sm.dosagem,
    sm.horarios,
    sm.intervalo_minutos,
    MAX(stm.data_hora) as ultima_tomada,
    MAX(stm.data_hora) + (sm.intervalo_minutos || ' minutes')::interval as proxima_tomada_permitida
FROM saude_medicamentos sm
LEFT JOIN saude_tomadas_medicamentos stm ON stm.medicamento_id = sm.id
WHERE sm.ativo = true
GROUP BY sm.id, sm.user_id, sm.nome, sm.dosagem, sm.horarios, sm.intervalo_minutos;

-- ============================================================================
-- PARTE 8: POLÍTICAS RLS DETALHADAS
-- ============================================================================

-- Exemplo completo para financas_transacoes
-- (Replicar padrão para outras tabelas)

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own transactions" ON financas_transacoes;
DROP POLICY IF EXISTS "Users can insert own transactions" ON financas_transacoes;
DROP POLICY IF EXISTS "Users can update own transactions" ON financas_transacoes;
DROP POLICY IF EXISTS "Users can delete own transactions" ON financas_transacoes;

-- Criar políticas detalhadas
CREATE POLICY "Users can view own transactions"
ON financas_transacoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON financas_transacoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
ON financas_transacoes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
ON financas_transacoes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- PARTE 9: FUNÇÃO DE LIMPEZA DE DADOS ANTIGOS
-- ============================================================================

CREATE OR REPLACE FUNCTION limpar_dados_antigos()
RETURNS void AS $$
BEGIN
    -- Limpar logs de auditoria com mais de 1 ano
    DELETE FROM audit_log 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Adicionar outras limpezas conforme necessário
    
    RAISE NOTICE 'Limpeza de dados antigos concluída';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTE 10: FUNÇÃO DE VERIFICAÇÃO DE SAÚDE DO BANCO
-- ============================================================================

CREATE OR REPLACE FUNCTION verificar_saude_banco()
RETURNS TABLE(
    categoria text,
    item text,
    valor text,
    status text
) AS $$
BEGIN
    RETURN QUERY
    -- Tamanho das tabelas
    SELECT 
        'Tamanho'::text as categoria,
        t.tablename::text as item,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) as valor,
        CASE 
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 1073741824 THEN 'CRÍTICO'
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 536870912 THEN 'ATENÇÃO'
            ELSE 'OK'
        END as status
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    
    UNION ALL
    
    -- Índices não utilizados
    SELECT 
        'Índices'::text,
        indexname::text,
        'Não utilizado'::text,
        'ATENÇÃO'::text
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
      AND schemaname = 'public'
    LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FIM DOS SCRIPTS DE IMPLEMENTAÇÃO
-- ============================================================================

-- Para executar a verificação de saúde:
-- SELECT * FROM verificar_saude_banco();

-- Para limpar dados antigos:
-- SELECT limpar_dados_antigos();

-- Para calcular saldo de um usuário:
-- SELECT * FROM calcular_saldo_usuario('user-uuid-here', '2025-01-01', '2025-12-31');
