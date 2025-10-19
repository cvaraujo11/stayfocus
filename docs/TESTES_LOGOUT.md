# 🧪 Plano de Testes - Componentes de Logout

## Checklist de Testes

### ✅ Testes Funcionais

#### UserMenu
- [ ] **Abertura do Menu**
  - [ ] Menu abre ao clicar no avatar
  - [ ] Chevron rotaciona 180° quando aberto
  - [ ] Animação de fade in/slide é suave
  
- [ ] **Fechamento do Menu**
  - [ ] Menu fecha ao clicar no avatar novamente
  - [ ] Menu fecha ao clicar fora do dropdown
  - [ ] Menu fecha ao pressionar ESC
  - [ ] Menu fecha ao clicar em qualquer opção
  
- [ ] **Exibição de Dados**
  - [ ] Iniciais aparecem corretamente do nome completo
  - [ ] Iniciais aparecem do email se não houver nome
  - [ ] Fallback "U" aparece se não houver dados
  - [ ] Nome completo é exibido no dropdown
  - [ ] Email é truncado se muito longo
  
- [ ] **Navegação**
  - [ ] Link "Meu Perfil" redireciona para /perfil
  - [ ] Link "Configurações" redireciona para /perfil/ajuda
  - [ ] Links fecham o menu ao serem clicados

- [ ] **Logout**
  - [ ] Botão "Sair" inicia o processo de logout
  - [ ] Texto muda para "Saindo..." durante o processo
  - [ ] Botão fica desabilitado durante logout
  - [ ] Redirecionamento para /login acontece
  - [ ] Sessão é limpa no Supabase

#### LogoutButton
- [ ] **Variante Icon**
  - [ ] Ícone é renderizado corretamente
  - [ ] Hover muda a cor de fundo
  - [ ] Tooltip aparece no hover
  
- [ ] **Variante Text**
  - [ ] Texto "Sair" é exibido
  - [ ] Hover muda a cor do texto
  
- [ ] **Variante Full**
  - [ ] Ícone + texto são exibidos
  - [ ] Botão tem background vermelho
  - [ ] Hover escurece o background
  
- [ ] **Confirmação**
  - [ ] Alert aparece quando showConfirmation={true}
  - [ ] Logout é cancelado se usuário clicar "Cancelar"
  - [ ] Logout prossegue se usuário clicar "OK"
  
- [ ] **Estados**
  - [ ] Loading state mostra "Saindo..."
  - [ ] Ícone tem animação pulse durante loading
  - [ ] Botão fica desabilitado durante logout

---

### 🎨 Testes Visuais

#### Tema Claro
- [ ] Cores do menu estão corretas
- [ ] Contraste do texto é adequado
- [ ] Hover states são visíveis
- [ ] Bordas são visíveis

#### Tema Escuro
- [ ] Cores do menu estão invertidas corretamente
- [ ] Contraste do texto é adequado
- [ ] Hover states são visíveis
- [ ] Bordas são visíveis

#### Animações
- [ ] Fade in é suave (200ms)
- [ ] Slide from top é sutil
- [ ] Chevron rotation é suave
- [ ] Pulse animation funciona no loading

---

### 📱 Testes Responsivos

#### Desktop (1920px+)
- [ ] Menu dropdown aparece corretamente
- [ ] Não sobrepõe outros elementos
- [ ] Largura de 256px (w-64) é adequada

#### Tablet (768px-1920px)
- [ ] Menu dropdown funciona normalmente
- [ ] Touch events funcionam
- [ ] Não quebra o layout

#### Mobile (<768px)
- [ ] Menu dropdown não sai da tela
- [ ] Touch events funcionam corretamente
- [ ] Avatar é facilmente clicável (mínimo 44x44px)
- [ ] Menu fecha ao tocar fora

---

### ♿ Testes de Acessibilidade

#### Navegação por Teclado
- [ ] Tab navega para o avatar
- [ ] Enter/Space abre o menu
- [ ] Tab navega entre os itens do menu
- [ ] Enter/Space ativa o item focado
- [ ] ESC fecha o menu
- [ ] Focus retorna ao avatar após fechar

#### Screen Readers
- [ ] Avatar tem aria-label descritivo
- [ ] Menu tem role="menu"
- [ ] Itens têm role="menuitem"
- [ ] aria-expanded muda corretamente
- [ ] aria-haspopup está presente
- [ ] Estados são anunciados

#### Contraste
- [ ] Texto tem contraste mínimo 4.5:1
- [ ] Ícones têm contraste mínimo 3:1
- [ ] Botão de logout (vermelho) tem contraste adequado

