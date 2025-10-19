-- ==========================================
-- MIGRATION: Completar implementação de Alimentação
-- Versão: 002
-- Data: 2025-10-19
-- Descrição: Criar tabelas faltantes e configurar RLS completo para o módulo de Alimentação
-- ==========================================

-- ==========================================
-- PARTE 1: RLS para tabela existente (alimentacao_refeicoes)
-- ==========================================

-- Habilitar RLS (se ainda não estiver ativo)
ALTER TABLE alimentacao_refeicoes ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Users can view their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can insert their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can update their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can delete their own meals" ON alimentacao_refeicoes;

-- Criar policies de segurança
CREATE POLICY "Users can view their own meals"
  ON alimentacao_refeicoes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
  ON alimentacao_refeicoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON alimentacao_refeicoes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON alimentacao_refeicoes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_alimentacao_refeicoes_user_data 
  ON alimentacao_refeicoes(user_id, data DESC, hora DESC);

CREATE INDEX IF NOT EXISTS idx_alimentacao_refeicoes_created 
  ON alimentacao_refeicoes(created_at DESC);

-- ==========================================
-- PARTE 2: Tabela de Planejamento de Refeições
-- ==========================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS alimentacao_planejamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alimentacao_planejamento_user 
  ON alimentacao_planejamento(user_id);

CREATE INDEX idx_alimentacao_planejamento_user_ativo 
  ON alimentacao_planejamento(user_id, ativo) 
  WHERE ativo = true;

CREATE INDEX idx_alimentacao_planejamento_dia 
  ON alimentacao_planejamento(dia_semana, ordem) 
  WHERE dia_semana IS NOT NULL;

-- RLS
ALTER TABLE alimentacao_planejamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meal plans"
  ON alimentacao_planejamento
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their meal plans"
  ON alimentacao_planejamento
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their meal plans"
  ON alimentacao_planejamento
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their meal plans"
  ON alimentacao_planejamento
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE alimentacao_planejamento IS 'Planejamento de refeições dos usuários - define horários e descrições das refeições';
COMMENT ON COLUMN alimentacao_planejamento.dia_semana IS '0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado. NULL=Todos os dias';
COMMENT ON COLUMN alimentacao_planejamento.ativo IS 'Indica se este planejamento está ativo ou arquivado';
COMMENT ON COLUMN alimentacao_planejamento.ordem IS 'Ordem de exibição das refeições';

-- ==========================================
-- PARTE 3: Tabela de Hidratação
-- ==========================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS alimentacao_hidratacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  copos_bebidos INTEGER NOT NULL DEFAULT 0 CHECK (copos_bebidos >= 0 AND copos_bebidos <= 50),
  meta_diaria INTEGER NOT NULL DEFAULT 8 CHECK (meta_diaria > 0 AND meta_diaria <= 20),
  ultimo_registro TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE(user_id, data)
);

-- Índices
CREATE INDEX idx_alimentacao_hidratacao_user_data 
  ON alimentacao_hidratacao(user_id, data DESC);

CREATE INDEX idx_alimentacao_hidratacao_data 
  ON alimentacao_hidratacao(data DESC);

-- RLS
ALTER TABLE alimentacao_hidratacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their hydration data"
  ON alimentacao_hidratacao
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their hydration data"
  ON alimentacao_hidratacao
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their hydration data"
  ON alimentacao_hidratacao
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their hydration data"
  ON alimentacao_hidratacao
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE alimentacao_hidratacao IS 'Registro diário de hidratação dos usuários';
COMMENT ON COLUMN alimentacao_hidratacao.copos_bebidos IS 'Número de copos de água bebidos no dia (máximo: 50)';
COMMENT ON COLUMN alimentacao_hidratacao.meta_diaria IS 'Meta de copos para o dia (1-20, padrão: 8)';
COMMENT ON COLUMN alimentacao_hidratacao.ultimo_registro IS 'Timestamp do último copo registrado';
COMMENT ON COLUMN alimentacao_hidratacao.notas IS 'Observações adicionais sobre a hidratação do dia';

-- ==========================================
-- PARTE 4: Triggers para updated_at
-- ==========================================

-- Criar função se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para alimentacao_planejamento
DROP TRIGGER IF EXISTS update_alimentacao_planejamento_updated_at ON alimentacao_planejamento;
CREATE TRIGGER update_alimentacao_planejamento_updated_at
  BEFORE UPDATE ON alimentacao_planejamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para alimentacao_hidratacao
DROP TRIGGER IF EXISTS update_alimentacao_hidratacao_updated_at ON alimentacao_hidratacao;
CREATE TRIGGER update_alimentacao_hidratacao_updated_at
  BEFORE UPDATE ON alimentacao_hidratacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- PARTE 5: Storage Policies
-- ==========================================

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;

