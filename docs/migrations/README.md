# 📦 Migrations - Módulo Alimentação

## 🎯 Objetivo

Scripts SQL para criar e configurar as tabelas do módulo de alimentação no Supabase.

---

## 📋 Lista de Migrations

### Criar Tabelas

| # | Arquivo | Descrição | Status |
|---|---------|-----------|--------|
| 003 | `003_create_alimentacao_planejamento.sql` | Planejamento de refeições | ⏳ Pendente |
| 004 | `004_create_alimentacao_hidratacao.sql` | Tracking de hidratação | ⏳ Pendente |

### Configurar Segurança

| # | Arquivo | Descrição | Status |
|---|---------|-----------|--------|
| 005 | `005_configure_rls_alimentacao_refeicoes.sql` | RLS para refeições | ⏳ Pendente |
| 006 | `006_configure_storage_policies.sql` | Policies do Storage | ⏳ Pendente |

### Manutenção

| # | Arquivo | Descrição | Status |
|---|---------|-----------|--------|
| 007 | `007_create_cleanup_job.sql` | Job de limpeza | ⏳ Opcional |
| 008 | `008_verify_security.sql` | Verificação | ⏳ Verificação |

### Rollback

| # | Arquivo | Descrição | Uso |
|---|---------|-----------|-----|
| 003r | `003_rollback_alimentacao_planejamento.sql` | Desfazer migration 003 | Se necessário |
| 004r | `004_rollback_alimentacao_hidratacao.sql` | Desfazer migration 004 | Se necessário |

---

## 🚀 Como Executar

### Ordem de Execução

**IMPORTANTE:** Execute nesta ordem exata!

1. ✅ **Migration 003** - Planejamento
2. ✅ **Migration 004** - Hidratação  
3. ✅ **Migration 005** - RLS Refeições
4. ✅ **Migration 006** - Storage Policies
5. ⚪ **Migration 007** - Cleanup Job (opcional)
6. 🔍 **Migration 008** - Verificação (recomendado)

### Passos

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra cada arquivo `.sql` e copie o conteúdo
5. Cole no SQL Editor
6. Clique em **Run**
7. Verifique se executou sem erros

---

## ✅ Verificação

Após executar todas as migrations, execute:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables
WHERE table_name LIKE 'alimentacao_%';
```

**Resultado esperado:**
- `alimentacao_hidratacao`
- `alimentacao_planejamento`
- `alimentacao_refeicoes`

```sql
-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables
WHERE tablename LIKE 'alimentacao_%';
```

**Resultado esperado:** Todas com `rowsecurity = true`

---

## 🔙 Rollback

Se precisar desfazer as migrations:

```bash
# Reverter hidratação
Execute: 004_rollback_alimentacao_hidratacao.sql

# Reverter planejamento
Execute: 003_rollback_alimentacao_planejamento.sql
```

⚠️ **ATENÇÃO:** Rollback apaga TODOS os dados das tabelas!

---

## 📝 Detalhes das Migrations

### 003 - Planejamento de Refeições

**Cria:**
- Tabela `alimentacao_planejamento`
- 2 índices para otimização
- RLS habilitado
- 1 policy (ALL)
- Trigger para `updated_at`

**Campos:**
- `id`, `user_id`, `horario`, `descricao`
- `dia_semana` (0-6, opcional)
- `ativo` (boolean)
- Timestamps

### 004 - Hidratação

**Cria:**
- Tabela `alimentacao_hidratacao`
- 1 índice para otimização
- Constraint UNIQUE(user_id, data)
- RLS habilitado
- 1 policy (ALL)
- Trigger para `updated_at`

**Campos:**
- `id`, `user_id`, `data`
- `copos_bebidos` (0-N)
- `meta_diaria` (1-20)
- `ultimo_registro` (timestamp)
- Timestamps

### 005 - RLS Refeições

**Configura:**
- RLS habilitado em `alimentacao_refeicoes`
- 4 policies:
  - SELECT: visualizar próprias refeições
  - INSERT: criar refeições
  - UPDATE: editar próprias refeições
  - DELETE: remover próprias refeições

### 006 - Storage Policies

**Configura:**
- Bucket `user-photos`
- 4 policies:
  - INSERT: upload na própria pasta
  - SELECT: visualizar próprias fotos
  - UPDATE: atualizar próprias fotos
  - DELETE: remover próprias fotos
- Limite: 5MB
- Tipos: JPEG, PNG, WEBP

### 007 - Cleanup Job (Opcional)

**Cria:**
- Função `cleanup_orphaned_photos()`
- Job agendado com pg_cron (se disponível)
- Remove fotos sem registro correspondente

**Requisitos:**
- Extensão `pg_cron` (nem sempre disponível)
- Pode ser executado manualmente

### 008 - Verificação

**Verifica:**
- RLS habilitado
- Policies criadas
- Índices criados
- Bucket configurado
- Integridade dos dados

**Não modifica nada**, apenas consulta.

---

## ⚠️ Troubleshooting

### Erro: "function update_updated_at_column() does not exist"

Execute primeiro:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Erro: "extension pg_cron does not exist"

Migration 007 é opcional. Pule esta etapa.

### Erro: "table already exists"

Tabela já foi criada. Pode pular a migration ou fazer rollback primeiro.

### Erro: "policy already exists"

Policy já existe. Use `DROP POLICY IF EXISTS` antes de criar.

---

## 📚 Documentação Adicional

- **Guia completo:** [`../GUIA_EXECUTAR_MIGRATIONS_ALIMENTACAO.md`](../GUIA_EXECUTAR_MIGRATIONS_ALIMENTACAO.md)
- **Queries de verificação:** [`../QUERIES_VERIFICACAO.md`](../QUERIES_VERIFICACAO.md)
- **Checklist:** [`../CHECKLIST_ATIVACAO.md`](../CHECKLIST_ATIVACAO.md)

---

## 📊 Status

- [x] Scripts criados
- [ ] Migrations executadas
- [ ] Tipos regenerados
- [ ] Testes realizados

---

**Última atualização:** 19 de outubro de 2025
