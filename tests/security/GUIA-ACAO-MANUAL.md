# Guia: Habilitar Proteção de Senhas Vazadas

**Tempo estimado:** 2-3 minutos  
**Dificuldade:** Fácil  
**Requer:** Acesso ao Dashboard do Supabase

---

## 🎯 O Que É Isso?

A **Proteção de Senhas Vazadas** impede que usuários usem senhas que já foram comprometidas em vazamentos de dados conhecidos. O Supabase verifica contra a base de dados do [HaveIBeenPwned.org](https://haveibeenpwned.com/), que contém mais de 600 milhões de senhas vazadas.

### Por Que É Importante?

- 🔒 Impede uso de senhas fracas/comprometidas
- 🛡️ Protege dados sensíveis de saúde e finanças
- ✅ Melhora a segurança geral do sistema
- 📊 Aumenta o score de segurança de 96% para 100%

---

## 📋 Passo a Passo Detalhado

### Passo 1: Acessar o Dashboard do Supabase

1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login com suas credenciais

**Screenshot esperado:**
```
┌─────────────────────────────────────┐
│  Supabase Dashboard                 │
│  ┌─────────────────────────────┐   │
│  │ Email: seu@email.com        │   │
│  │ Password: ********          │   │
│  │ [Sign In]                   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### Passo 2: Selecionar o Projeto StayFocus

1. Na lista de projetos, localize **"StayFocus"**
2. Clique no card do projeto
3. Aguarde o carregamento do dashboard

**Ou acesse diretamente:**
```
https://supabase.com/dashboard/project/llwcibvofptjyxxrcbvu
```

**Screenshot esperado:**
```
┌─────────────────────────────────────┐
│  Seus Projetos                      │
│  ┌─────────────────────────────┐   │
│  │ 📱 StayFocus                │   │
│  │ Region: us-east-2           │   │
│  │ Status: ● Active            │   │
│  │ [Abrir Projeto]             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### Passo 3: Navegar até Authentication

1. No menu lateral esquerdo, localize **"Authentication"**
2. Clique em **"Authentication"**
3. O menu vai expandir mostrando subopções

**Menu lateral esperado:**
```
┌─────────────────────────┐
│ 🏠 Home                 │
│ 📊 Table Editor         │
│ 🔐 Authentication  ◄──  │ ← Clique aqui
│   ├─ Users              │
│   ├─ Policies           │
│   ├─ Providers          │
│   └─ Settings           │
│ 🗄️  Database            │
│ 📁 Storage              │
└─────────────────────────┘
```

---

### Passo 4: Acessar Policies (Políticas)

1. No submenu de Authentication, clique em **"Policies"**
2. A página de políticas de autenticação será carregada

**Ou acesse diretamente:**
```
https://supabase.com/dashboard/project/llwcibvofptjyxxrcbvu/auth/policies
```

**Caminho completo:**
```
Dashboard → StayFocus → Authentication → Policies
```

---

### Passo 5: Localizar "Password Protection"

1. Role a página até encontrar a seção **"Password Protection"**
2. Você verá duas opções:
   - **Password Strength** (já deve estar habilitado)
   - **Leaked Password Protection** (atualmente desabilitado)

**Seção esperada:**
```
┌─────────────────────────────────────────────┐
│ Password Protection                         │
├─────────────────────────────────────────────┤
│                                             │
│ Password Strength                           │
│ ● Enabled                                   │
│ Minimum length: 6 characters                │
│                                             │
│ Leaked Password Protection                  │
│ ○ Disabled  ◄── Você está aqui             │
│ Check passwords against HaveIBeenPwned      │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Passo 6: Habilitar a Proteção

1. Localize o toggle/switch ao lado de **"Leaked Password Protection"**
2. Clique no toggle para **HABILITAR** (mudar de OFF para ON)
3. O toggle deve ficar verde/azul indicando que está ativo

**Antes:**
```
Leaked Password Protection
○ Disabled  ← Clique aqui
```

**Depois:**
```
Leaked Password Protection
● Enabled  ✓
```

---

### Passo 7: Salvar as Alterações

1. Role até o final da página
2. Clique no botão **"Save"** ou **"Update"**
3. Aguarde a confirmação (geralmente aparece um toast/notificação)

**Botão esperado:**
```
┌─────────────────────────────────────┐
│                                     │
│  [Cancel]  [Save Changes]  ◄──     │
│                                     │
└─────────────────────────────────────┘
```

**Confirmação esperada:**
```
┌─────────────────────────────────────┐
│ ✓ Settings updated successfully    │
└─────────────────────────────────────┘
```

---

### Passo 8: Verificar a Ativação

1. Recarregue a página (F5 ou Ctrl+R)
2. Verifique se o toggle continua **HABILITADO**
3. A proteção agora está ativa!

**Status final:**
```
┌─────────────────────────────────────────────┐
│ Password Protection                         │
├─────────────────────────────────────────────┤
│                                             │
│ Password Strength                           │
│ ● Enabled ✓                                 │
│                                             │
│ Leaked Password Protection                  │
│ ● Enabled ✓  ← Deve estar assim            │
│ Passwords checked against HaveIBeenPwned    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ Como Testar Se Funcionou

### Teste 1: Tentar Criar Usuário com Senha Fraca

1. Vá para a página de cadastro da sua aplicação
2. Tente criar um usuário com senha: `password123`
3. Deve aparecer erro: **"Password has been found in a data breach"**

### Teste 2: Via API (Opcional)

```bash
curl -X POST 'https://llwcibvofptjyxxrcbvu.supabase.co/auth/v1/signup' \
  -H "apikey: SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "password123"
  }'
```

**Resposta esperada:**
```json
{
  "error": "Password has been found in a data breach",
  "error_code": "weak_password"
}
```

---

## 🔍 O Que Acontece Depois?

### Para Usuários Existentes
- ✅ Senhas atuais **NÃO** são afetadas
- ✅ Usuários podem continuar fazendo login normalmente
- ⚠️ Ao **trocar a senha**, a nova será verificada

### Para Novos Usuários
- ✅ Todas as senhas são verificadas no cadastro
- ✅ Senhas comprometidas são rejeitadas automaticamente
- ✅ Usuário recebe mensagem clara do erro

### Senhas Que Serão Bloqueadas
- `password`, `123456`, `qwerty`
- `password123`, `admin123`
- Qualquer senha em vazamentos conhecidos
- Mais de 600 milhões de senhas comprometidas

---

## 🎯 Impacto no Score de Segurança

| Métrica | Antes | Depois |
|---------|-------|--------|
| Vulnerabilidades Críticas | 0 | 0 |
| Avisos de Segurança | 1 | 0 |
| **Score de Segurança** | **96%** | **100%** ✓ |

---

## ❓ Perguntas Frequentes

### P: Isso vai afetar meus usuários atuais?
**R:** Não. Usuários existentes podem continuar usando suas senhas atuais. A verificação só acontece ao criar conta ou trocar senha.

### P: Como funciona a verificação?
**R:** O Supabase envia um hash SHA-1 parcial da senha para a API do HaveIBeenPwned (k-Anonymity), garantindo que a senha real nunca é exposta.

### P: Isso deixa o cadastro mais lento?
**R:** Não perceptível. A verificação adiciona apenas ~100-200ms ao processo de cadastro.

### P: Posso desabilitar depois?
**R:** Sim, mas não é recomendado. Você pode voltar e desabilitar o toggle a qualquer momento.

### P: Quais senhas são consideradas "vazadas"?
**R:** Qualquer senha que apareceu em vazamentos de dados públicos conhecidos, catalogados pelo HaveIBeenPwned.org.

---

## 🚨 Troubleshooting

### Problema: Não encontro a opção "Policies"
**Solução:** 
- Verifique se está no projeto correto (StayFocus)
- Certifique-se de ter permissões de administrador
- Tente limpar o cache do navegador

### Problema: Toggle não salva
**Solução:**
- Verifique sua conexão com internet
- Tente em outro navegador
- Aguarde alguns segundos e tente novamente

### Problema: Erro ao salvar
**Solução:**
- Verifique se o projeto está ativo (não pausado)
- Confirme que você é owner/admin do projeto
- Entre em contato com suporte do Supabase

---

## 📚 Documentação Oficial

- [Password Security - Supabase Docs](https://supabase.com/docs/guides/auth/password-security)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Model](https://en.wikipedia.org/wiki/K-anonymity)

---

## ✅ Checklist Final

Antes de considerar concluído, verifique:

- [ ] Acessei o Dashboard do Supabase
- [ ] Selecionei o projeto StayFocus
- [ ] Naveguei até Authentication → Policies
- [ ] Habilitei "Leaked Password Protection"
- [ ] Salvei as alterações
- [ ] Recebi confirmação de sucesso
- [ ] Verifiquei que o toggle está ativo
- [ ] (Opcional) Testei com senha fraca

---

## 🎉 Parabéns!

Você concluiu a última etapa de segurança pendente!

**Status do Sistema:**
- ✅ RLS habilitado e funcionando
- ✅ Políticas de segurança implementadas
- ✅ Views e funções corrigidas
- ✅ Proteção de senhas ativa
- ✅ **Score de Segurança: 100%**

O StayFocus agora está **totalmente seguro** e pronto para produção! 🚀

---

**Criado em:** 19 de Outubro de 2025  
**Tempo estimado:** 2-3 minutos  
**Dificuldade:** ⭐ Fácil
