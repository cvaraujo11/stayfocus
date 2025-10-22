# Compliance de Privacidade - LGPD/GDPR

Este documento descreve as práticas de privacidade implementadas no projeto StayFocus para garantir conformidade com LGPD (Lei Geral de Proteção de Dados) e GDPR (General Data Protection Regulation).

## Princípios Implementados

### 1. Minimização de Dados (LGPD Art. 6º, III)
- **Logs em Produção**: Nenhum dado pessoal identificável (PII) é registrado em logs de produção
- **Logs em Desenvolvimento**: Dados sensíveis são logados apenas em ambiente de desenvolvimento para debug

### 2. Dados Pessoais Identificáveis (PII)

#### ❌ NUNCA logar em produção:
- Email do usuário
- Nome completo
- CPF, RG ou outros documentos
- Telefone
- Endereço
- Dados de saúde (registros de sono, autoconhecimento, etc.)
- Tokens de autenticação
- Senhas (mesmo hasheadas)

#### ✅ OK logar em produção:
- Timestamps
- Pathname (sem query params sensíveis)
- Status codes HTTP
- Métricas agregadas e anônimas
- User ID hasheado (SHA-256 truncado) - apenas se absolutamente necessário

## Implementações de Segurança

### Middleware (`middleware.ts`)
```typescript
// ✅ Correto - Logs condicionais
if (process.env.NODE_ENV !== 'production') {
  console.log('🔒 Middleware:', {
    pathname,
    hasUser: !!user,
    isProtectedRoute: true
  })
}

// ❌ NUNCA fazer
console.log('User:', user.email) // Expõe PII em produção
```

### OAuth Callback (`app/auth/callback/route.ts`)
```typescript
// ✅ Correto - Logs de erro condicionais
if (process.env.NODE_ENV !== 'production') {
  console.error('Error exchanging code for session:', error)
}

// ❌ NUNCA fazer
console.error('Auth error for user:', user.email, error) // Expõe PII
```

### Componentes e Stores
- Logs de erro devem ser genéricos em produção
- Mensagens de erro para usuários não devem expor detalhes técnicos
- Stack traces completos apenas em desenvolvimento

## Checklist de Compliance

### Antes de Deploy em Produção
- [ ] Verificar que nenhum `console.log` expõe PII
- [ ] Confirmar que logs de erro são condicionais (`NODE_ENV !== 'production'`)
- [ ] Validar que query params sensíveis não são logados
- [ ] Testar que mensagens de erro para usuários são genéricas
- [ ] Revisar que tokens e credenciais não aparecem em logs

### Monitoramento Contínuo
- [ ] Auditar logs de produção mensalmente
- [ ] Revisar novos PRs para violações de privacidade
- [ ] Atualizar este documento com novas práticas
- [ ] Treinar equipe sobre LGPD/GDPR

## Ferramentas de Monitoramento

### Buscar Violações de Privacidade
```bash
# Buscar logs de email
grep -r "console.log.*email" app/

# Buscar logs de dados do usuário
grep -r "console.log.*user\." app/

# Buscar logs sem condicional de ambiente
grep -r "console.log" app/ | grep -v "NODE_ENV"
```

## Tratamento de Erros em Produção

### Padrão Recomendado
```typescript
try {
  // Operação sensível
} catch (error) {
  // Log detalhado apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.error('Detailed error:', error)
  }
  
  // Log genérico em produção (sem PII)
  console.error('Operation failed:', {
    operation: 'user_action',
    timestamp: new Date().toISOString(),
    // Não incluir dados do usuário
  })
  
  // Mensagem genérica para o usuário
  throw new Error('Erro ao processar solicitação. Tente novamente.')
}
```

## Referências Legais

### LGPD (Brasil)
- **Art. 6º, III**: Princípio da minimização de dados
- **Art. 46**: Segurança da informação
- **Art. 48**: Comunicação de incidentes de segurança

### GDPR (União Europeia)
- **Art. 5(1)(c)**: Data minimization
- **Art. 25**: Data protection by design and by default
- **Art. 32**: Security of processing

## Contato

Para questões sobre privacidade e compliance:
- Revisar este documento antes de implementar logging
- Consultar o time de segurança antes de logar dados sensíveis
- Reportar violações identificadas imediatamente

---

**Última atualização**: 2025-10-22  
**Versão**: 1.0
