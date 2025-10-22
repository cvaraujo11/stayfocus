# Centralização de Variáveis de Ambiente

Este documento descreve a refatoração realizada para centralizar o acesso às variáveis de ambiente através do módulo `app/lib/env.ts`.

## Motivação

Antes da refatoração, múltiplos arquivos acessavam `process.env` diretamente, causando:
- ❌ Duplicação de código
- ❌ Risco de runtime errors por variáveis não definidas
- ❌ Falta de validação centralizada
- ❌ Uso do operador de asserção não-nula `!` em todo o código

## Solução Implementada

Centralizamos todo o acesso a variáveis de ambiente através do módulo `app/lib/env.ts`, que:
- ✅ Valida variáveis com Zod na inicialização
- ✅ Fornece TypeScript autocomplete
- ✅ Falha rápido se variáveis estão ausentes/inválidas
- ✅ Elimina operadores de asserção não-nula
- ✅ Fornece helpers úteis (`isDevelopment()`, `isProduction()`, `getBaseUrl()`)

## Arquivos Refatorados

### 1. Supabase Clients
- `app/lib/supabase/server.ts`
- `app/lib/supabase/client.ts`
- `middleware.ts`

**Antes:**
```typescript
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  // ...
)
```

**Depois:**
```typescript
import { env } from '@/app/lib/env'

const supabase = createServerClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // ...
)
```

### 2. Verificações de Ambiente
- `middleware.ts`
- `app/auth/callback/route.ts`
- `app/lib/errors.ts`
- `app/lib/security/csrf.ts`
- `app/components/common/ErrorMessage.tsx`

**Antes:**
```typescript
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug info')
}
```

**Depois:**
```typescript
import { isDevelopment } from '@/app/lib/env'

if (isDevelopment()) {
  console.log('Debug info')
}
```

### 3. Base URL
- `app/robots.ts`
- `app/sitemap.ts`
- `app/layout.tsx`
- `app/lib/metadata.ts`
- `app/components/seo/JsonLd.tsx`

**Antes:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stayfocus-alpha.vercel.app'
```

**Depois:**
```typescript
import { getBaseUrl } from '@/app/lib/env'

const baseUrl = getBaseUrl()
```

## Módulo env.ts

### Exports Disponíveis

```typescript
// Variáveis validadas
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: string,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string,
  NEXT_PUBLIC_BASE_URL?: string,
  NODE_ENV: 'development' | 'production' | 'test'
}

// Variáveis server-only (apenas no servidor)
export const serverEnv = {
  ...env,
  SUPABASE_SERVICE_ROLE_KEY?: string,
  SESSION_SECRET?: string,
  PPLX_API_KEY?: string
}

// Helpers
export const getBaseUrl = () => string
export const isProduction = () => boolean
export const isDevelopment = () => boolean
```

### Validação com Zod

O módulo valida todas as variáveis na inicialização:
- URLs devem ser válidas
- Strings obrigatórias não podem estar vazias
- NODE_ENV deve ser 'development', 'production' ou 'test'

Se alguma validação falhar, a aplicação não inicia e mostra erro claro.

## Benefícios Alcançados

### 1. Type Safety
```typescript
// ✅ Autocomplete funciona
env.NEXT_PUBLIC_SUPABASE_URL

// ✅ TypeScript detecta erros
env.INVALID_VAR // Error: Property 'INVALID_VAR' does not exist
```

### 2. Runtime Validation
```typescript
// Se NEXT_PUBLIC_SUPABASE_URL não estiver definida ou for inválida,
// a aplicação falha na inicialização com mensagem clara:
// ❌ Invalid environment variables: NEXT_PUBLIC_SUPABASE_URL must be a valid URL
```

### 3. Código Mais Limpo
```typescript
// ❌ Antes - repetitivo e propenso a erros
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ Depois - limpo e seguro
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Helpers Úteis
```typescript
// ❌ Antes
if (process.env.NODE_ENV === 'production') { }
if (process.env.NODE_ENV !== 'production') { }

// ✅ Depois
if (isProduction()) { }
if (isDevelopment()) { }
```

## Checklist de Uso

### Ao Adicionar Nova Variável de Ambiente

1. [ ] Adicionar ao schema Zod em `app/lib/env.ts`
2. [ ] Adicionar ao `.env.local` (desenvolvimento)
3. [ ] Adicionar ao `.env.example` (documentação)
4. [ ] Configurar no Vercel (produção)
5. [ ] Usar `env.VARIABLE` no código (não `process.env.VARIABLE`)

### Ao Usar Variáveis Existentes

- ✅ Importar de `@/app/lib/env`
- ✅ Usar `env.VARIABLE` (sem `!`)
- ✅ Usar helpers quando apropriado (`isDevelopment()`, `getBaseUrl()`)
- ❌ Nunca usar `process.env` diretamente fora de `env.ts`

## Verificação

Para verificar que não há usos diretos de `process.env` fora do módulo:

```bash
# Deve retornar apenas app/lib/env.ts
grep -r "process\.env\." app/ --exclude-dir=node_modules
```

## Migração de Código Legado

Se encontrar código usando `process.env` diretamente:

1. Identifique a variável sendo acessada
2. Verifique se está no schema em `env.ts`
3. Se não estiver, adicione ao schema
4. Substitua `process.env.VAR!` por `env.VAR`
5. Adicione import: `import { env } from '@/app/lib/env'`

## Referências

- Zod Documentation: https://zod.dev/
- Next.js Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- TypeScript Type Safety: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

---

**Última atualização**: 2025-10-22  
**Versão**: 1.0
