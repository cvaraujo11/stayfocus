-- ============================================================================
-- QUERIES ÚTEIS PARA O BANCO DE DADOS STAYFOCUS
-- ============================================================================
-- Data: 19 de Outubro de 2025
-- Projeto: StayFocus
-- Descrição: Coleção de queries úteis para consulta, análise e manutenção
-- ============================================================================

-- ============================================================================
-- SEÇÃO 1: CONSULTAS DE ESTATÍSTICAS GERAIS
-- ============================================================================

-- 1.1 Contagem de registros por tabela
SELECT 
    schemaname,
    tablename,
    n_live_tup as registros_ativos,
    n_dead_tup as registros_mortos
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 1.2 Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as tamanho_tabela,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as tamanho_indices
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 1.3 Verificar usuários cadastrados
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- SEÇÃO 2: CONSULTAS POR MÓDULO - FINANÇAS
-- ============================================================================

-- 2.1 Resumo financeiro por usuário
SELECT 
    u.email,
    COUNT(DISTINCT fc.id) as total_categorias,
    COUNT(DISTINCT ft.id) as total_transacoes,
    COUNT(DISTINCT fe.id) as total_envelopes,
    COUNT(DISTINCT fpr.id) as total_pagamentos_recorrentes
FROM auth.users u
LEFT JOIN financas_categorias fc ON fc.user_id = u.id
LEFT JOIN financas_transacoes ft ON ft.user_id = u.id
LEFT JOIN financas_envelopes fe ON fe.user_id = u.id
LEFT JOIN financas_pagamentos_recorrentes fpr ON fpr.user_id = u.id
GROUP BY u.id, u.email;

-- 2.2 Balanço financeiro por usuário (receitas vs despesas)
SELECT 
    u.email,
    SUM(CASE WHEN ft.tipo = 'receita' THEN ft.valor ELSE 0 END) as total_receitas,
    SUM(CASE WHEN ft.tipo = 'despesa' THEN ft.valor ELSE 0 END) as total_despesas,
    SUM(CASE WHEN ft.tipo = 'receita' THEN ft.valor ELSE -ft.valor END) as saldo
FROM auth.users u
LEFT JOIN financas_transacoes ft ON ft.user_id = u.id
GROUP BY u.id, u.email;

-- 2.3 Transações por categoria
SELECT 
    fc.nome as categoria,
    COUNT(ft.id) as quantidade_transacoes,
    SUM(ft.valor) as valor_total,
    AVG(ft.valor) as valor_medio
FROM financas_categorias fc
LEFT JOIN financas_transacoes ft ON ft.categoria_id = fc.id
GROUP BY fc.id, fc.nome
ORDER BY valor_total DESC;

-- 2.4 Status dos envelopes
SELECT 
    nome,
    valor_alocado,
    valor_utilizado,
    (valor_alocado - valor_utilizado) as saldo_disponivel,
    ROUND((valor_utilizado / NULLIF(valor_alocado, 0) * 100)::numeric, 2) as percentual_utilizado
FROM financas_envelopes
ORDER BY percentual_utilizado DESC;

-- 2.5 Pagamentos recorrentes pendentes
SELECT 
    descricao,
    valor,
    data_vencimento,
    proximo_pagamento,
    fc.nome as categoria,
    CASE 
        WHEN pago THEN 'Pago'
        ELSE 'Pendente'
    END as status
FROM financas_pagamentos_recorrentes fpr
LEFT JOIN financas_categorias fc ON fpr.categoria_id = fc.id
ORDER BY proximo_pagamento;

-- ============================================================================
-- SEÇÃO 3: CONSULTAS POR MÓDULO - ALIMENTAÇÃO
-- ============================================================================

-- 3.1 Resumo de alimentação por usuário
SELECT 
    u.email,
    COUNT(DISTINCT ar.id) as total_refeicoes_registradas,
    COUNT(DISTINCT ap.id) as total_planejamentos,
    COUNT(DISTINCT ah.id) as dias_hidratacao_registrados
FROM auth.users u
LEFT JOIN alimentacao_refeicoes ar ON ar.user_id = u.id
LEFT JOIN alimentacao_planejamento ap ON ap.user_id = u.id
LEFT JOIN alimentacao_hidratacao ah ON ah.user_id = u.id
GROUP BY u.id, u.email;

-- 3.2 Refeições dos últimos 7 dias
SELECT 
    data,
    hora,
    descricao,
    CASE WHEN foto_url IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_foto
FROM alimentacao_refeicoes
WHERE data >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY data DESC, hora DESC;

-- 3.3 Planejamento de refeições ativo
SELECT 
    CASE dia_semana
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
        WHEN 6 THEN 'Sábado'
        ELSE 'Todos os dias'
    END as dia,
    horario,
    descricao,
    ordem
