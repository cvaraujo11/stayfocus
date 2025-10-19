-- ==========================================
-- Migration: Criar tabela de planejamento de refeições
-- Data: 19 de outubro de 2025
-- Descrição: Tabela para armazenar o planejamento de refeições dos usuários
-- ==========================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS alimentacao_planejamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização de queries
CREATE INDEX idx_alimentacao_planejamento_user ON alimentacao_planejamento(user_id);
CREATE INDEX idx_alimentacao_planejamento_dia ON alimentacao_planejamento(dia_semana) WHERE dia_semana IS NOT NULL;

-- Habilitar RLS
ALTER TABLE alimentacao_planejamento ENABLE ROW LEVEL SECURITY;

-- Criar policy para acesso completo dos usuários aos seus próprios dados
CREATE POLICY "Users can manage their meal plans"
  ON alimentacao_planejamento
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alimentacao_planejamento_updated_at
  BEFORE UPDATE ON alimentacao_planejamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE alimentacao_planejamento IS 'Planejamento de refeições dos usuários';
COMMENT ON COLUMN alimentacao_planejamento.dia_semana IS '0=Domingo, 1=Segunda, ..., 6=Sábado. NULL=Todos os dias';
COMMENT ON COLUMN alimentacao_planejamento.ativo IS 'Indica se o planejamento está ativo';
