-- ==========================================
-- Rollback: Remover tabela de planejamento de refeições
-- Data: 19 de outubro de 2025
-- ==========================================

-- Remover trigger
DROP TRIGGER IF EXISTS update_alimentacao_planejamento_updated_at ON alimentacao_planejamento;

-- Remover policies
DROP POLICY IF EXISTS "Users can manage their meal plans" ON alimentacao_planejamento;

-- Remover índices (serão removidos automaticamente com a tabela, mas listados para clareza)
DROP INDEX IF EXISTS idx_alimentacao_planejamento_user;
DROP INDEX IF EXISTS idx_alimentacao_planejamento_dia;

-- Remover tabela
DROP TABLE IF EXISTS alimentacao_planejamento;

-- Nota: A função update_updated_at_column() não é removida pois pode ser usada por outras tabelas
