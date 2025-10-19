-- ==========================================
-- Migration: Criar tabela de hidratação
-- Data: 19 de outubro de 2025
-- Descrição: Tabela para registro diário de hidratação dos usuários
-- ==========================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS alimentacao_hidratacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  copos_bebidos INTEGER NOT NULL DEFAULT 0 CHECK (copos_bebidos >= 0),
  meta_diaria INTEGER NOT NULL DEFAULT 8 CHECK (meta_diaria > 0 AND meta_diaria <= 20),
  ultimo_registro TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE(user_id, data)
);

-- Índices para otimização de queries
CREATE INDEX idx_alimentacao_hidratacao_user_data ON alimentacao_hidratacao(user_id, data DESC);

-- Habilitar RLS
ALTER TABLE alimentacao_hidratacao ENABLE ROW LEVEL SECURITY;

-- Criar policy para acesso completo dos usuários aos seus próprios dados
CREATE POLICY "Users can manage their hydration data"
  ON alimentacao_hidratacao
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_alimentacao_hidratacao_updated_at
  BEFORE UPDATE ON alimentacao_hidratacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE alimentacao_hidratacao IS 'Registro diário de hidratação dos usuários';
COMMENT ON COLUMN alimentacao_hidratacao.copos_bebidos IS 'Número de copos de água bebidos no dia';
COMMENT ON COLUMN alimentacao_hidratacao.meta_diaria IS 'Meta de copos para o dia (padrão: 8, máximo: 20)';
COMMENT ON COLUMN alimentacao_hidratacao.ultimo_registro IS 'Timestamp do último copo registrado';
COMMENT ON COLUMN alimentacao_hidratacao.data IS 'Data do registro (único por usuário/dia)';
