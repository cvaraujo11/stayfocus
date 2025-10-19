-- ==========================================
-- RLS: Configurar segurança para tabela alimentacao_refeicoes
-- Data: 19 de outubro de 2025
-- Descrição: Implementar Row Level Security para proteger dados dos usuários
-- ==========================================

-- Habilitar RLS (se ainda não estiver)
ALTER TABLE alimentacao_refeicoes ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can view their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can insert their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can update their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can delete their own meals" ON alimentacao_refeicoes;

-- Criar policy para SELECT
CREATE POLICY "Users can view their own meals"
  ON alimentacao_refeicoes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Criar policy para INSERT
CREATE POLICY "Users can insert their own meals"
  ON alimentacao_refeicoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar policy para UPDATE
CREATE POLICY "Users can update their own meals"
  ON alimentacao_refeicoes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Criar policy para DELETE
CREATE POLICY "Users can delete their own meals"
  ON alimentacao_refeicoes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verificar se RLS está ativo
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE tablename = 'alimentacao_refeicoes' 
    AND rowsecurity = false
  ) THEN
    RAISE EXCEPTION 'RLS não está habilitado na tabela alimentacao_refeicoes!';
  END IF;
END $$;