-- Policy: Upload
CREATE POLICY "Users can upload their own photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: View/Download
CREATE POLICY "Users can view their own photos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Delete
CREATE POLICY "Users can delete their own photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Update/Replace
CREATE POLICY "Users can update their own photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==========================================
-- PARTE 6: Função para limpeza de fotos órfãs (opcional)
-- ==========================================

-- Função para encontrar fotos órfãs
CREATE OR REPLACE FUNCTION find_orphaned_photos()
RETURNS TABLE (file_path TEXT, file_size BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.name as file_path,
    o.metadata->>'size' as file_size
  FROM storage.objects o
  WHERE o.bucket_id = 'user-photos'
    AND o.name NOT IN (
      SELECT foto_url 
      FROM alimentacao_refeicoes 
      WHERE foto_url IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION find_orphaned_photos() IS 'Retorna lista de fotos no storage que não estão referenciadas em alimentacao_refeicoes';

-- ==========================================
-- PARTE 7: Views úteis (opcional)
-- ==========================================

-- View: Estatísticas de hidratação dos últimos 30 dias
CREATE OR REPLACE VIEW alimentacao_hidratacao_stats AS
SELECT 
  user_id,
  COUNT(*) as dias_registrados,
  AVG(copos_bebidos)::NUMERIC(10,2) as media_copos,
  MAX(copos_bebidos) as max_copos,
  MIN(copos_bebidos) as min_copos,
  AVG(meta_diaria)::NUMERIC(10,2) as meta_media,
  COUNT(*) FILTER (WHERE copos_bebidos >= meta_diaria) as dias_meta_atingida,
  (COUNT(*) FILTER (WHERE copos_bebidos >= meta_diaria)::FLOAT / COUNT(*)::FLOAT * 100)::NUMERIC(5,2) as taxa_sucesso
FROM alimentacao_hidratacao
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id;

-- RLS para a view
ALTER VIEW alimentacao_hidratacao_stats SET (security_invoker = true);

COMMENT ON VIEW alimentacao_hidratacao_stats IS 'Estatísticas de hidratação dos últimos 30 dias por usuário';

-- View: Resumo de refeições por período
CREATE OR REPLACE VIEW alimentacao_refeicoes_resumo AS
SELECT 
  user_id,
  DATE_TRUNC('month', data::timestamp) as mes,
  COUNT(*) as total_registros,
  COUNT(foto_url) as registros_com_foto,
  COUNT(DISTINCT data) as dias_registrados
FROM alimentacao_refeicoes
WHERE data >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY user_id, DATE_TRUNC('month', data::timestamp);

-- RLS para a view
ALTER VIEW alimentacao_refeicoes_resumo SET (security_invoker = true);

COMMENT ON VIEW alimentacao_refeicoes_resumo IS 'Resumo mensal de registros de refeições por usuário';

-- ==========================================
-- PARTE 8: Dados iniciais (opcional)
-- ==========================================

-- Inserir planejamento padrão para novos usuários (exemplo)
-- Nota: Isso seria executado via trigger ou função quando um usuário é criado
-- Por enquanto, deixamos apenas a estrutura comentada

/*
-- Exemplo de trigger para inserir planejamento padrão
CREATE OR REPLACE FUNCTION create_default_meal_plan()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO alimentacao_planejamento (user_id, horario, descricao, ordem)
  VALUES 
    (NEW.id, '07:30', 'Café da manhã', 1),
    (NEW.id, '12:00', 'Almoço', 2),
    (NEW.id, '16:00', 'Lanche da tarde', 3),
    (NEW.id, '19:30', 'Jantar', 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger (cuidado: isso insere dados para TODOS os novos usuários)
-- CREATE TRIGGER on_user_created_add_meal_plan
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION create_default_meal_plan();
*/

-- ==========================================
-- VERIFICAÇÕES FINAIS
-- ==========================================

-- Verificar se RLS está ativo em todas as tabelas
DO $$
DECLARE
  tbl TEXT;
  rls_enabled BOOLEAN;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'alimentacao%'
  LOOP
    EXECUTE format('SELECT relrowsecurity FROM pg_class WHERE relname = %L', tbl) INTO rls_enabled;
    IF NOT rls_enabled THEN
      RAISE WARNING 'RLS não está ativo na tabela: %', tbl;
    ELSE
      RAISE NOTICE 'RLS ativo em: %', tbl;
    END IF;
  END LOOP;
END $$;

-- Verificar policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'alimentacao%'
ORDER BY tablename, policyname;

-- Verificar índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename LIKE 'alimentacao%'
ORDER BY tablename, indexname;

-- ==========================================
-- FIM DA MIGRATION
-- ==========================================

-- Para reverter esta migration, execute o arquivo: 002_rollback_alimentacao_complete.sql
