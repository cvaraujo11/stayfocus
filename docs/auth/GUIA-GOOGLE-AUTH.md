# Guia: Implementar Google Authentication no StayFocus

**Tempo estimado:** 15-20 minutos  
**Dificuldade:** Média  
**Requer:** Conta Google Cloud Platform

---

## 📋 Índice

1. [Configurar Google Cloud Console](#parte-1-google-cloud-console)
2. [Configurar Supabase](#parte-2-configurar-supabase)
3. [Implementar no Frontend](#parte-3-implementar-no-frontend)
4. [Testar a Integração](#parte-4-testar)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 O Que Vamos Fazer?

Permitir que usuários façam login no StayFocus usando suas contas Google, sem precisar criar senha.

**Benefícios:**
- ✅ Login mais rápido e fácil
- ✅ Menos senhas para lembrar
- ✅ Maior segurança (OAuth 2.0)
- ✅ Melhor experiência do usuário

---

## PARTE 1: Google Cloud Console

### Passo 1.1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Faça login com sua conta Google
3. Aceite os termos de serviço (se for primeira vez)

---

### Passo 1.2: Criar um Novo Projeto

1. No topo da página, clique no **seletor de projetos**
2. Clique em **"New Project"** (Novo Projeto)
3. Preencha:
   - **Project name:** `StayFocus`
   - **Organization:** (deixe como está)
   - **Location:** (deixe como está)
4. Clique em **"Create"** (Criar)
5. Aguarde a criação (15-30 segundos)

**Screenshot esperado:**
```
┌─────────────────────────────────────┐
│ New Project                         │
├─────────────────────────────────────┤
│ Project name:                       │
│ [StayFocus                    ]     │
│                                     │
│ Organization:                       │
│ [No organization              ]     │
│                                     │
│ Location:                           │
│ [No organization              ]     │
│                                     │
│         [Cancel]  [Create]          │
└─────────────────────────────────────┘
```

---

### Passo 1.3: Selecionar o Projeto

1. Clique novamente no **seletor de projetos** (topo)
2. Selecione **"StayFocus"** na lista
3. Aguarde o projeto carregar

---

### Passo 1.4: Habilitar Google+ API

1. No menu lateral (☰), vá em: **APIs & Services** → **Library**
2. Na busca, digite: `Google+ API`
3. Clique em **"Google+ API"**
4. Clique em **"Enable"** (Habilitar)
5. Aguarde a ativação

**Ou acesse diretamente:**
```
https://console.cloud.google.com/apis/library/plus.googleapis.com
```

---

### Passo 1.5: Configurar OAuth Consent Screen

1. No menu lateral, vá em: **APIs & Services** → **OAuth consent screen**
2. Selecione **"External"** (para permitir qualquer usuário Google)
3. Clique em **"Create"**

**Preencha o formulário:**

#### App Information
- **App name:** `StayFocus`
- **User support email:** `seu-email@gmail.com`
- **App logo:** (opcional, pode pular)

#### App Domain (opcional por enquanto)
- **Application home page:** `https://seu-dominio.com` (ou deixe vazio)
- **Application privacy policy:** (deixe vazio por enquanto)
- **Application terms of service:** (deixe vazio por enquanto)

#### Developer Contact Information
- **Email addresses:** `seu-email@gmail.com`

4. Clique em **"Save and Continue"**

---

### Passo 1.6: Configurar Scopes

1. Na tela "Scopes", clique em **"Add or Remove Scopes"**
2. Selecione os seguintes scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Clique em **"Update"**
4. Clique em **"Save and Continue"**

**Scopes necessários:**
```
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
openid
```

---

### Passo 1.7: Adicionar Test Users (Modo Desenvolvimento)

1. Na tela "Test users", clique em **"Add Users"**
2. Adicione seu email: `seu-email@gmail.com`
3. Clique em **"Add"**
4. Clique em **"Save and Continue"**

**Nota:** Em produção, você precisará publicar o app para remover essa restrição.

---

### Passo 1.8: Criar OAuth Client ID

1. No menu lateral, vá em: **APIs & Services** → **Credentials**
2. Clique em **"Create Credentials"** (topo)
3. Selecione **"OAuth client ID"**

**Preencha:**
- **Application type:** `Web application`
- **Name:** `StayFocus Web Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
https://seu-dominio.com
```

**Authorized redirect URIs:**
```
https://llwcibvofptjyxxrcbvu.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

4. Clique em **"Create"**

---

### Passo 1.9: Copiar Credenciais

Após criar, uma modal aparecerá com:

```
┌─────────────────────────────────────┐
│ OAuth client created                │
├─────────────────────────────────────┤
│ Your Client ID:                     │
│ 123456789-abc...apps.googleusercontent.com
│                                     │
│ Your Client Secret:                 │
│ GOCSPX-abc123...                    │
│                                     │
│         [OK]  [Download JSON]       │
└─────────────────────────────────────┘
```

**⚠️ IMPORTANTE:** Copie e guarde:
- ✅ **Client ID** (começa com números)
- ✅ **Client Secret** (começa com GOCSPX-)

**Salve em um arquivo temporário:**
```
Client ID: 123456789-abc...apps.googleusercontent.com
Client Secret: GOCSPX-abc123...
```

---

## PARTE 2: Configurar Supabase

### Passo 2.1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto **"StayFocus"**
3. No menu lateral, vá em: **Authentication** → **Providers**

**Ou acesse diretamente:**
```
https://supabase.com/dashboard/project/llwcibvofptjyxxrcbvu/auth/providers
```

---

### Passo 2.2: Habilitar Google Provider

1. Na lista de providers, encontre **"Google"**
2. Clique no toggle para **habilitar**
3. O formulário de configuração aparecerá

---

### Passo 2.3: Configurar Google Provider

**Preencha com as credenciais do Google Cloud:**

- **Client ID (for OAuth):**
  ```
  Cole o Client ID que você copiou
  Exemplo: 123456789-abc...apps.googleusercontent.com
  ```

- **Client Secret (for OAuth):**
  ```
  Cole o Client Secret que você copiou
  Exemplo: GOCSPX-abc123...
  ```

- **Authorized Client IDs:** (deixe vazio por enquanto)

- **Skip nonce checks:** (deixe desmarcado)

---

### Passo 2.4: Copiar Callback URL

Antes de salvar, copie a **Callback URL** que o Supabase mostra:

```
Callback URL (for OAuth):
https://llwcibvofptjyxxrcbvu.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANTE:** Você precisará adicionar essa URL no Google Cloud Console.

---

### Passo 2.5: Salvar Configurações

1. Clique em **"Save"** no final da página
2. Aguarde a confirmação

---

### Passo 2.6: Voltar ao Google Cloud Console

1. Volte para: https://console.cloud.google.com/apis/credentials
2. Clique no **OAuth Client ID** que você criou
3. Em **"Authorized redirect URIs"**, verifique se tem:
   ```
   https://llwcibvofptjyxxrcbvu.supabase.co/auth/v1/callback
   ```
4. Se não tiver, adicione e clique em **"Save"**

---

## PARTE 3: Implementar no Frontend

### Passo 3.1: Verificar Dependências

Certifique-se de ter o Supabase instalado:

```bash
npm list @supabase/supabase-js
```

Se não tiver:
```bash
npm install @supabase/supabase-js
```

---

### Passo 3.2: Criar Componente de Login com Google

Crie o arquivo: `components/auth/GoogleSignInButton.tsx`

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Erro ao fazer login com Google:', error.message)
        alert('Erro ao fazer login com Google')
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="text-gray-700 font-medium">
        {loading ? 'Conectando...' : 'Continuar com Google'}
      </span>
    </button>
  )
}
```

---

### Passo 3.3: Criar Página de Callback

Crie o arquivo: `app/auth/callback/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirecionar para a página inicial ou dashboard
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

---

### Passo 3.4: Adicionar ao Formulário de Login

Edite sua página de login (ex: `app/login/page.tsx`):

```typescript
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Entrar no StayFocus
          </h2>
          <p className="mt-2 text-gray-600">
            Gerencie sua vida com TDAH
          </p>
        </div>

        {/* Botão do Google */}
        <GoogleSignInButton />

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Ou continue com email
            </span>
          </div>
        </div>

        {/* Formulário de email/senha existente */}
        {/* ... seu formulário atual ... */}
      </div>
    </div>
  )
}
```

---

### Passo 3.5: Atualizar Middleware (se necessário)

Se você usa middleware, certifique-se de permitir a rota de callback:

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Permitir callback do OAuth
  if (req.nextUrl.pathname === '/auth/callback') {
    return res
  }

  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## PARTE 4: Testar

### Passo 4.1: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000/login

---

### Passo 4.2: Testar o Login

1. Clique no botão **"Continuar com Google"**
2. Você será redirecionado para a página de login do Google
3. Selecione sua conta Google
4. Autorize o acesso ao StayFocus
5. Você será redirecionado de volta para o app

---

### Passo 4.3: Verificar no Supabase

1. Acesse: https://supabase.com/dashboard/project/llwcibvofptjyxxrcbvu/auth/users
2. Você deve ver seu usuário na lista
3. O campo **"Provider"** deve mostrar: `google`

---

### Passo 4.4: Verificar Dados do Usuário

No seu app, você pode acessar os dados do usuário:

```typescript
const { data: { user } } = await supabase.auth.getUser()

console.log({
  id: user?.id,
  email: user?.email,
  name: user?.user_metadata?.full_name,
  avatar: user?.user_metadata?.avatar_url,
  provider: user?.app_metadata?.provider, // 'google'
})
```

---

## 🎨 Melhorias Opcionais

### Adicionar Avatar do Google

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function UserAvatar() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      {user.user_metadata?.avatar_url && (
        <Image
          src={user.user_metadata.avatar_url}
          alt={user.user_metadata.full_name || 'Avatar'}
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
      <div>
        <p className="font-medium">{user.user_metadata?.full_name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
  )
}
```

---

### Sincronizar com users_profile

Crie um trigger no Supabase para criar o perfil automaticamente:

```sql
-- Criar função para sincronizar perfil
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (user_id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_profile();
```

---

## 🚨 Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa:** A URL de callback não está autorizada no Google Cloud Console.

**Solução:**
1. Vá em: https://console.cloud.google.com/apis/credentials
2. Edite seu OAuth Client ID
3. Adicione em "Authorized redirect URIs":
   ```
   https://llwcibvofptjyxxrcbvu.supabase.co/auth/v1/callback
   ```
4. Salve e aguarde 5 minutos

---

### Erro: "Access blocked: This app's request is invalid"

**Causa:** OAuth Consent Screen não está configurado corretamente.

**Solução:**
1. Vá em: APIs & Services → OAuth consent screen
2. Complete todas as informações obrigatórias
3. Adicione seu email como test user

---

### Erro: "Invalid client"

**Causa:** Client ID ou Client Secret incorretos.

**Solução:**
1. Verifique se copiou corretamente do Google Cloud Console
2. Certifique-se de não ter espaços extras
3. Recrie as credenciais se necessário

---

### Usuário não é criado no users_profile

**Causa:** Trigger não está configurado.

**Solução:**
Execute o SQL da seção "Sincronizar com users_profile" acima.

---

### Login funciona mas redireciona para página errada

**Causa:** Callback URL incorreta.

**Solução:**
Verifique o `redirectTo` no código:
```typescript
redirectTo: `${window.location.origin}/auth/callback`
```

---

## ✅ Checklist Final

Antes de considerar concluído:

### Google Cloud Console
- [ ] Projeto criado
- [ ] Google+ API habilitada
- [ ] OAuth Consent Screen configurado
- [ ] OAuth Client ID criado
- [ ] Redirect URIs adicionadas
- [ ] Credenciais copiadas

### Supabase
- [ ] Google Provider habilitado
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Callback URL verificada

### Frontend
- [ ] Componente GoogleSignInButton criado
- [ ] Rota de callback criada
- [ ] Botão adicionado à página de login
- [ ] Middleware atualizado (se necessário)

### Testes
- [ ] Login com Google funciona
- [ ] Usuário aparece no Supabase
- [ ] Redirecionamento funciona
- [ ] Avatar e nome são carregados
- [ ] Perfil é criado automaticamente

---

## 📚 Recursos Adicionais

- [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## 🎉 Parabéns!

Você implementou com sucesso o login com Google no StayFocus!

**Próximos passos sugeridos:**
- Adicionar outros providers (GitHub, Facebook)
- Implementar link de contas (vincular email + Google)
- Adicionar analytics de login
- Melhorar UX com loading states

---

**Criado em:** 19 de Outubro de 2025  
**Tempo estimado:** 15-20 minutos  
**Dificuldade:** ⭐⭐ Média
    