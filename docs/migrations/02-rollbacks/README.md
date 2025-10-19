# 🔄 Scripts de Rollback

Scripts para reverter migrações aplicadas.

## ⚠️ ATENÇÃO

**Rollback apaga TODOS os dados das tabelas afetadas!**

Sempre faça backup antes de executar qualquer rollback.

## 📋 Rollbacks Disponíveis

| # | Arquivo | Reverte | Impacto |
|---|---------|---------|---------|
| 001 | rollback_saude_tables.sql | Migration 001 | Apaga tabelas de saúde |
| 002 | rollback_alimentacao_complete.sql | Migration 002 | Apaga tabelas de alimentação |
| 003 | rollback_alimentacao_planejamento.sql | Migration 003 | Apaga planejamento |
| 004 | rollback_alimentacao_hidratacao.sql | Migration 004 | Apaga hidratação |
| 009 | rollback_hiperfoco_tarefas.sql | Migration 009 | Apaga tarefas |
| 010 | rollback_financas_categorias.sql | Migration 010 | Apaga categorias |

## 🚨 Como Usar

1. **Backup primeiro:**
   ```bash
   pg_dump -h host -U user -d database > backup.sql
   ```

2. **Execute o rollback:**
   ```sql
   \i 001_rollback_saude_tables.sql
   ```

3. **Verifique:**
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name LIKE 'saude_%';
   ```