FROM alimentacao_planejamento
WHERE ativo = true
ORDER BY 
    COALESCE(dia_semana, -1),
    ordem,
    horario;

-- 3.4 Progresso de hidratação dos últimos 7 dias
SELECT 
    data,
    copos_bebidos,
    meta_diaria,
    ROUND((copos_bebidos::numeric / NULLIF(meta_diaria, 0) * 100), 2) as percentual_meta,
    CASE 
        WHEN copos_bebidos >= meta_diaria THEN '✅ Meta atingida'
        WHEN copos_bebidos >= meta_diaria * 0.7 THEN '⚠️ Quase lá'
        ELSE '❌ Abaixo da meta'
    END as status
FROM alimentacao_hidratacao
WHERE data >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY data DESC;

-- ============================================================================
-- SEÇÃO 4: CONSULTAS POR MÓDULO - SAÚDE
-- ============================================================================

-- 4.1 Resumo de saúde por usuário
SELECT 
    u.email,
    COUNT(DISTINCT sm.id) as medicamentos_cadastrados,
    COUNT(DISTINCT CASE WHEN sm.ativo THEN sm.id END) as medicamentos_ativos,
    COUNT(DISTINCT stm.id) as total_tomadas_registradas,
    COUNT(DISTINCT srh.id) as dias_humor_registrados
FROM auth.users u
LEFT JOIN saude_medicamentos sm ON sm.user_id = u.id
LEFT JOIN saude_tomadas_medicamentos stm ON stm.user_id = u.id
LEFT JOIN saude_registros_humor srh ON srh.user_id = u.id
GROUP BY u.id, u.email;

-- 4.2 Medicamentos ativos e seus horários
SELECT 
    nome,
    dosagem,
    frequencia,
    array_to_string(horarios, ', ') as horarios_formatados,
    intervalo_minutos,
    data_inicio,
    observacoes
FROM saude_medicamentos
WHERE ativo = true
ORDER BY nome;

-- 4.3 Histórico de tomadas dos últimos 7 dias
SELECT 
    sm.nome as medicamento,
    stm.data_hora,
    stm.horario_programado,
    CASE 
        WHEN stm.horario_programado IS NULL THEN 'Sem horário programado'
        WHEN stm.data_hora::time = stm.horario_programado THEN '✅ No horário'
        ELSE '⚠️ Fora do horário'
    END as status_horario,
    stm.observacoes
FROM saude_tomadas_medicamentos stm
JOIN saude_medicamentos sm ON stm.medicamento_id = sm.id
WHERE stm.data_hora >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY stm.data_hora DESC;

-- 4.4 Análise de humor dos últimos 30 dias
SELECT 
    data,
    nivel,
    CASE nivel
        WHEN 1 THEN '😢 Muito ruim'
        WHEN 2 THEN '😕 Ruim'
        WHEN 3 THEN '😐 Neutro'
        WHEN 4 THEN '🙂 Bom'
        WHEN 5 THEN '😄 Muito bom'
    END as humor_emoji,
    array_to_string(fatores, ', ') as fatores_influenciadores,
    notas
FROM saude_registros_humor
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY data DESC;

-- 4.5 Média de humor por semana
SELECT 
    DATE_TRUNC('week', data) as semana,
    ROUND(AVG(nivel)::numeric, 2) as media_humor,
    COUNT(*) as dias_registrados
FROM saude_registros_humor
WHERE data >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', data)
ORDER BY semana DESC;

-- ============================================================================
-- SEÇÃO 5: CONSULTAS POR MÓDULO - HIPERFOCOS
-- ============================================================================

-- 5.1 Resumo de hiperfocos por usuário
SELECT 
    u.email,
    COUNT(DISTINCT h.id) as total_hiperfocos,
    COUNT(DISTINCT CASE WHEN h.status = 'ativo' THEN h.id END) as hiperfocos_ativos,
    COUNT(DISTINCT CASE WHEN h.status = 'concluido' THEN h.id END) as hiperfocos_concluidos,
    COUNT(DISTINCT ht.id) as total_tarefas
FROM auth.users u
LEFT JOIN hiperfocos h ON h.user_id = u.id
LEFT JOIN hiperfoco_tarefas ht ON ht.user_id = u.id
GROUP BY u.id, u.email;

-- 5.2 Hiperfocos ativos com progresso de tarefas
SELECT 
    h.titulo,
    h.descricao,
    h.data_inicio,
    h.data_fim,
    h.intensidade,
    COUNT(ht.id) as total_tarefas,
    COUNT(CASE WHEN ht.concluida THEN 1 END) as tarefas_concluidas,
    ROUND((COUNT(CASE WHEN ht.concluida THEN 1 END)::numeric / NULLIF(COUNT(ht.id), 0) * 100), 2) as percentual_conclusao
