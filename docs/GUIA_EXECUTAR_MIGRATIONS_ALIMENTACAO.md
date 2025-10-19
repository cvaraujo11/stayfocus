# Guia de Execução das Migrations - Alimentação

## Pré-requisitos

1. Acesso ao painel do Supabase
2. Permissões para executar SQL
3. Backup do banco de dados (recomendado)

## Ordem de Execução

### 1. Criar Tabela de Planejamento de Refeições
**Arquivo:** `docs/migrations/003_create_alimentacao_planejamento.sql`

```bash
# Copiar e executar no SQL Editor do Supabase
```

### 2. Criar Tabela de Hidratação
**Arquivo:** `docs/migrations/004_create_alimentacao_hidratacao.sql`

```bash
# Copiar e executar no SQL Editor do Supabase
```

### 3. Configurar RLS para alimentacao_refeicoes
**Arquivo:** `docs/migrations/005_configure_rls_alimentacao_refeicoes.sql`

```bash
# Copiar e executar no SQL Editor do Supabase
```

### 4. Configurar Storage Policies
**Arquivo:** `docs/migrations/006_configure_storage_policies.sql`

```bash
# Copiar e executar no SQL Editor do Supabase
```

### 5. Criar Job de Limpeza (Opcional)
**Arquivo:** `docs/migrations/007_create_cleanup_job.sql`

**NOTA:** Verifique se a extensão `pg_cron` está disponível antes de executar. Esta migration é opcional e pode ser executada depois.

### 6. Verificar Segurança
**Arquivo:** `docs/migrations/008_verify_security.sql`

Execute este script para validar que tudo está configurado corretamente.

## Pós-Migration

### Atualizar Types do Database

Após executar as migrations, você precisa regenerar os tipos do TypeScript:

1. No painel do Supabase, vá em **Settings** > **API**
2. Role até a seção **Database Types**
3. Copie os tipos gerados
4. Atualize o arquivo `app/types/database.ts`

OU use o CLI do Supabase:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/types/database.ts
```

### Verificar Erros de Tipo

Após atualizar `database.ts`, os erros de tipo no arquivo `alimentacaoStore.ts` devem desaparecer automaticamente, pois as tabelas agora existirão nos tipos.

## Rollback

Se precisar reverter as mudanças:

```bash
# Reverter hidratação
psql < docs/migrations/004_rollback_alimentacao_hidratacao.sql

# Reverter planejamento
psql < docs/migrations/003_rollback_alimentacao_planejamento.sql
```

## Teste Pós-Migration

1. Verifique se as tabelas foram criadas:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'alimentacao_%';
```

2. Verifique RLS:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'alimentacao_%';
```

3. Verifique policies:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'alimentacao_%';
```

## Troubleshooting

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

A migration 007 (cleanup job) é opcional. Pule esta etapa se a extensão não estiver disponível.

### Erros de Tipo no TypeScript

Certifique-se de que regenerou os tipos após executar as migrations.
