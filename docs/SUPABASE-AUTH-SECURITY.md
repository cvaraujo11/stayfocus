# 🔒 Segurança de Autenticação Supabase

## ⚠️ Vulnerabilidade: getSession() vs getUser()

### O Problema

O Supabase emite um aviso importante:

> Using the user object as returned from `supabase.auth.getSession()` or from some `supabase.auth.onAuthStateChange()` events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use `supabase.auth.getUser()` instead which authenticates the data by contacting the Supabase Auth server.

### Por que isso é perigoso?

**`getSession()`**:
- ❌ Lê dados diretamente dos cookies
- ❌ **NÃO valida** se os dados são autênticos
- ❌ Cookies podem ser manipulados por atacantes
- ❌ Um atacante pode se passar por outro usuário

**`getUser()`**:
- ✅ Valida os dados com o servidor Supabase Auth
- ✅ Garante que a sessão é legítima
- ✅ Previne session spoofing
- ✅ Seguro para decisões de autorização

### Exemplo de Ataque

1. Usuário A está autenticado
2. Atacante copia os cookies do Usuário A
3. Atacante usa os cookies em sua própria sessão
4. Se você usar `getSession()`, o atacante terá acesso como Usuário A
5. Se você usar `getUser()`, o servidor detecta a manipulação e nega acesso

## ✅ Correções Implementadas

### 1. Middleware (`middleware.ts`)

**Antes** ❌:
```typescript
const { data: { session } } = await supabase.auth.getSession()

if (session && isPublicRoute) {
  // Redirecionar
}
```

**Depois** ✅:
```typescript
const { data: { user } } = await supabase.auth.getUser()

if (user && isPublicRoute) {
  // Redirecionar
}
```

### 2. AuthContext (`app/contexts/AuthContext.tsx`)

**Antes** ❌:
```typescript
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session)
  setUser(session?.user ?? null)
})
```

**Depois** ✅:
```typescript
// Primeiro valida o usuário
supabase.auth.getUser().then(({ data: { user } }) => {
  setUser(user)
  // Depois pega a sessão (já validada)
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
  })
})
```

### 3. Auth State Changes

**Antes** ❌:
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  setUser(session?.user ?? null)
})
```

**Depois** ✅:
```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    // Valida o usuário antes de confiar
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  } else {
    setUser(null)
  }
})
```

## 🛠️ Helpers Seguros

Criamos helpers para facilitar o uso correto:

### Server-Side

```typescript
import { getAuthenticatedUser, requireAuth } from '@/app/lib/supabase/auth-helpers'

// Opção 1: Retorna null se não autenticado
const user = await getAuthenticatedUser()
if (!user) {
  return { error: 'Not authenticated' }
}

// Opção 2: Lança erro se não autenticado
const user = await requireAuth() // Throws if not authenticated
```

### Client-Side

```typescript
import { getAuthenticatedUserClient, isAuthenticatedClient } from '@/app/lib/supabase/auth-helpers'

// Verificar autenticação
const isAuth = await isAuthenticatedClient()

// Obter usuário
const user = await getAuthenticatedUserClient()
```

## 📋 Quando usar cada método

### Use `getUser()` ✅

- **Sempre** para verificar autenticação
- **Sempre** para decisões de autorização
- Em middleware
- Em API routes
- Em Server Actions
- Antes de operações sensíveis

### Use `getSession()` ⚠️

- **Apenas** depois de validar com `getUser()`
- Para obter dados da sessão (não para validação)
- Para obter tokens de acesso
- Em contextos onde o usuário já foi validado

### Exemplo Completo

```typescript
// ✅ CORRETO
async function protectedAction() {
  // 1. Validar usuário
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }
  
  // 2. Agora é seguro usar a sessão
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  
  // 3. Fazer operação protegida
  // ...
}

// ❌ INCORRETO
async function insecureAction() {
  // NÃO FAÇA ISSO!
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // Cookies podem ter sido manipulados!
    // Não confie neste usuário
  }
}
```

## 🔍 Como Verificar

### Buscar usos inseguros

```bash
# Procurar por getSession() sem getUser() antes
grep -r "getSession()" --include="*.ts" --include="*.tsx"
```

### Padrão seguro

Sempre que você ver `getSession()`, certifique-se de que:
1. Há um `getUser()` antes, OU
2. É usado apenas para obter dados da sessão (não para validação)

## 📚 Referências

- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Session Security Best Practices](https://supabase.com/docs/guides/auth/sessions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Status

- [x] Middleware corrigido
- [x] AuthContext corrigido
- [x] Helpers seguros criados
- [x] Documentação atualizada
- [x] Exemplos de uso adicionados

---

**Última atualização**: 2025-10-21