FROM hiperfocos h
LEFT JOIN hiperfoco_tarefas ht ON ht.hiperfoco_id = h.id
WHERE h.status = 'ativo'
GROUP BY h.id, h.titulo, h.descricao, h.data_inicio, h.data_fim, h.intensidade
ORDER BY h.data_inicio DESC;

-- 5.3 Tarefas pendentes por hiperfoco
SELECT 
    h.titulo as hiperfoco,
    ht.texto as tarefa,
    CASE WHEN ht.tarefa_pai_id IS NULL THEN 'Tarefa principal' ELSE 'Subtarefa' END as tipo,
    ht.ordem,
    ht.cor
FROM hiperfoco_tarefas ht
JOIN hiperfocos h ON ht.hiperfoco_id = h.id
WHERE ht.concluida = false
  AND h.status = 'ativo'
ORDER BY h.titulo, ht.ordem;

-- 5.4 Histórico de hiperfocos concluídos
SELECT 
    titulo,
    data_inicio,
    data_fim,
    (data_fim - data_inicio) as duracao_dias,
    intensidade,
    COUNT(ht.id) as total_tarefas,
    COUNT(CASE WHEN ht.concluida THEN 1 END) as tarefas_concluidas
FROM hiperfocos h
LEFT JOIN hiperfoco_tarefas ht ON ht.hiperfoco_id = h.id
WHERE h.status = 'concluido'
GROUP BY h.id, h.titulo, h.data_inicio, h.data_fim, h.intensidade
ORDER BY h.data_fim DESC;

-- ============================================================================
-- SEÇÃO 6: CONSULTAS POR MÓDULO - PRODUTIVIDADE
-- ============================================================================

-- 6.1 Resumo de produtividade por usuário
SELECT 
    u.email,
    COUNT(DISTINCT ps.id) as sessoes_pomodoro,
    COUNT(DISTINCT p.id) as total_prioridades,
    COUNT(DISTINCT CASE WHEN p.concluida THEN p.id END) as prioridades_concluidas,
    COUNT(DISTINCT bt.id) as blocos_tempo_criados
FROM auth.users u
LEFT JOIN pomodoro_sessoes ps ON ps.user_id = u.id
LEFT JOIN prioridades p ON p.user_id = u.id
LEFT JOIN blocos_tempo bt ON bt.user_id = u.id
GROUP BY u.id, u.email;

-- 6.2 Prioridades do dia
SELECT 
    titulo,
    categoria,
    CASE nivel_prioridade
        WHEN 1 THEN '🔴 Alta'
        WHEN 2 THEN '🟡 Média'
        WHEN 3 THEN '🟢 Baixa'
    END as prioridade,
    CASE WHEN concluida THEN '✅ Concluída' ELSE '⏳ Pendente' END as status
FROM prioridades
WHERE data = CURRENT_DATE
ORDER BY nivel_prioridade, created_at;

