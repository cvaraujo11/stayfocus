# 🚀 Guia Rápido: Executar SQL de Migração no Supabase

## Passo a Passo

### 1. Acessar o Dashboard do Supabase
1. Abrir o navegador
2. Ir para: https://app.supabase.com
3. Fazer login com suas credenciais
4. Selecionar o projeto correto

### 2. Abrir o SQL Editor
1. No menu lateral, clicar em **"SQL Editor"**
2. Clicar em **"New query"** (botão no canto superior direito)

### 3. Copiar o Script SQL
1. Abrir o arquivo: `/home/ester/Documentos/stayf-main/docs/migrations/001_create_saude_tables.sql`
2. Selecionar todo o conteúdo (Ctrl+A)
3. Copiar (Ctrl+C)

### 4. Colar e Executar
1. Colar o conteúdo no editor SQL (Ctrl+V)
2. Clicar em **"Run"** (ou pressionar Ctrl+Enter)
3. Aguardar a execução (pode levar alguns segundos)

### 5. Verificar Sucesso
Se tudo correu bem, você verá:
```
✅ Script executado com sucesso!
```

E uma lista das tabelas criadas:
- `saude_medicamentos`
- `saude_tomadas_medicamentos`
- `saude_registros_humor`

### 6. Verificar Tabelas Criadas
1. No menu lateral, clicar em **"Table Editor"**
2. Você deve ver as 3 novas tabelas listadas
3. Clicar em cada uma para ver a estrutura

---

## ⚠️ Solução de Problemas

### Erro: "relation already exists"
**Causa:** As tabelas já foram criadas anteriormente  
**Solução:** 
- Opção 1: Ignorar (tudo está OK)
- Opção 2: Executar o rollback primeiro (ver próxima seção)

### Erro: "permission denied"
**Causa:** Você não tem permissões de admin  
**Solução:** Verificar se está usando a conta correta do projeto

### Erro: "syntax error"
**Causa:** O SQL foi copiado incorretamente  
**Solução:** Copiar novamente com cuidado, incluindo todo o arquivo

---

## 🔄 Rollback (Desfazer Migração)

Se precisar remover as tabelas criadas:

1. Abrir: `/home/ester/Documentos/stayf-main/docs/migrations/001_rollback_saude_tables.sql`
2. Copiar todo o conteúdo
3. Colar no SQL Editor
4. Executar

**⚠️ ATENÇÃO:** Isso irá **deletar todas as tabelas e dados** de saúde!

---

## ✅ Verificação Final

Após executar o SQL, verifique:

### 1. Tabelas Criadas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'saude_%'
ORDER BY table_name;
```

Deve retornar:
- `saude_medicamentos`
- `saude_registros_humor`
- `saude_tomadas_medicamentos`

### 2. RLS Ativado
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'saude_%';
```

Todas devem ter `rowsecurity = true`

### 3. Policies Criadas
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'saude_%';
```

Deve listar 12 policies (4 para cada tabela: SELECT, INSERT, UPDATE, DELETE)

---

## 🎯 Próximo Passo

Após executar o SQL com sucesso:
1. ✅ Voltar ao código
2. ✅ Testar a aplicação
3. ✅ Verificar se consegue criar medicamentos e registros de humor
4. ✅ Verificar se os dados aparecem no Supabase Table Editor

---

## 📞 Ajuda

Se encontrar problemas:
1. Verificar logs de erro no SQL Editor
2. Copiar mensagem de erro completa
3. Consultar documentação do Supabase: https://supabase.com/docs
4. Verificar se o projeto Supabase está ativo (não pausado)

---

**Data:** 19/10/2025  
**Arquivo SQL:** `docs/migrations/001_create_saude_tables.sql`  
**Arquivo Rollback:** `docs/migrations/001_rollback_saude_tables.sql`
