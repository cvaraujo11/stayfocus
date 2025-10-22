# 🛡️ Sanitização e Robustez Técnica - StayFocus

## 📋 Resumo das Implementações

Este documento descreve todas as melhorias de segurança e robustez técnica implementadas no projeto.

## ✅ Implementações Realizadas

### 1. Validação de Variáveis de Ambiente (`app/lib/env.ts`)

**O que faz:**
- Valida todas as variáveis de ambiente na inicialização
- Garante type-safety com TypeScript
- Separa variáveis públicas e privadas
- Fornece helpers úteis (getBaseUrl, isProduction, etc.)

**Como usar:**
```typescript
import { env, getBaseUrl, isProduction } from '@/app/lib/env'

// Usar variáveis validadas
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const baseUrl = getBaseUrl()

if (isProduction()) {
  // Código específico de produção
}
```

### 2. Schemas de Validação (`app/lib/validation/schemas.ts`)

**O que faz:**
- Valida todos os inputs de usuário com Zod
- Sanitiza strings e HTML
- Fornece tipos TypeScript automáticos
- Previne SQL injection e XSS

**Como usar:**
```typescript
import { loginSchema, sanitizeString } from '@/app/lib/validation/schemas'

// Validar dados
const result = loginSchema.safeParse(formData)
if (!result.success) {
  // Tratar erros de validação
  console.error(result.error.issues)
}

// Sanitizar string
const clean = sanitizeString(userInput)
```

**Schemas disponíveis:**
- `loginSchema` - Login de usuário
- `registerSchema` - Registro com validação de senha forte
- `profileSchema` - Atualização de perfil
- `taskSchema` - Criação/edição de tarefas
- `medicationSchema` - Gerenciamento de medicamentos
- `sleepSchema` - Registro de sono
- `financeSchema` - Transações financeiras
- `studySchema` - Sessões de estudo

### 3. Rate Limiting (`app/lib/security/rate-limit.ts`)

**O que faz:**
- Limita requisições por IP/usuário
- Previne brute force attacks
- Configurações personalizadas por endpoint
- Cleanup automático de memória

**Como usar:**
```typescript
import { checkRateLimit, rateLimitConfigs } from '@/app/lib/security/rate-limit'

// Em uma API route
try {
  checkRateLimit(userIp, rateLimitConfigs.auth)
  // Processar requisição
} catch (error) {
  if (error instanceof RateLimitError) {
    return Response.json(
      { error: error.message },
      { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
    )
  }
}
```

**Configurações:**
- `auth`: 5 tentativas / 15 minutos (login, registro)
- `api`: 60 requisições / minuto (APIs gerais)
- `strict`: 3 tentativas / hora (reset de senha)

### 4. Sistema de Logging (`app/lib/logger.ts`)

**O que faz:**
- Logging estruturado com níveis
- Contexto adicional em cada log
- Logs de segurança e performance
- Filtragem automática em produção

**Como usar:**
```typescript
import { logger, measurePerformance } from '@/app/lib/logger'

// Logs básicos
logger.info('User logged in', { userId: '123' })
logger.error('Database error', error, { query: 'SELECT...' })
logger.warn('Deprecated API used')
logger.debug('Debug info')

// Logs especiais
logger.security('Failed login attempt', { ip: '1.2.3.4' })
logger.performance('Database query', 150, { table: 'users' })

// Medir performance automaticamente
await measurePerformance('fetchUsers', async () => {
  return await db.users.findMany()
})
```

### 5. Error Handling (`app/lib/errors.ts`)

**O que faz:**
- Classes de erro customizadas
- Mensagens seguras para o cliente
- Logging automático de erros
- Tratamento de erros Zod

**Como usar:**
```typescript
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  handleError 
} from '@/app/lib/errors'

// Lançar erros específicos
throw new ValidationError('Email inválido', { email: 'Email é obrigatório' })
throw new AuthenticationError()
throw new NotFoundError('Usuário')

// Em API routes
try {
  // Código da API
} catch (error) {
  const errorResponse = handleError(error)
  return Response.json(errorResponse, { status: errorResponse.statusCode })
}
```

**Classes disponíveis:**
- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `RateLimitError` (429)
- `DatabaseError` (500)
- `ExternalServiceError` (502)

### 6. CSRF Protection (`app/lib/security/csrf.ts`)

**O que faz:**
- Gera tokens CSRF únicos
- Valida tokens em requisições
- Previne timing attacks
- Cookies seguros

**Como usar:**
```typescript
import { setCsrfToken, validateCsrfToken, CSRF_HEADER_NAME } from '@/app/lib/security/csrf'

// Gerar token (em página)
const token = await setCsrfToken()

// Validar token (em API)
const headerToken = request.headers.get(CSRF_HEADER_NAME)
const isValid = await validateCsrfToken(headerToken)

if (!isValid) {
  throw new AuthorizationError('Invalid CSRF token')
}
```

### 7. Security Headers (`next.config.js`)

**O que faz:**
- Headers de segurança HTTP
- Proteção contra XSS, clickjacking, etc.
- HSTS para forçar HTTPS
- Permissions Policy

