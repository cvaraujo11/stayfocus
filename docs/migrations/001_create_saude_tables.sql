-- ============================================================================
-- Script de Migração: Módulo de Saúde para Supabase
-- Data: 19/10/2025
-- Descrição: Cria tabelas, índices, triggers e políticas RLS para o módulo
--            de saúde (medicamentos e monitoramento de humor)
-- ============================================================================

-- ============================================================================
-- 1. TABELA: saude_medicamentos
-- ============================================================================

CREATE TABLE IF NOT EXISTS saude_medicamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  dosagem VARCHAR(100),
  frequencia VARCHAR(50) NOT NULL DEFAULT 'Diária',
  horarios TEXT[] NOT NULL DEFAULT '{}',
  observacoes TEXT,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  intervalo_minutos INTEGER DEFAULT 240,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT horarios_nao_vazio CHECK (array_length(horarios, 1) > 0),
  CONSTRAINT intervalo_positivo CHECK (intervalo_minutos > 0),
  CONSTRAINT frequencia_valida CHECK (frequencia IN ('Diária', 'Semanal', 'Mensal', 'Conforme necessário'))
);

-- Comentários
COMMENT ON TABLE saude_medicamentos IS 'Armazena informações sobre medicamentos dos usuários';
COMMENT ON COLUMN saude_medicamentos.nome IS 'Nome do medicamento';
COMMENT ON COLUMN saude_medicamentos.dosagem IS 'Dosagem do medicamento (ex: 10mg, 1 comprimido)';
COMMENT ON COLUMN saude_medicamentos.frequencia IS 'Frequência de uso: Diária, Semanal, Mensal ou Conforme necessário';
COMMENT ON COLUMN saude_medicamentos.horarios IS 'Array de horários para tomar o medicamento (formato HH:MM)';
COMMENT ON COLUMN saude_medicamentos.intervalo_minutos IS 'Intervalo mínimo em minutos entre doses';
COMMENT ON COLUMN saude_medicamentos.ativo IS 'Indica se o medicamento está sendo usado atualmente';

-- Índices
CREATE INDEX idx_medicamentos_user_id ON saude_medicamentos(user_id);
CREATE INDEX idx_medicamentos_ativo ON saude_medicamentos(user_id, ativo);
CREATE INDEX idx_medicamentos_data_inicio ON saude_medicamentos(data_inicio);
CREATE INDEX idx_medicamentos_created_at ON saude_medicamentos(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medicamentos_updated_at
    BEFORE UPDATE ON saude_medicamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TABELA: saude_tomadas_medicamentos
-- ============================================================================

CREATE TABLE IF NOT EXISTS saude_tomadas_medicamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medicamento_id UUID NOT NULL REFERENCES saude_medicamentos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  horario_programado TIME,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE saude_tomadas_medicamentos IS 'Histórico de tomadas de medicamentos';
COMMENT ON COLUMN saude_tomadas_medicamentos.data_hora IS 'Data e hora em que o medicamento foi tomado';
COMMENT ON COLUMN saude_tomadas_medicamentos.horario_programado IS 'Horário que estava programado (pode ser diferente de quando foi realmente tomado)';

-- Índices
CREATE INDEX idx_tomadas_medicamento_id ON saude_tomadas_medicamentos(medicamento_id);
CREATE INDEX idx_tomadas_user_id ON saude_tomadas_medicamentos(user_id);
CREATE INDEX idx_tomadas_data_hora ON saude_tomadas_medicamentos(data_hora DESC);
CREATE INDEX idx_tomadas_user_data ON saude_tomadas_medicamentos(user_id, data_hora DESC);

-- ============================================================================
-- 3. TABELA: saude_registros_humor
-- ============================================================================

CREATE TABLE IF NOT EXISTS saude_registros_humor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  nivel INTEGER NOT NULL CHECK (nivel >= 1 AND nivel <= 5),
  fatores TEXT[] DEFAULT '{}',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Um registro de humor por dia por usuário
  CONSTRAINT unique_humor_user_data UNIQUE(user_id, data)
);

-- Comentários
COMMENT ON TABLE saude_registros_humor IS 'Registros diários de monitoramento de humor';
COMMENT ON COLUMN saude_registros_humor.nivel IS 'Nível de humor de 1 (muito ruim) a 5 (muito bom)';
COMMENT ON COLUMN saude_registros_humor.fatores IS 'Array de fatores que influenciaram o humor';
COMMENT ON COLUMN saude_registros_humor.notas IS 'Observações adicionais sobre o humor do dia';

