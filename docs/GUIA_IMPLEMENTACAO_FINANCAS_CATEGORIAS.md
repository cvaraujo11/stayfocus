# 📊 Guia de Implementação - Categorias de Finanças

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura da Tabela](#estrutura-da-tabela)
3. [Categorias Padrão](#categorias-padrão)
4. [Como Executar](#como-executar)
5. [Verificação](#verificação)
6. [Rollback](#rollback)

---

## 🎯 Visão Geral

Esta migration cria a infraestrutura completa para gerenciamento de categorias financeiras no sistema StayF. A tabela `financas_categorias` permite que cada usuário personalize suas categorias de despesas e receitas.

### Funcionalidades Implementadas:
- ✅ Tabela `financas_categorias` com estrutura completa
- ✅ Row Level Security (RLS) configurado
- ✅ 8 categorias padrão criadas automaticamente
- ✅ Trigger para novos usuários
- ✅ Função para criação de categorias padrão
- ✅ Índices para otimização de performance

---

## 📊 Estrutura da Tabela

```sql
CREATE TABLE public.financas_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL,
    icone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### Campos:
| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `id` | UUID | Identificador único | `550e8400-e29b-41d4-a716-446655440000` |
| `user_id` | UUID | Referência ao usuário | `550e8400-e29b-41d4-a716-446655440000` |
| `nome` | TEXT | Nome da categoria | `Alimentação` |
| `cor` | TEXT | Cor em hexadecimal | `#FF6B6B` |
| `icone` | TEXT | Identificador do ícone | `utensils` |
| `created_at` | TIMESTAMP | Data de criação | `2025-10-19 10:30:00+00` |

### Constraints:
- `nome_minimo`: Nome deve ter no mínimo 1 caractere
- `nome_maximo`: Nome deve ter no máximo 50 caracteres
- Foreign key para `auth.users` com cascade delete

---

## 🎨 Categorias Padrão

Cada novo usuário recebe automaticamente 8 categorias padrão:

| Categoria | Cor | Ícone | Descrição |
|-----------|-----|-------|-----------|
| 🍽️ Alimentação | `#FF6B6B` | `utensils` | Supermercado, restaurantes, delivery |
| 🚗 Transporte | `#4ECDC4` | `car` | Combustível, transporte público, aplicativos |
| 🏠 Moradia | `#45B7D1` | `home` | Aluguel, condomínio, contas da casa |
| ❤️ Saúde | `#96CEB4` | `heart` | Consultas, medicamentos, plano de saúde |
| 🎵 Lazer | `#FFEAA7` | `music` | Entretenimento, hobbies, viagens |
| 🛒 Compras | `#DFE6E9` | `shopping-cart` | Vestuário, eletrônicos, presentes |
| 📚 Educação | `#74B9FF` | `book` | Cursos, livros, material escolar |
| 📦 Outros | `#B2BEC3` | `more-horizontal` | Despesas diversas |

### Ícones Disponíveis (Lucide React):
Baseado no componente `RastreadorGastos.tsx`:
- `home` - Casa
- `shopping-cart` - Carrinho de compras
- `utensils` - Talheres
- `car` - Carro
- `heart` - Coração
- `music` - Música
- `book` - Livro
- `more-horizontal` - Mais opções

---

## 🚀 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Entre em [https://app.supabase.com](https://app.supabase.com)
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "+ New query"

3. **Cole o SQL**
   - Abra o arquivo `010_create_financas_categorias.sql`
   - Copie todo o conteúdo
   - Cole no editor SQL

4. **Execute**
   - Clique em "Run" ou pressione `Ctrl+Enter`
   - Aguarde a execução completar

5. **Verifique os Resultados**
   - Você verá mensagens de sucesso no console
   - Exemplo:
   ```
   Tabela financas_categorias criada com sucesso!
   Categorias padrão criadas para o usuário: xxx-xxx-xxx
   Categorias criadas para X usuários existentes
   Migration 010 executada com sucesso!
   ```

### Opção 2: Via Linha de Comando

```bash
# Navegue até a pasta do projeto
cd /home/ester/Documentos/stayf-main

# Execute a migration
psql -h <seu-host>.supabase.co \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f docs/migrations/010_create_financas_categorias.sql
```

---

## ✅ Verificação

### 1. Verificar se a tabela foi criada:

```sql
-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'financas_categorias'
ORDER BY ordinal_position;
```

### 2. Verificar categorias criadas:

```sql
-- Contar total de categorias
SELECT COUNT(*) as total_categorias 
FROM financas_categorias;

-- Listar todas as categorias
SELECT 
    u.email,
    c.nome,
    c.cor,
    c.icone,
    c.created_at
FROM financas_categorias c
JOIN auth.users u ON u.id = c.user_id
ORDER BY u.email, c.nome;
```

### 3. Verificar RLS:

```sql
-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'financas_categorias';
```

### 4. Testar função de criação:

```sql
-- Criar categorias para um usuário específico
SELECT criar_categorias_financas_padrao('user-uuid-aqui');

-- Verificar se foram criadas
SELECT nome, cor, icone 
FROM financas_categorias 
WHERE user_id = 'user-uuid-aqui';
```

### 5. Verificar trigger:

```sql
-- Listar triggers da tabela auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_name LIKE '%financas_categorias%';
```

---

## 🔄 Rollback

Se precisar desfazer a migration:

### Via Supabase Dashboard:

1. Abra o SQL Editor
2. Cole o conteúdo de `010_rollback_financas_categorias.sql`
3. Execute o script

### Via Linha de Comando:

```bash
psql -h <seu-host>.supabase.co \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f docs/migrations/010_rollback_financas_categorias.sql
```

### ⚠️ ATENÇÃO:
- O rollback irá **deletar permanentemente** todos os dados de categorias
- Faça backup antes de executar o rollback
- Todas as transações que referenciam categorias podem ser afetadas

---

## 🔍 Troubleshooting

### Problema: "Tabela já existe"
**Solução:** A migration detecta e pula a criação se a tabela já existir. Isso é esperado.

### Problema: "Permissão negada"
**Solução:** Certifique-se de estar usando o usuário `postgres` com permissões de admin.

### Problema: "Categorias não aparecem no frontend"
**Verificações:**
1. Confirme que o usuário está autenticado
2. Verifique se as políticas RLS estão ativas
3. Teste a query diretamente:
   ```sql
   SELECT * FROM financas_categorias WHERE user_id = 'seu-user-id';
   ```

### Problema: "Trigger não está funcionando"
**Solução:**
1. Verifique se o trigger foi criado:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created_financas_categorias';
   ```
2. Teste manualmente com a função:
   ```sql
   SELECT criar_categorias_financas_padrao('user-id');
   ```

---

## 📝 Notas Importantes

1. **Segurança:**
   - RLS está habilitado em todas as operações
   - Usuários só podem ver/editar suas próprias categorias
   - Foreign key com CASCADE DELETE protege integridade

2. **Performance:**
   - Índices criados em `user_id` e `created_at`
   - Consultas otimizadas para filtro por usuário

3. **Integração:**
   - Compatível com a estrutura atual do frontend
   - Categorias são carregadas automaticamente no `financasStore.ts`
   - Cores e ícones seguem o padrão do `RastreadorGastos.tsx`

4. **Manutenção:**
   - Novos usuários recebem categorias automaticamente via trigger
   - Usuários existentes recebem categorias na primeira execução
   - Função pode ser chamada manualmente se necessário

---

## 📚 Referências

- **Código relacionado:**
  - `app/stores/financasStore.ts` - Store de gerenciamento
  - `app/components/financas/RastreadorGastos.tsx` - Visualização
  - `app/components/financas/AdicionarDespesa.tsx` - Uso das categorias
  - `app/types/database.ts` - Definição de tipos

- **Documentação:**
  - [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
  - [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
  - [Lucide Icons](https://lucide.dev/)

---

## ✅ Checklist de Implementação

- [ ] Backup do banco de dados realizado
- [ ] Migration `010_create_financas_categorias.sql` executada
- [ ] Verificação da tabela criada
- [ ] Categorias padrão criadas para usuários existentes
- [ ] Políticas RLS testadas
- [ ] Trigger testado com novo usuário
- [ ] Frontend testado (carregar categorias)
- [ ] Frontend testado (adicionar despesa com categoria)
- [ ] Frontend testado (visualizar gráfico com categorias)
- [ ] Rollback testado em ambiente de desenvolvimento (opcional)

---

**Criado em:** 19/10/2025  
**Última atualização:** 19/10/2025  
**Versão:** 1.0
