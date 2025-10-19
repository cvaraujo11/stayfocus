# ✅ Migrações Aplicadas

Histórico de todas as migrações já executadas no banco de dados.

## 📋 Lista de Migrações

| # | Arquivo | Descrição | Data Aplicação |
|---|---------|-----------|----------------|
| 001 | create_saude_tables.sql | Tabelas de saúde (medicamentos, tomadas, humor) | 2025-10-17 |
| 002 | create_alimentacao_complete.sql | Tabelas de alimentação | 2025-10-17 |
| 003 | create_alimentacao_planejamento.sql | Planejamento de refeições | 2025-10-17 |
| 004 | create_alimentacao_hidratacao.sql | Tracking de hidratação | 2025-10-17 |
| 005 | configure_rls_alimentacao_refeicoes.sql | RLS para refeições | 2025-10-17 |
| 006 | configure_storage_policies.sql | Políticas de storage | 2025-10-17 |
| 007 | create_cleanup_job.sql | Job de limpeza | 2025-10-17 |
| 008 | verify_security.sql | Verificação de segurança | 2025-10-17 |
| 009 | create_hiperfoco_tarefas.sql | Tarefas de hiperfoco | 2025-10-18 |
| 010 | create_financas_categorias.sql | Categorias financeiras | 2025-10-18 |

## ⚠️ Importante

- Não execute estas migrações novamente
- Para reverter, use os scripts em `../02-rollbacks/`
- Sempre faça backup antes de rollback

## 📊 Estatísticas

- **Total de migrações:** 10
- **Tabelas criadas:** 28
- **Última migração:** 2025-10-18
