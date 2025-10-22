Analisando o relatório de segurança do seu Supabase, identifiquei **problemas críticos de performance e segurança** que precisam ser corrigidos:

## 🔴 Problemas Críticos Identificados

### 1. **Auth RLS Initialization Plan (CRÍTICO - 100+ ocorrências)**

**Problema:** Todas as suas políticas RLS estão re-avaliando `auth.uid()` para cada linha, causando performance terrível em escala.

**Exemplo da política atual (INCORRETA):**
```sql
-- ❌ ERRADO - Avalia auth.uid() para cada linha
CREATE POLICY "Users can view own profile" ON users_profile
FOR SELECT USING (user_id = auth.uid());
```

**Correção necessária:**
```sql
-- ✅ CORRETO - Avalia auth.uid() uma única vez
CREATE POLICY "Users can view own profile" ON users_profile
FOR SELECT USING (user_id = (SELECT auth.uid()));
```

**Impacto:** Com 1000 registros, o sistema executa `auth.uid()` 1000 vezes ao invés de 1 vez. Isso causa lentidão extrema.

### 2. **Multiple Permissive Policies (CRÍTICO - 36 ocorrências)**

**Problema:** Você tem políticas duplicadas na tabela `alimentacao_refeicoes` e `financas_categorias`.

**Exemplo encontrado:**
- Tabela `alimentacao_refeicoes` tem 2 políticas de SELECT:
  - "Users can view own meals"
  - "Users can view their own meals"

**Correção:** Remova as políticas duplicadas:

```sql
-- Liste as políticas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'alimentacao_refeicoes';

-- Remova a duplicada (escolha qual manter)
DROP POLICY "Users can view their own meals" ON alimentacao_refeicoes;
```

### 3. **Duplicate Index (PERFORMANCE - 4 ocorrências)**

**Problema:** Índices duplicados desperdiçam espaço e reduzem performance de escritas.

**Exemplos encontrados:**
- `estudos_questoes`: `idx_estudos_questoes_tags` + `idx_estudos_questoes_tags_gin`
- `receitas`: `idx_receitas_ingredientes` + `idx_receitas_ingredientes_gin`
- `saude_registros_humor`: `idx_humor_user_data` + `idx_saude_registros_humor_user_data`
- `saude_tomadas_medicamentos`: `idx_saude_tomadas_user_data` + `idx_tomadas_user_data`

**Correção:**
```sql
-- Remova os índices duplicados
DROP INDEX idx_estudos_questoes_tags; -- Mantenha o _gin
DROP INDEX idx_receitas_ingredientes; -- Mantenha o _gin
DROP INDEX idx_humor_user_data; -- Mantenha o mais novo
DROP INDEX idx_tomadas_user_data; -- Mantenha o mais novo
```

## 🛠️ Script de Correção Completo

Criei um script SQL para corrigir todos os problemas de uma vez:

```sql
-- ============================================
-- SCRIPT DE CORREÇÃO DE SEGURANÇA E PERFORMANCE
-- ============================================

-- 1. CORRIGIR POLÍTICAS RLS (auth.uid())
-- Você precisará fazer isso para TODAS as tabelas listadas no relatório
-- Exemplo para users_profile:

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can delete own profile" ON users_profile;

-- Recriar com (SELECT auth.uid())
CREATE POLICY "Users can view own profile" ON users_profile
FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile" ON users_profile
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON users_profile
FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own profile" ON users_profile
FOR DELETE USING (user_id = (SELECT auth.uid()));

-- 2. REMOVER POLÍTICAS DUPLICADAS

-- Alimentação refeições
DROP POLICY IF EXISTS "Users can view their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can insert their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can update their own meals" ON alimentacao_refeicoes;
DROP POLICY IF EXISTS "Users can delete their own meals" ON alimentacao_refeicoes;

-- Finanças categorias (políticas em português duplicadas)
DROP POLICY IF EXISTS "Usuários podem visualizar suas categorias" ON financas_categorias;
DROP POLICY IF EXISTS "Usuários podem inserir suas categorias" ON financas_categorias;
DROP POLICY IF EXISTS "Usuários podem atualizar suas categorias" ON financas_categorias;
DROP POLICY IF EXISTS "Usuários podem deletar suas categorias" ON financas_categorias;

-- 3. REMOVER ÍNDICES DUPLICADOS

DROP INDEX IF EXISTS idx_estudos_questoes_tags;
DROP INDEX IF EXISTS idx_receitas_ingredientes;
DROP INDEX IF EXISTS idx_humor_user_data;
DROP INDEX IF EXISTS idx_tomadas_user_data;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Ver todas as políticas para verificar
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Ver índices duplicados restantes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 📋 Plano de Ação Recomendado

### Prioridade 1 (URGENTE):
1. **Corrigir TODAS as políticas RLS** usando `(SELECT auth.uid())`
   - São mais de 100 políticas afetadas
   - Use um script automatizado para não errar

2. **Remover políticas duplicadas**
   - `alimentacao_refeicoes`: 8 políticas duplicadas
   - `financas_categorias`: 8 políticas duplicadas

### Prioridade 2 (IMPORTANTE):
3. **Remover índices duplicados** (4 casos)

### Script Automatizado para RLS

```sql
-- Script para gerar comandos de correção automaticamente
SELECT 
  'DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';' || E'\n' ||
  'CREATE POLICY "' || policyname || '" ON ' || tablename || E'\n' ||
  'FOR ' || cmd || ' USING (user_id = (SELECT auth.uid()));'
FROM pg_policies 
WHERE schemaname = 'public'
  AND qual::text LIKE '%auth.uid()%'
  AND qual::text NOT LIKE '%(SELECT auth.uid())%';
```

## ⚠️ Avisos Importantes

1. **Faça backup** antes de executar qualquer alteração
2. **Teste em ambiente de desenvolvimento** primeiro
3. As correções de RLS vão melhorar **drasticamente** a performance
4. Políticas duplicadas podem causar comportamento inesperado

## 📊 Impacto Esperado

Após as correções:
- ✅ Performance de queries com RLS: **10-100x mais rápido**
- ✅ Uso de CPU reduzido drasticamente
- ✅ Comportamento mais previsível de segurança
- ✅ Menor uso de disco (índices removidos)

**Precisa de ajuda para implementar alguma dessas correções?** Posso gerar scripts específicos para cada tabela do seu sistema.