-- Índices
CREATE INDEX idx_humor_user_id ON saude_registros_humor(user_id);
CREATE INDEX idx_humor_data ON saude_registros_humor(data DESC);
CREATE INDEX idx_humor_user_data ON saude_registros_humor(user_id, data DESC);
CREATE INDEX idx_humor_nivel ON saude_registros_humor(nivel);
CREATE INDEX idx_humor_created_at ON saude_registros_humor(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_humor_updated_at
    BEFORE UPDATE ON saude_registros_humor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE saude_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saude_tomadas_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saude_registros_humor ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Políticas RLS: saude_medicamentos
-- ----------------------------------------------------------------------------

-- SELECT: Usuários podem ver apenas seus próprios medicamentos
CREATE POLICY "Usuários podem ver seus próprios medicamentos"
  ON saude_medicamentos
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Usuários podem inserir apenas seus próprios medicamentos
CREATE POLICY "Usuários podem inserir seus próprios medicamentos"
  ON saude_medicamentos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar apenas seus próprios medicamentos
CREATE POLICY "Usuários podem atualizar seus próprios medicamentos"
  ON saude_medicamentos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas seus próprios medicamentos
CREATE POLICY "Usuários podem deletar seus próprios medicamentos"
  ON saude_medicamentos
  FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Políticas RLS: saude_tomadas_medicamentos
-- ----------------------------------------------------------------------------

-- SELECT: Usuários podem ver apenas suas próprias tomadas
CREATE POLICY "Usuários podem ver suas próprias tomadas"
  ON saude_tomadas_medicamentos
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Usuários podem registrar apenas suas próprias tomadas
CREATE POLICY "Usuários podem registrar suas próprias tomadas"
  ON saude_tomadas_medicamentos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar apenas suas próprias tomadas
CREATE POLICY "Usuários podem atualizar suas próprias tomadas"
  ON saude_tomadas_medicamentos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas suas próprias tomadas
CREATE POLICY "Usuários podem deletar suas próprias tomadas"
  ON saude_tomadas_medicamentos
  FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Políticas RLS: saude_registros_humor
-- ----------------------------------------------------------------------------

-- SELECT: Usuários podem ver apenas seus próprios registros de humor
CREATE POLICY "Usuários podem ver seus próprios registros de humor"
  ON saude_registros_humor
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Usuários podem inserir apenas seus próprios registros de humor
CREATE POLICY "Usuários podem inserir seus próprios registros de humor"
  ON saude_registros_humor
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários podem atualizar apenas seus próprios registros de humor
CREATE POLICY "Usuários podem atualizar seus próprios registros de humor"
  ON saude_registros_humor
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários podem deletar apenas seus próprios registros de humor
CREATE POLICY "Usuários podem deletar seus próprios registros de humor"
  ON saude_registros_humor
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. VIEWS ÚTEIS
-- ============================================================================

-- View: Próxima tomada de cada medicamento
CREATE OR REPLACE VIEW v_proximas_tomadas AS
SELECT 
  m.id,
  m.user_id,
  m.nome,
  m.dosagem,
  m.horarios,
  t.ultima_tomada,
  m.intervalo_minutos,
  -- Calcular se já pode tomar novamente
  CASE 
    WHEN t.ultima_tomada IS NULL THEN true
    WHEN EXTRACT(EPOCH FROM (NOW() - t.ultima_tomada)) / 60 >= m.intervalo_minutos THEN true
    ELSE false
  END AS pode_tomar,
  -- Calcular tempo restante em minutos
  CASE 
    WHEN t.ultima_tomada IS NULL THEN 0
    ELSE GREATEST(0, m.intervalo_minutos - EXTRACT(EPOCH FROM (NOW() - t.ultima_tomada)) / 60)::INTEGER
  END AS minutos_para_proxima_dose
FROM saude_medicamentos m
LEFT JOIN (
  SELECT 
    medicamento_id,
    MAX(data_hora) as ultima_tomada
  FROM saude_tomadas_medicamentos
  GROUP BY medicamento_id
) t ON m.id = t.medicamento_id
WHERE m.ativo = true;

COMMENT ON VIEW v_proximas_tomadas IS 'View com informações sobre a próxima tomada de cada medicamento ativo';

-- View: Estatísticas de humor por mês
CREATE OR REPLACE VIEW v_estatisticas_humor_mensal AS
SELECT 
  user_id,
  DATE_TRUNC('month', data) as mes,
  COUNT(*) as total_registros,
  ROUND(AVG(nivel)::numeric, 2) as nivel_medio,
  MIN(nivel) as nivel_minimo,
  MAX(nivel) as nivel_maximo,
  MODE() WITHIN GROUP (ORDER BY nivel) as nivel_mais_frequente
FROM saude_registros_humor
GROUP BY user_id, DATE_TRUNC('month', data);

COMMENT ON VIEW v_estatisticas_humor_mensal IS 'Estatísticas mensais de humor por usuário';

-- ============================================================================
-- 6. FUNCTIONS ÚTEIS
-- ============================================================================

-- Function: Obter adesão ao tratamento (% de tomadas no prazo)
CREATE OR REPLACE FUNCTION calcular_adesao_medicamento(
  p_medicamento_id UUID,
  p_data_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_data_fim DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC AS $$
DECLARE
  v_tomadas_esperadas INTEGER;
  v_tomadas_realizadas INTEGER;
  v_adesao NUMERIC;
BEGIN
  -- Calcular tomadas esperadas (simplificado - considerando medicamentos diários)
  SELECT 
    COUNT(*) * (p_data_fim - p_data_inicio + 1)
  INTO v_tomadas_esperadas
  FROM unnest((SELECT horarios FROM saude_medicamentos WHERE id = p_medicamento_id));
  
  -- Contar tomadas realizadas
  SELECT COUNT(*)
  INTO v_tomadas_realizadas
  FROM saude_tomadas_medicamentos
  WHERE medicamento_id = p_medicamento_id
    AND data_hora::date BETWEEN p_data_inicio AND p_data_fim;
  
  -- Calcular percentual
  IF v_tomadas_esperadas > 0 THEN
    v_adesao := (v_tomadas_realizadas::NUMERIC / v_tomadas_esperadas) * 100;
    RETURN ROUND(v_adesao, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calcular_adesao_medicamento IS 'Calcula o percentual de adesão ao tratamento para um medicamento específico';

-- Function: Obter tendência de humor (últimos N dias)
CREATE OR REPLACE FUNCTION calcular_tendencia_humor(
  p_user_id UUID,
  p_dias INTEGER DEFAULT 7
)
RETURNS TABLE (
  tendencia TEXT,
  variacao_percentual NUMERIC,
  nivel_medio_recente NUMERIC,
  nivel_medio_anterior NUMERIC
) AS $$
DECLARE
  v_media_recente NUMERIC;
  v_media_anterior NUMERIC;
  v_variacao NUMERIC;
BEGIN
  -- Média dos últimos N dias
  SELECT AVG(nivel)::NUMERIC
  INTO v_media_recente
  FROM saude_registros_humor
  WHERE user_id = p_user_id
    AND data >= CURRENT_DATE - p_dias;
  
  -- Média dos N dias anteriores
  SELECT AVG(nivel)::NUMERIC
  INTO v_media_anterior
  FROM saude_registros_humor
  WHERE user_id = p_user_id
    AND data >= CURRENT_DATE - (p_dias * 2)
    AND data < CURRENT_DATE - p_dias;
  
  -- Calcular variação
  IF v_media_anterior IS NOT NULL AND v_media_anterior > 0 THEN
    v_variacao := ((v_media_recente - v_media_anterior) / v_media_anterior) * 100;
    
    RETURN QUERY SELECT 
      CASE 
        WHEN v_variacao > 5 THEN 'Melhorando'::TEXT
        WHEN v_variacao < -5 THEN 'Piorando'::TEXT
        ELSE 'Estável'::TEXT
      END,
      ROUND(v_variacao, 2),
      ROUND(v_media_recente, 2),
      ROUND(v_media_anterior, 2);
  ELSE
    RETURN QUERY SELECT 
      'Dados insuficientes'::TEXT,
      0::NUMERIC,
      COALESCE(ROUND(v_media_recente, 2), 0),
      COALESCE(ROUND(v_media_anterior, 2), 0);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calcular_tendencia_humor IS 'Calcula a tendência de humor comparando períodos recentes';

-- ============================================================================
-- 7. GRANTS (Permissões)
-- ============================================================================

-- Garantir que usuários autenticados possam acessar as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON saude_medicamentos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saude_tomadas_medicamentos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saude_registros_humor TO authenticated;

-- Garantir acesso às views
GRANT SELECT ON v_proximas_tomadas TO authenticated;
GRANT SELECT ON v_estatisticas_humor_mensal TO authenticated;

-- Garantir acesso às funções
GRANT EXECUTE ON FUNCTION calcular_adesao_medicamento TO authenticated;
GRANT EXECUTE ON FUNCTION calcular_tendencia_humor TO authenticated;

-- ============================================================================
-- 8. DADOS DE EXEMPLO (APENAS PARA DESENVOLVIMENTO)
-- ============================================================================

-- Descomentar para inserir dados de teste
-- Substitua 'uuid-do-usuario-teste' pelo UUID real de um usuário de teste

/*
-- Exemplo: Medicamento
INSERT INTO saude_medicamentos (user_id, nome, dosagem, frequencia, horarios, observacoes, intervalo_minutos)
VALUES 
  ('uuid-do-usuario-teste', 'Ritalina', '10mg', 'Diária', ARRAY['08:00', '14:00'], 'Tomar após refeição', 360),
  ('uuid-do-usuario-teste', 'Omega 3', '1000mg', 'Diária', ARRAY['09:00'], '', 1440);

-- Exemplo: Registro de Humor
INSERT INTO saude_registros_humor (user_id, data, nivel, fatores, notas)
VALUES 
  ('uuid-do-usuario-teste', CURRENT_DATE, 4, ARRAY['Dormiu bem', 'Exercício'], 'Dia produtivo'),
  ('uuid-do-usuario-teste', CURRENT_DATE - 1, 3, ARRAY['Stress no trabalho'], 'Muitas reuniões');
*/

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- Verificar se tudo foi criado corretamente
SELECT 'Script executado com sucesso!' as status;

-- Listar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'saude_%'
ORDER BY table_name;
