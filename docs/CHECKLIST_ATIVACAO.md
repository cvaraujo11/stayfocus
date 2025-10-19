# ✅ CHECKLIST DE ATIVAÇÃO - Implementação Alimentação

## 🚀 Passo a Passo para Ativar as Funcionalidades

### 1️⃣ Executar Migrations no Supabase

**Acesse:** [Supabase Dashboard](https://app.supabase.com) → Seu Projeto → SQL Editor

**Executar nesta ordem:**

- [ ] **Migration 003** - Planejamento
  ```
  Arquivo: docs/migrations/003_create_alimentacao_planejamento.sql
  Copiar e colar no SQL Editor → Run
  ```

- [ ] **Migration 004** - Hidratação
  ```
  Arquivo: docs/migrations/004_create_alimentacao_hidratacao.sql
  Copiar e colar no SQL Editor → Run
  ```

- [ ] **Migration 005** - RLS Refeições
  ```
  Arquivo: docs/migrations/005_configure_rls_alimentacao_refeicoes.sql
  Copiar e colar no SQL Editor → Run
  ```

- [ ] **Migration 006** - Storage Policies
  ```
  Arquivo: docs/migrations/006_configure_storage_policies.sql
  Copiar e colar no SQL Editor → Run
  ```

- [ ] **Migration 008** - Verificação (opcional)
  ```
  Arquivo: docs/migrations/008_verify_security.sql
  Copiar e colar no SQL Editor → Run
  Ver resultados para confirmar tudo OK
  ```

### 2️⃣ Regenerar Tipos do Database

- [ ] Abrir terminal no projeto
- [ ] Executar comando:
  ```bash
  npx supabase gen types typescript --project-id SEU_PROJECT_ID > app/types/database.ts
  ```
  
  **OU** copiar manualmente do Supabase:
  - Dashboard → Settings → API → Database Types
  - Copiar todo o código
  - Substituir conteúdo de `app/types/database.ts`

### 3️⃣ Verificar Compilação

- [ ] Executar:
  ```bash
  npm run build
  ```
  
- [ ] Verificar que não há erros de tipo TypeScript
- [ ] Se houver erros, confirmar se os tipos foram atualizados corretamente

### 4️⃣ Testar Funcionalidades

#### Planejador de Refeições
- [ ] Acessar `/alimentacao`
- [ ] Adicionar uma refeição planejada
- [ ] Editar a refeição
- [ ] Remover a refeição
- [ ] Verificar se dados persistem após refresh
- [ ] Testar em outro dispositivo/navegador (real-time)

#### Lembrete de Hidratação
- [ ] Acessar `/alimentacao`
- [ ] Clicar em "Registrar Copo"
- [ ] Ajustar meta diária
- [ ] Clicar em "Remover Copo"
- [ ] Verificar se dados persistem após refresh
- [ ] Testar em outro dispositivo/navegador (real-time)

### 5️⃣ Verificar Segurança

- [ ] Criar 2 contas de teste diferentes
- [ ] Verificar que cada usuário só vê seus próprios dados
- [ ] Tentar acessar dados de outro usuário (deve falhar)
- [ ] Verificar fotos no Storage (deve estar organizado por user_id)

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### ❌ Erro: "Table does not exist"
**Solução:** Execute as migrations no Supabase (Passo 1)

### ❌ Erros de tipo TypeScript
**Solução:** Regenere os tipos (Passo 2)

### ❌ Erro: "Policy violation"
**Solução:** Execute migration 005 e 006 novamente

### ❌ Erro: "Function update_updated_at_column does not exist"
**Solução:** Execute este SQL primeiro:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### ❌ Dados não aparecem após adicionar
**Solução:** 
- Verificar console do navegador para erros
- Verificar se usuário está autenticado
- Verificar RLS policies

---

## 📋 VALIDAÇÃO FINAL

Após completar todos os passos, confirme:

- [x] Migrations executadas sem erro
- [x] Tipos regenerados
- [x] Build sem erros
- [x] Planejador funcionando
- [x] Hidratação funcionando
- [x] Real-time sync funcionando
- [x] RLS impedindo acesso entre usuários
- [x] Storage com policies corretas

---

## 🎉 PARABÉNS!

Se todos os itens estão marcados, a implementação está completa e funcionando!

O módulo de Alimentação agora está **100% integrado com Supabase** com:
- ✅ Persistência de dados
- ✅ Real-time sync
- ✅ Segurança (RLS)
- ✅ Storage protegido

---

**Última atualização:** 19 de outubro de 2025