#### Focus Visible
- [ ] Focus ring aparece no avatar
- [ ] Focus ring aparece nos itens do menu
- [ ] Focus ring é visível em ambos os temas

---

### 🔐 Testes de Segurança

- [ ] Token de sessão é invalidado no logout
- [ ] Cookies são limpos no logout
- [ ] localStorage é limpo (se aplicável)
- [ ] Redirecionamento não pode ser interceptado
- [ ] Não há vulnerabilidade XSS nas iniciais/nome

---

### ⚡ Testes de Performance

- [ ] Menu abre em <100ms
- [ ] Animações mantêm 60fps
- [ ] Não há memory leaks no mount/unmount
- [ ] Event listeners são removidos corretamente

---

### 🌐 Testes de Compatibilidade

#### Navegadores Desktop
- [ ] Chrome (últimas 2 versões)
- [ ] Firefox (últimas 2 versões)
- [ ] Safari (últimas 2 versões)
- [ ] Edge (últimas 2 versões)

#### Navegadores Mobile
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Firefox Android
- [ ] Samsung Internet

---

## 🧪 Cenários de Teste

### Cenário 1: Logout Bem-Sucedido
**Passos:**
1. Usuário está autenticado
2. Clica no avatar no header
3. Menu dropdown abre
4. Clica em "Sair"
5. Estado de loading aparece
6. Logout é processado
7. Redirecionamento para /login acontece

**Resultado Esperado:** ✅ Usuário é deslogado e redirecionado

---

### Cenário 2: Logout com Erro
**Passos:**
1. Desconectar internet (simular erro)
2. Clicar em "Sair"
3. Erro deve ser tratado graciosamente

**Resultado Esperado:** ✅ Erro é logado no console, botão volta ao normal

---

### Cenário 3: Click Outside
**Passos:**
1. Abrir menu do usuário
2. Clicar em qualquer lugar fora do menu
3. Menu deve fechar

**Resultado Esperado:** ✅ Menu fecha suavemente

---

### Cenário 4: Múltiplas Aberturas
**Passos:**
1. Abrir menu
2. Fechar menu
3. Repetir 10 vezes

**Resultado Esperado:** ✅ Sem memory leaks, comportamento consistente

---

### Cenário 5: Navegação por Teclado
**Passos:**
1. Tab até o avatar
2. Enter para abrir
3. Tab pelos itens
4. Enter em "Meu Perfil"
5. Deve navegar para /perfil

**Resultado Esperado:** ✅ Navegação completa por teclado funciona

---

## 🔍 Testes Manuais Recomendados

### Teste 1: Verificar Iniciais
**Objetivo:** Garantir que as iniciais são calculadas corretamente

**Casos:**
- Nome: "João Silva" → Iniciais: "JS" ✅
- Nome: "Maria" → Iniciais: "M" ✅
- Nome: null, Email: "test@example.com" → Iniciais: "T" ✅
- Nome: null, Email: null → Iniciais: "U" ✅

---

### Teste 2: Verificar Tema
**Objetivo:** Garantir que cores mudam corretamente entre temas

**Passos:**
1. Abrir menu em tema claro
2. Alternar para tema escuro
3. Abrir menu novamente
4. Verificar cores

---

### Teste 3: Verificar Logout Real
**Objetivo:** Garantir que logout funciona com Supabase real

**Passos:**
1. Fazer login na aplicação
2. Verificar que está autenticado
3. Fazer logout pelo menu
4. Verificar que sessão foi encerrada no Supabase
5. Tentar acessar rota protegida
6. Deve redirecionar para login

---

## 📊 Métricas de Sucesso

- **Taxa de Sucesso de Logout:** 100%
- **Tempo de Resposta:** <100ms
- **Acessibilidade Score:** 100/100
- **Performance Score:** 100/100
- **Compatibilidade:** 100% nos navegadores principais

---

## 🐛 Bugs Conhecidos

_Nenhum bug conhecido no momento._

---

## 📝 Notas de Teste

### Ambiente de Teste
- **Node:** v18+
- **Next.js:** 14+
- **React:** 18+
- **Supabase:** Latest

### Ferramentas Recomendadas
- **Acessibilidade:** axe DevTools, WAVE
- **Performance:** Lighthouse, React DevTools
- **Responsivo:** Chrome DevTools Device Mode
- **Screen Reader:** NVDA (Windows), VoiceOver (Mac)

---

**Status dos Testes:** 🟡 Pendente

**Última Atualização:** 19 de outubro de 2025
