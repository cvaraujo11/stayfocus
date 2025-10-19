# ⏳ Migrações Pendentes

Migrações que ainda não foram aplicadas no banco de dados.

## 📋 Lista

Atualmente não há migrações pendentes.

## ➕ Como Adicionar Nova Migração

1. Crie o arquivo com numeração sequencial: `011_nome_descritivo.sql`
2. Adicione descrição neste README
3. Crie o rollback correspondente em `../02-rollbacks/`
4. Teste em ambiente de desenvolvimento
5. Execute em produção
6. Mova para `../01-applied/` após aplicação

## 📝 Template

```sql
-- ============================================================================
-- Migration XXX: Descrição
-- ============================================================================
-- Data: YYYY-MM-DD
-- Autor: Nome
-- Descrição: Descrição detalhada
-- ============================================================================

-- Seu código SQL aqui

-- ============================================================================
-- Verificação
-- ============================================================================

-- Queries para verificar se a migration foi aplicada corretamente
```