**Headers configurados:**
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

### 8. Script de Verificação (`scripts/security-check.sh`)

**O que faz:**
- Verifica variáveis de ambiente
- Audita dependências vulneráveis
- Checa arquivos sensíveis no Git
- Valida TypeScript
- Verifica security headers

**Como usar:**
```bash
# Executar verificação completa
npm run security:check

# Auditar dependências
npm run security:audit

# Antes do build (automático)
npm run build
```

## 🚀 Como Usar no Projeto

### Em Componentes React

```typescript
'use client'

import { useState } from 'react'
import { loginSchema, type LoginInput } from '@/app/lib/validation/schemas'
import { logger } from '@/app/lib/logger'

export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    // Validar
    const result = loginSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      // Fazer login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      logger.info('Login successful')
    } catch (error) {
      logger.error('Login error', error)
      setErrors({ general: 'Erro ao fazer login' })
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

### Em API Routes (App Router)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimitConfigs } from '@/app/lib/security/rate-limit'
import { validateCsrfToken, CSRF_HEADER_NAME } from '@/app/lib/security/csrf'
import { loginSchema } from '@/app/lib/validation/schemas'
import { handleError, AuthenticationError } from '@/app/lib/errors'
import { logger } from '@/app/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.ip || 'unknown'
    checkRateLimit(ip, rateLimitConfigs.auth)

    // 2. CSRF validation
    const csrfToken = request.headers.get(CSRF_HEADER_NAME)
    const isValidCsrf = await validateCsrfToken(csrfToken)
    if (!isValidCsrf) {
      throw new AuthenticationError('Invalid CSRF token')
    }

    // 3. Validar input
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // 4. Processar
    // ... lógica de login

    logger.info('Login successful', { email: validatedData.email })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorResponse = handleError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
```

### Em Server Actions

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { taskSchema } from '@/app/lib/validation/schemas'
import { handleError, AuthenticationError } from '@/app/lib/errors'
import { logger } from '@/app/lib/logger'
import { requireAuth } from '@/app/lib/supabase/auth-helpers'
import { createSupabaseServerComponent } from '@/app/lib/supabase/server'

export async function createTask(formData: FormData) {
  try {
    // 1. Autenticação (segura - valida com servidor)
    const user = await requireAuth()
    
    // Ou use getAuthenticatedUser() se quiser tratar null manualmente:
    // const user = await getAuthenticatedUser()
    // if (!user) throw new AuthenticationError()

    // 2. Validar
    const data = Object.fromEntries(formData)
    const validatedData = taskSchema.parse(data)

    // 3. Inserir no banco
    const supabase = createSupabaseServerComponent()
    const { error } = await supabase
      .from('tasks')
      .insert({ ...validatedData, user_id: user.id })

    if (error) throw error

    logger.info('Task created', { userId: user.id })

    // 4. Revalidar
    revalidatePath('/tasks')

    return { success: true }
  } catch (error) {
    logger.error('Failed to create task', error)
    return handleError(error)
  }
}
```

## 📊 Checklist de Uso

### Antes de Criar uma Nova Feature

- [ ] Criar schema de validação em `app/lib/validation/schemas.ts`
- [ ] Usar `logger` para eventos importantes
- [ ] Implementar rate limiting em APIs públicas
- [ ] Adicionar CSRF protection em formulários
- [ ] Tratar erros com classes customizadas
- [ ] Validar variáveis de ambiente necessárias

### Antes do Deploy

- [ ] Executar `npm run security:check`
- [ ] Executar `npm run security:audit`
- [ ] Verificar variáveis de ambiente no Vercel
- [ ] Testar rate limiting
- [ ] Revisar logs de segurança
- [ ] Verificar RLS no Supabase

## 🔧 Manutenção

### Atualizar Dependências

```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências com vulnerabilidades
npm audit fix

# Atualizar todas as dependências
npm update
```

### Monitorar Logs

```bash
# Em desenvolvimento, todos os logs aparecem no console
# Em produção, configure um serviço de logging (Sentry, LogRocket, etc.)
```

### Testar Rate Limiting

```bash
# Use ferramentas como Apache Bench ou wrk
ab -n 100 -c 10 http://localhost:3000/api/endpoint
```

## 📚 Recursos Adicionais

- [Documentação de Segurança](./SECURITY.md)
- [Guia de SEO](./SEO-METADATA-GUIA.md)
- [Guia de Autenticação Google](./auth/GUIA-GOOGLE-AUTH.md)

## 🎯 Próximos Passos Recomendados

1. **Implementar DOMPurify** para sanitização HTML mais robusta
2. **Adicionar Sentry** para monitoramento de erros em produção
3. **Configurar Redis/Upstash** para rate limiting distribuído
4. **Implementar 2FA** para autenticação de dois fatores
5. **Adicionar testes de segurança** automatizados
6. **Configurar WAF** (Web Application Firewall) no Vercel
7. **Implementar Content Security Policy** mais restritiva
8. **Adicionar backup automático** do banco de dados

---

**Última atualização**: 2025-10-21
