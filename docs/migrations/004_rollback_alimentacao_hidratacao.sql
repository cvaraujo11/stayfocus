-- ==========================================
-- Rollback: Remover tabela de hidratação
-- Data: 19 de outubro de 2025
-- ==========================================

-- Remover trigger
DROP TRIGGER IF EXISTS update_alimentacao_hidratacao_updated_at ON alimentacao_hidratacao;

-- Remover policies
DROP POLICY IF EXISTS "Users can manage their hydration data" ON alimentacao_hidratacao;

-- Remover índices (serão removidos automaticamente com a tabela, mas listados para clareza)
DROP INDEX IF EXISTS idx_alimentacao_hidratacao_user_data;

-- Remover tabela
DROP TABLE IF EXISTS alimentacao_hidratacao;
