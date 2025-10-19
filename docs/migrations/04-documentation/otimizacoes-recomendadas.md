# Otimizações e Melhores Práticas Recomendadas - StayFocus

**Data:** 19 de Outubro de 2025  
**Projeto:** StayFocus  
**Versão PostgreSQL:** 17.6.1.021

---

## Índice

1. [Índices Recomendados](#índices-recomendados)
2. [Otimizações de Performance](#otimizações-de-performance)
3. [Segurança e RLS](#segurança-e-rls)
4. [Backup e Recuperação](#backup-e-recuperação)
5. [Monitoramento](#monitoramento)
6. [Manutenção](#manutenção)

---

## 1. Índices Recomendados

### 1.1 Índices Críticos para Performance

#### Módulo Finanças

```sql
-- Transações por usuário e data (queries mais frequentes)
CREATE INDEX IF NOT EXISTS idx_financas_transacoes_user_data 
ON financas_transacoes(user_id, data DESC);

-- Transações por categoria
CREATE INDEX IF NOT EXISTS idx_financas_transacoes_categoria 
ON financas_transacoes(categoria_id) 
WHERE categoria_id IS NOT NULL;

-- Transações por tipo
CREATE INDEX IF NOT EXISTS idx_financas_transacoes_tipo 
ON financas_transacoes(user_id, tipo, data DESC);

-- Pagamentos recorrentes não pagos
CREATE INDEX IF NOT EXISTS idx_financas_pagamentos_pendentes 
ON financas_pagamentos_recorrentes(user_id, pago, proximo_pagamento) 
WHERE pago = false;
```

#### Módulo Alimentação

```sql
-- Refeições por usuário e data
CREATE INDEX IF NOT EXISTS idx_alimentacao_refeicoes_user_data 
ON alimentacao_refeicoes(user_id, data DESC, hora DESC);

-- Hidratação por usuário e data
CREATE INDEX IF NOT EXISTS idx_alimentacao_hidratacao_user_data 
ON alimentacao_hidratacao(user_id, data DESC);

-- Planejamento ativo
CREATE INDEX IF NOT EXISTS idx_alimentacao_planejamento_ativo 
ON alimentacao_planejamento(user_id, ativo, dia_semana, ordem) 
WHERE ativo = true;
```


#### Módulo Saúde

```sql
-- Medicamentos ativos
CREATE INDEX IF NOT EXISTS idx_saude_medicamentos_ativos 
ON saude_medicamentos(user_id, ativo) 
WHERE ativo = true;

-- Tomadas por medicamento e data
CREATE INDEX IF NOT EXISTS idx_saude_tomadas_medicamento_data 
ON saude_tomadas_medicamentos(medicamento_id, data_hora DESC);

-- Tomadas por usuário e data
CREATE INDEX IF NOT EXISTS idx_saude_tomadas_user_data 
ON saude_tomadas_medicamentos(user_id, data_hora DESC);

-- Registros de humor por data
CREATE INDEX IF NOT EXISTS idx_saude_humor_user_data 
ON saude_registros_humor(user_id, data DESC);
```

#### Módulo Hiperfocos

```sql
-- Hiperfocos ativos
CREATE INDEX IF NOT EXISTS idx_hiperfocos_status 
ON hiperfocos(user_id, status, data_inicio DESC);

-- Tarefas por hiperfoco
CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_hiperfoco 
ON hiperfoco_tarefas(hiperfoco_id, ordem);

-- Subtarefas
CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_pai 
ON hiperfoco_tarefas(tarefa_pai_id, ordem) 
WHERE tarefa_pai_id IS NOT NULL;

-- Tarefas pendentes
CREATE INDEX IF NOT EXISTS idx_hiperfoco_tarefas_pendentes 
ON hiperfoco_tarefas(user_id, concluida) 
WHERE concluida = false;
```


#### Módulo Estudos

```sql
-- Concursos em andamento
CREATE INDEX IF NOT EXISTS idx_estudos_concursos_status 
ON estudos_concursos(user_id, status, data_prova);

-- Questões por concurso
CREATE INDEX IF NOT EXISTS idx_estudos_questoes_concurso 
ON estudos_questoes(concurso_id);

-- Questões por disciplina
CREATE INDEX IF NOT EXISTS idx_estudos_questoes_disciplina 
ON estudos_questoes(user_id, disciplina);

-- Simulados por concurso
CREATE INDEX IF NOT EXISTS idx_estudos_simulados_concurso 
ON estudos_simulados(concurso_id, data_realizacao DESC);

-- Registros de estudo por data
CREATE INDEX IF NOT EXISTS idx_estudos_registros_data 
ON estudos_registros(user_id, data DESC);
```

#### Módulo Produtividade

```sql
-- Prioridades por data
CREATE INDEX IF NOT EXISTS idx_prioridades_user_data 
ON prioridades(user_id, data DESC, nivel_prioridade);

-- Prioridades pendentes
CREATE INDEX IF NOT EXISTS idx_prioridades_pendentes 
ON prioridades(user_id, concluida, data DESC) 
WHERE concluida = false;

-- Blocos de tempo por data
CREATE INDEX IF NOT EXISTS idx_blocos_tempo_user_data 
ON blocos_tempo(user_id, data, hora);

-- Sessões Pomodoro por data
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_data 
ON pomodoro_sessoes(user_id, data DESC, tipo);
```

---

## 2. Otimizações de Performance

### 2.1 Particionamento de Tabelas (Futuro)

Para tabelas com grande volume de dados históricos:

```sql
-- Exemplo: Particionar financas_transacoes por mês
-- (Implementar quando houver > 100k registros)

CREATE TABLE financas_transacoes_2025_10 
PARTITION OF financas_transacoes
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```


### 2.2 Materialized Views para Dashboards

```sql
-- View materializada para estatísticas financeiras
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_financas_resumo AS
SELECT 
    user_id,
    DATE_TRUNC('month', data) as mes,
    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
    SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas,
    COUNT(*) as total_transacoes
FROM financas_transacoes
GROUP BY user_id, DATE_TRUNC('month', data);

CREATE UNIQUE INDEX ON mv_financas_resumo(user_id, mes);

-- Atualizar a cada hora
CREATE OR REPLACE FUNCTION refresh_financas_resumo()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_financas_resumo;
END;
$$ LANGUAGE plpgsql;

-- View materializada para progresso de hiperfocos
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hiperfocos_progresso AS
SELECT 
    h.id as hiperfoco_id,
    h.user_id,
    h.titulo,
    h.status,
    COUNT(ht.id) as total_tarefas,
    COUNT(CASE WHEN ht.concluida THEN 1 END) as tarefas_concluidas,
    ROUND((COUNT(CASE WHEN ht.concluida THEN 1 END)::numeric / 
           NULLIF(COUNT(ht.id), 0) * 100), 2) as percentual_conclusao
FROM hiperfocos h
LEFT JOIN hiperfoco_tarefas ht ON ht.hiperfoco_id = h.id
GROUP BY h.id, h.user_id, h.titulo, h.status;

CREATE UNIQUE INDEX ON mv_hiperfocos_progresso(hiperfoco_id);
```

### 2.3 Funções Otimizadas

```sql
-- Função para calcular saldo financeiro de forma eficiente
CREATE OR REPLACE FUNCTION calcular_saldo_usuario(p_user_id uuid, p_data_inicio date, p_data_fim date)
RETURNS TABLE(receitas numeric, despesas numeric, saldo numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as receitas,
        COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as despesas,
        COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM financas_transacoes
    WHERE user_id = p_user_id
      AND data BETWEEN p_data_inicio AND p_data_fim;
END;
$$ LANGUAGE plpgsql STABLE;
```


---

## 3. Segurança e RLS

### 3.1 Políticas RLS Detalhadas

```sql
-- Exemplo de política RLS completa para financas_transacoes
ALTER TABLE financas_transacoes ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário pode ver apenas suas transações
CREATE POLICY "Users can view own transactions"
ON financas_transacoes FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Usuário pode inserir apenas com seu próprio user_id
CREATE POLICY "Users can insert own transactions"
ON financas_transacoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuário pode atualizar apenas suas transações
CREATE POLICY "Users can update own transactions"
ON financas_transacoes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuário pode deletar apenas suas transações
CREATE POLICY "Users can delete own transactions"
ON financas_transacoes FOR DELETE
USING (auth.uid() = user_id);
```

### 3.2 Validações Adicionais via Triggers

```sql
-- Trigger para validar intervalo entre tomadas de medicamento
CREATE OR REPLACE FUNCTION validar_intervalo_medicamento()
RETURNS TRIGGER AS $$
DECLARE
    v_intervalo_minutos integer;
    v_ultima_tomada timestamptz;
BEGIN
    -- Buscar intervalo mínimo do medicamento
    SELECT intervalo_minutos INTO v_intervalo_minutos
    FROM saude_medicamentos
    WHERE id = NEW.medicamento_id;
    
    -- Buscar última tomada
    SELECT MAX(data_hora) INTO v_ultima_tomada
    FROM saude_tomadas_medicamentos
    WHERE medicamento_id = NEW.medicamento_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    -- Validar intervalo
    IF v_ultima_tomada IS NOT NULL AND 
       NEW.data_hora < v_ultima_tomada + (v_intervalo_minutos || ' minutes')::interval THEN
        RAISE EXCEPTION 'Intervalo mínimo entre doses não respeitado';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_intervalo_medicamento
BEFORE INSERT OR UPDATE ON saude_tomadas_medicamentos
FOR EACH ROW EXECUTE FUNCTION validar_intervalo_medicamento();
```


### 3.3 Auditoria de Mudanças Críticas

```sql
-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action text NOT NULL, -- INSERT, UPDATE, DELETE
    old_data jsonb,
    new_data jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);

-- Função genérica de auditoria
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
$$ LANGUAGE plpgsql;

-- Aplicar auditoria em tabelas críticas
CREATE TRIGGER trg_audit_financas_transacoes
AFTER INSERT OR UPDATE OR DELETE ON financas_transacoes
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER trg_audit_saude_medicamentos
AFTER INSERT OR UPDATE OR DELETE ON saude_medicamentos
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 4. Backup e Recuperação

### 4.1 Estratégia de Backup

```sql
-- Backup incremental diário (via pg_dump)
-- Executar via cron ou Supabase CLI

-- Backup completo semanal
pg_dump -h db.llwcibvofptjyxxrcbvu.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup_completo_$(date +%Y%m%d).dump

-- Backup apenas do schema public
pg_dump -h db.llwcibvofptjyxxrcbvu.supabase.co \
        -U postgres \
        -d postgres \
        -n public \
        -F c \
        -f backup_public_$(date +%Y%m%d).dump
```


### 4.2 Point-in-Time Recovery (PITR)

O Supabase oferece PITR automático. Para restaurar:

```sql
-- Via Supabase Dashboard ou CLI
-- Permite restaurar para qualquer ponto nos últimos 7 dias (plano Pro)
```

### 4.3 Soft Delete

Implementar soft delete para dados críticos:

```sql
-- Adicionar coluna deleted_at em tabelas importantes
ALTER TABLE financas_transacoes ADD COLUMN deleted_at timestamptz;
ALTER TABLE saude_medicamentos ADD COLUMN deleted_at timestamptz;
ALTER TABLE hiperfocos ADD COLUMN deleted_at timestamptz;

-- Criar índices parciais
CREATE INDEX idx_financas_transacoes_active 
ON financas_transacoes(user_id, data DESC) 
WHERE deleted_at IS NULL;

-- Atualizar políticas RLS para considerar soft delete
CREATE POLICY "Users can view own active transactions"
ON financas_transacoes FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);
```

---

## 5. Monitoramento

### 5.1 Queries de Monitoramento

```sql
-- Monitorar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitorar queries lentas
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Monitorar índices não utilizados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```


### 5.2 Alertas Recomendados

```sql
-- Criar função para alertas de uso de espaço
CREATE OR REPLACE FUNCTION check_table_size_alert()
RETURNS TABLE(table_name text, size_mb numeric, alert_level text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        ROUND((pg_total_relation_size(t.schemaname||'.'||t.tablename) / 1024.0 / 1024.0)::numeric, 2) as size_mb,
        CASE 
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 1073741824 THEN 'CRITICAL' -- > 1GB
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 536870912 THEN 'WARNING'   -- > 512MB
            ELSE 'OK'
        END as alert_level
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Executar periodicamente
SELECT * FROM check_table_size_alert() WHERE alert_level != 'OK';
```

---

## 6. Manutenção

### 6.1 Rotinas de Manutenção

```sql
-- VACUUM ANALYZE semanal (automático no Supabase, mas pode ser forçado)
VACUUM ANALYZE financas_transacoes;
VACUUM ANALYZE saude_tomadas_medicamentos;
VACUUM ANALYZE hiperfoco_tarefas;

-- REINDEX mensal para tabelas com muitas atualizações
REINDEX TABLE financas_transacoes;
REINDEX TABLE hiperfoco_tarefas;

-- Limpar dados antigos (exemplo: logs de auditoria > 1 ano)
DELETE FROM audit_log 
WHERE created_at < NOW() - INTERVAL '1 year';
```

### 6.2 Limpeza de Dados Órfãos

```sql
-- Verificar e limpar registros órfãos
-- (Não deve haver devido às foreign keys, mas é bom verificar)

-- Verificar transações sem categoria válida
SELECT COUNT(*) 
FROM financas_transacoes ft
LEFT JOIN financas_categorias fc ON ft.categoria_id = fc.id
WHERE ft.categoria_id IS NOT NULL AND fc.id IS NULL;

-- Verificar tomadas sem medicamento válido
SELECT COUNT(*)
FROM saude_tomadas_medicamentos stm
LEFT JOIN saude_medicamentos sm ON stm.medicamento_id = sm.id
WHERE sm.id IS NULL;
```


### 6.3 Arquivamento de Dados Históricos

```sql
-- Criar tabelas de arquivo para dados antigos
CREATE TABLE IF NOT EXISTS financas_transacoes_arquivo (
    LIKE financas_transacoes INCLUDING ALL
);

-- Mover transações antigas (> 2 anos) para arquivo
WITH moved_rows AS (
    DELETE FROM financas_transacoes
    WHERE data < CURRENT_DATE - INTERVAL '2 years'
    RETURNING *
)
INSERT INTO financas_transacoes_arquivo
SELECT * FROM moved_rows;

-- Criar view unificada
CREATE OR REPLACE VIEW financas_transacoes_completo AS
SELECT * FROM financas_transacoes
UNION ALL
SELECT * FROM financas_transacoes_arquivo;
```

---

## 7. Checklist de Implementação

### Prioridade Alta (Implementar Imediatamente)

- [ ] Criar índices críticos para queries frequentes
- [ ] Implementar políticas RLS detalhadas em todas as tabelas
- [ ] Configurar backup automático diário
- [ ] Implementar trigger de validação de intervalo de medicamentos
- [ ] Adicionar auditoria em tabelas financeiras

### Prioridade Média (Implementar em 1-2 semanas)

- [ ] Criar materialized views para dashboards
- [ ] Implementar soft delete em tabelas críticas
- [ ] Configurar alertas de uso de espaço
- [ ] Criar funções otimizadas para cálculos frequentes
- [ ] Implementar rotina de limpeza de dados antigos

### Prioridade Baixa (Implementar quando necessário)

- [ ] Particionamento de tabelas grandes
- [ ] Arquivamento de dados históricos
- [ ] Otimização avançada de queries
- [ ] Implementar cache de queries frequentes
- [ ] Configurar réplicas de leitura

---

## 8. Métricas de Sucesso

### KPIs de Performance

| Métrica | Valor Atual | Meta | Status |
|---------|-------------|------|--------|
| Tempo médio de query | - | < 100ms | ⏳ A medir |
| Queries > 1s | - | < 1% | ⏳ A medir |
| Uso de índices | - | > 95% | ⏳ A medir |
| Tamanho do banco | ~50MB | < 10GB | ✅ OK |
| Conexões ativas | 7 | < 100 | ✅ OK |

### KPIs de Segurança

| Métrica | Status |
|---------|--------|
| RLS habilitado em todas as tabelas | ✅ Sim |
| Políticas RLS configuradas | ⚠️ Parcial |
| Auditoria implementada | ❌ Não |
| Backup automático | ✅ Sim (Supabase) |
| Validações via triggers | ⚠️ Parcial |

---

## 9. Recursos Adicionais

### Documentação Oficial

- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [Supabase Database Best Practices](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Ferramentas Recomendadas

- **pgAdmin**: Interface gráfica para PostgreSQL
- **pg_stat_statements**: Análise de performance de queries
- **pgBadger**: Análise de logs do PostgreSQL
- **Supabase CLI**: Gerenciamento via linha de comando

---

**Última atualização:** 19 de Outubro de 2025  
**Próxima revisão:** 19 de Novembro de 2025