-- 6.3 Taxa de conclusão de prioridades por semana
SELECT 
    DATE_TRUNC('week', data) as semana,
    COUNT(*) as total_prioridades,
    COUNT(CASE WHEN concluida THEN 1 END) as concluidas,
    ROUND((COUNT(CASE WHEN concluida THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100), 2) as taxa_conclusao
FROM prioridades
WHERE data >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', data)
ORDER BY semana DESC;

-- 6.4 Blocos de tempo de hoje
SELECT 
    hora,
    atividade,
    CASE categoria
        WHEN 'inicio' THEN '🌅 Início'
        WHEN 'alimentacao' THEN '🍽️ Alimentação'
        WHEN 'estudos' THEN '📚 Estudos'
        WHEN 'saude' THEN '🏥 Saúde'
        WHEN 'lazer' THEN '🎮 Lazer'
        WHEN 'nenhuma' THEN '⚪ Livre'
    END as categoria_formatada
FROM blocos_tempo
WHERE data = CURRENT_DATE
ORDER BY hora;

-- 6.5 Estatísticas de Pomodoro dos últimos 30 dias
SELECT 
    tipo,
    COUNT(*) as total_sessoes,
    SUM(duracao_minutos) as minutos_totais,
    ROUND(AVG(duracao_minutos)::numeric, 2) as duracao_media,
    COUNT(CASE WHEN concluida THEN 1 END) as sessoes_concluidas,
    ROUND((COUNT(CASE WHEN concluida THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100), 2) as taxa_conclusao
FROM pomodoro_sessoes
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tipo;

-- ============================================================================
-- SEÇÃO 7: CONSULTAS POR MÓDULO - ESTUDOS
-- ============================================================================

-- 7.1 Resumo de estudos por usuário
SELECT 
    u.email,
    COUNT(DISTINCT ec.id) as concursos_cadastrados,
    COUNT(DISTINCT eq.id) as questoes_cadastradas,
    COUNT(DISTINCT es.id) as simulados_realizados,
    COUNT(DISTINCT er.id) as sessoes_estudo
FROM auth.users u
LEFT JOIN estudos_concursos ec ON ec.user_id = u.id
LEFT JOIN estudos_questoes eq ON eq.user_id = u.id
LEFT JOIN estudos_simulados es ON es.user_id = u.id
LEFT JOIN estudos_registros er ON er.user_id = u.id
GROUP BY u.id, u.email;

-- 7.2 Concursos em andamento
SELECT 
    nome,
    cargo,
    instituicao,
    data_prova,
    CASE 
        WHEN data_prova IS NULL THEN 'Sem data definida'
        WHEN data_prova < CURRENT_DATE THEN 'Prova realizada'
        ELSE (data_prova - CURRENT_DATE)::text || ' dias restantes'
    END as status_prova,
    array_to_string(disciplinas, ', ') as disciplinas_formatadas
FROM estudos_concursos
WHERE status = 'em_andamento'
ORDER BY data_prova NULLS LAST;

-- 7.3 Tempo de estudo por disciplina (últimos 30 dias)
SELECT 
    disciplina,
    COUNT(*) as sessoes,
    SUM(duracao_minutos) as minutos_totais,
    ROUND(AVG(duracao_minutos)::numeric, 2) as duracao_media_sessao
FROM estudos_registros
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY disciplina
ORDER BY minutos_totais DESC;

-- 7.4 Performance em simulados
SELECT 
    titulo,
    data_realizacao,
    total_questoes,
    acertos,
    ROUND((acertos::numeric / NULLIF(total_questoes, 0) * 100), 2) as percentual_acerto,
    tempo_limite_minutos
FROM estudos_simulados
WHERE data_realizacao IS NOT NULL
ORDER BY data_realizacao DESC;

-- ============================================================================
-- SEÇÃO 8: CONSULTAS POR MÓDULO - RECEITAS E LISTA DE COMPRAS
-- ============================================================================

-- 8.1 Receitas favoritas
SELECT 
    titulo,
    categoria,
    tempo_preparo_minutos,
    porcoes,
    CASE WHEN foto_url IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_foto
FROM receitas
WHERE favorita = true
ORDER BY titulo;

-- 8.2 Lista de compras pendente
SELECT 
    item,
    quantidade,
    categoria,
    CASE WHEN comprado THEN '✅ Comprado' ELSE '⏳ Pendente' END as status
FROM lista_compras
ORDER BY comprado, categoria, item;

-- 8.3 Itens comprados vs pendentes
SELECT 
    categoria,
    COUNT(*) as total_itens,
    COUNT(CASE WHEN comprado THEN 1 END) as comprados,
    COUNT(CASE WHEN NOT comprado THEN 1 END) as pendentes
FROM lista_compras
GROUP BY categoria
ORDER BY categoria;

-- ============================================================================
-- SEÇÃO 9: CONSULTAS DE MANUTENÇÃO E PERFORMANCE
-- ============================================================================

-- 9.1 Verificar índices faltantes (sugestão)
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;

-- 9.2 Tabelas que precisam de VACUUM
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND((n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100), 2) as percentual_mortos
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 100
ORDER BY percentual_mortos DESC;

-- 9.3 Queries mais lentas (requer pg_stat_statements)
SELECT 
    query,
    calls,
    ROUND(total_exec_time::numeric, 2) as total_time_ms,
    ROUND(mean_exec_time::numeric, 2) as mean_time_ms,
    ROUND((100 * total_exec_time / SUM(total_exec_time) OVER ())::numeric, 2) as percentage
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 10;

-- 9.4 Verificar conexões ativas
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start DESC;

-- ============================================================================
-- SEÇÃO 10: CONSULTAS DE AUDITORIA E SEGURANÇA
-- ============================================================================

-- 10.1 Verificar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 10.2 Tabelas sem RLS habilitado
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename 
    FROM pg_tables t
    WHERE t.schemaname = 'public'
      AND t.rowsecurity = true
  );

-- 10.3 Últimas atividades de autenticação
SELECT 
    email,
    last_sign_in_at,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN last_sign_in_at > NOW() - INTERVAL '1 day' THEN 'Ativo hoje'
        WHEN last_sign_in_at > NOW() - INTERVAL '7 days' THEN 'Ativo esta semana'
        WHEN last_sign_in_at > NOW() - INTERVAL '30 days' THEN 'Ativo este mês'
        ELSE 'Inativo'
    END as status_atividade
FROM auth.users
ORDER BY last_sign_in_at DESC NULLS LAST;

-- ============================================================================
-- FIM DO ARQUIVO
-- ============================================================================
