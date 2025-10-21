# Testes de Segurança para Next.js + Supabase + Vercel

## 1. **Testes de Autenticação e Autorização**
- Testar bypass de autenticação (tentar acessar rotas protegidas sem token)
- Verificar expiração e renovação de tokens JWT
- Testar força das senhas (política de complexidade)
- Verificar proteção contra credential stuffing
- Testar autenticação multifator (se implementada)
- Verificar se há exposição de tokens em URLs ou logs
- Testar diferentes níveis de permissão (RBAC - Role-Based Access Control)

## 2. **Testes de API e Backend**
- Verificar políticas RLS (Row Level Security) do Supabase em todas as tabelas
- Testar IDOR (Insecure Direct Object Reference) - tentar acessar dados de outros usuários
- Verificar rate limiting nas API routes
- Testar injeção SQL (mesmo com ORM, testar queries personalizadas)
- Verificar CORS configurado corretamente
- Testar exposição de API keys no código client-side
- Verificar se as API routes validam entrada de dados adequadamente

## 3. **Testes de Segurança de Dados**
- Verificar se dados sensíveis estão criptografados no banco
- Testar vazamento de informações em respostas de erro
- Verificar se há PII (Personally Identifiable Information) exposta nos logs
- Testar sanitização de dados de entrada (XSS, command injection)
- Verificar se há backups automáticos configurados
- Testar recuperação de dados deletados (soft delete vs hard delete)

## 4. **Testes de Segurança Client-Side**
- Testar XSS (Cross-Site Scripting) em formulários e campos de texto
- Verificar Content Security Policy (CSP) headers
- Testar proteção CSRF (Cross-Site Request Forgery)
- Verificar se dados sensíveis são armazenados no localStorage/sessionStorage
- Testar clickjacking (X-Frame-Options header)
- Inspecionar código JavaScript bundled para secrets expostos

## 5. **Testes de Infraestrutura (Vercel)**
- Verificar variáveis de ambiente configuradas corretamente
- Testar se `.env.local` não está commitado no repositório
- Verificar headers de segurança HTTP (HSTS, X-Content-Type-Options, etc.)
- Testar HTTPS enforcement e redirecionamento
- Verificar proteção DDoS da Vercel
- Testar limites de execução de serverless functions

## 6. **Testes de Dependências**
- Executar `npm audit` para vulnerabilidades conhecidas
- Usar ferramentas como Snyk ou Dependabot
- Verificar versões desatualizadas de bibliotecas críticas
- Revisar permissões de pacotes de terceiros

## 7. **Testes de Upload de Arquivos (se aplicável)**
- Verificar validação de tipo de arquivo (MIME type)
- Testar upload de arquivos maliciosos (.php, .exe, etc.)
- Verificar limite de tamanho de arquivo
- Testar path traversal em nomes de arquivo
- Verificar se arquivos são escaneados por malware
- Testar acesso direto aos arquivos uploaded

## 8. **Testes de Sessão**
- Verificar timeout de sessão inativa
- Testar session fixation
- Verificar se logout invalida tokens adequadamente
- Testar sessões concorrentes

## 9. **Ferramentas Recomendadas**

**Scanners Automatizados:**
- OWASP ZAP (Zed Attack Proxy)
- Burp Suite Community Edition
- Nuclei
- npm audit / yarn audit

**Análise de Código:**
- SonarQube
- Semgrep
- ESLint com plugins de segurança
- GitGuardian (para secrets no código)

**Testes Específicos Next.js:**
- Next.js Security Headers checker
- Lighthouse CI (também verifica aspectos de segurança)

## 10. **Checklist de Configuração**

**Supabase:**
- [ ] RLS habilitado em todas as tabelas
- [ ] API keys anônimas e service keys separadas
- [ ] Políticas RLS testadas para cada role
- [ ] Realtime subscriptions com autenticação

**Vercel:**
- [ ] Environment variables configuradas (não hardcoded)
- [ ] Preview deployments com secrets apropriados
- [ ] Domínio customizado com SSL
- [ ] Security headers configurados em `next.config.js` ou `vercel.json`

**Next.js:**
- [ ] API routes protegidas com middleware
- [ ] Validação de entrada com bibliotecas como Zod
- [ ] CSP configurado
- [ ] CSRF tokens implementados (se necessário)

## 11. **Testes Manuais Essenciais**
- Tentar manipular parâmetros de URL para acessar recursos não autorizados
- Inspecionar Network tab do DevTools para dados sensíveis
- Testar comportamento com JavaScript desabilitado
- Verificar mensagens de erro (não devem vazar informações do sistema)
- Testar com diferentes browsers e dispositivos

Recomendo começar pelos testes de autenticação/autorização e RLS do Supabase, pois são os pontos mais críticos nessa stack. Use ferramentas automatizadas como ponto de partida, mas sempre complemente com testes manuais focados na lógica de negócio específica da sua aplicação.