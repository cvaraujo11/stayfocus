# 🛡️ Guia de Segurança - StayFocus

## Visão Geral

Este documento descreve as medidas de segurança implementadas no StayFocus e as melhores práticas para manter a aplicação segura.

## 🔐 Medidas de Segurança Implementadas

### 1. Autenticação e Autorização

- **Supabase Auth**: Sistema de autenticação robusto com suporte a múltiplos provedores
- **Session Management**: Sessões seguras com tokens JWT
- **Middleware Protection**: Rotas protegidas automaticamente via middleware
- **Row Level Security (RLS)**: Políticas de segurança no nível do banco de dados
- **Secure User Validation**: Uso de `getUser()` em vez de `getSession()` para validação autêntica

⚠️ **IMPORTANTE**: Sempre use `supabase.auth.getUser()` em vez de `supabase.auth.getSession()` para validar usuários, pois `getUser()` valida os dados com o servidor Supabase Auth, enquanto `getSession()` apenas lê dos cookies sem validação.

### 2. Validação de Dados

- **Zod Schemas**: Validação de entrada em todos os formulários e APIs
- **Sanitização**: Remoção de caracteres perigosos e HTML malicioso
- **Type Safety**: TypeScript para segurança de tipos em tempo de compilação

Localização: `app/lib/validation/schemas.ts`

### 3. Rate Limiting

- **Proteção contra Brute Force**: Limite de tentativas de login
- **API Rate Limiting**: Limite de requisições por minuto/hora
- **Configurações Personalizadas**: Diferentes limites para diferentes endpoints

Localização: `app/lib/security/rate-limit.ts`

Configurações:
- Auth endpoints: 5 tentativas / 15 minutos
- API geral: 60 requisições / minuto
- Endpoints críticos: 3 tentativas / hora

### 4. Security Headers

Headers de segurança configurados no `next.config.js`:

- **Strict-Transport-Security**: Força HTTPS
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **X-XSS-Protection**: Proteção contra XSS
- **Referrer-Policy**: Controla informações de referência
- **Permissions-Policy**: Restringe APIs do navegador

### 5. CSRF Protection

- **Token Generation**: Tokens únicos por sessão
- **Validation**: Verificação em todas as requisições de mutação
- **Timing-Safe Comparison**: Previne timing attacks

Localização: `app/lib/security/csrf.ts`

### 6. Variáveis de Ambiente

- **Validação com Zod**: Todas as variáveis são validadas na inicialização
- **Separação Client/Server**: Variáveis sensíveis apenas no servidor
- **Type Safety**: Tipos TypeScript para todas as variáveis

Localização: `app/lib/env.ts`

**Variáveis Públicas** (podem ser expostas no cliente):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BASE_URL`

**Variáveis Privadas** (apenas servidor):
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `PPLX_API_KEY`

### 7. Error Handling

- **Custom Error Classes**: Erros tipados e estruturados
- **Safe Error Messages**: Mensagens seguras para o cliente em produção
- **Logging**: Registro detalhado de erros para debugging

Localização: `app/lib/errors.ts`

### 8. Logging e Monitoramento

- **Structured Logging**: Logs estruturados com contexto
- **Security Events**: Logging específico de eventos de segurança
- **Performance Tracking**: Monitoramento de performance

Localização: `app/lib/logger.ts`

## 🚨 Vulnerabilidades Comuns e Prevenção

### Session Spoofing / Cookie Manipulation
✅ **Prevenido**: 
- Uso de `getUser()` em vez de `getSession()` para validação
- `getUser()` valida com o servidor Supabase Auth
- `getSession()` apenas usado após validação do usuário

**Exemplo INCORRETO** ❌:
```typescript
// NÃO FAÇA ISSO - Inseguro!
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  // Cookies podem ser manipulados!
}
```

**Exemplo CORRETO** ✅:
```typescript
// FAÇA ISSO - Seguro!
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  // Validado com o servidor
}
```

### SQL Injection
✅ **Prevenido**: Supabase usa prepared statements automaticamente

### XSS (Cross-Site Scripting)
✅ **Prevenido**: 
- React escapa automaticamente
- Sanitização de HTML em inputs
- Content Security Policy headers

### CSRF (Cross-Site Request Forgery)
✅ **Prevenido**: 
- Tokens CSRF em formulários
- SameSite cookies
- Validação de origem

### Clickjacking
✅ **Prevenido**: X-Frame-Options header

### Brute Force
✅ **Prevenido**: Rate limiting em endpoints de autenticação

### Session Hijacking
✅ **Prevenido**: 
- HTTPOnly cookies
- Secure cookies em produção
- Token rotation

## 📋 Checklist de Segurança

### Antes do Deploy

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] `SESSION_SECRET` é uma string aleatória de 32+ caracteres
- [ ] Variáveis sensíveis não estão commitadas no Git
- [ ] RLS (Row Level Security) está habilitado em todas as tabelas
- [ ] Rate limiting está configurado
- [ ] HTTPS está habilitado (automático no Vercel)
- [ ] Security headers estão configurados

### Manutenção Regular

- [ ] Atualizar dependências regularmente (`npm audit`)
- [ ] Revisar logs de segurança
- [ ] Testar rate limiting
- [ ] Verificar políticas RLS
- [ ] Auditar acessos ao banco de dados

## 🔧 Configuração de Produção

### 1. Variáveis de Ambiente no Vercel

```bash
# Adicione no Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
SESSION_SECRET=string_aleatoria_32_caracteres_minimo
NEXT_PUBLIC_BASE_URL=https://stayfocus-alpha.vercel.app
```

### 2. Supabase RLS

Certifique-se de que todas as tabelas têm políticas RLS:

```sql
-- Exemplo de política RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3. Monitoramento

Configure alertas para:
- Tentativas de login falhadas
- Rate limit excedido
- Erros 500
- Acessos não autorizados

## 🐛 Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Envie um email para: [security@stayfocus.com]
3. Inclua detalhes da vulnerabilidade
4. Aguarde resposta antes de divulgar publicamente

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Security Academy](https://portswigger.net/web-security)

## 🔄 Atualizações

Este documento deve ser atualizado sempre que:
- Novas medidas de segurança forem implementadas
- Vulnerabilidades forem descobertas e corrigidas
- Configurações de segurança forem alteradas

**Última atualização**: 2025-10-21
