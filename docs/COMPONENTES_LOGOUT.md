# Componentes de Logout

## Visão Geral

Foram desenvolvidos dois componentes de logout para a aplicação StayFocus:

1. **UserMenu** - Menu dropdown completo com perfil do usuário e logout
2. **LogoutButton** - Botão simples de logout com variantes customizáveis

## 1. UserMenu (Recomendado para Header)

### Descrição
Componente completo de menu do usuário com dropdown que inclui:
- Avatar com iniciais do usuário
- Nome e email do usuário
- Link para perfil
- Link para configurações
- Botão de logout com confirmação visual

### Localização
`/app/components/layout/UserMenu.tsx`

### Características
- ✅ Dropdown responsivo com animações suaves
- ✅ Fecha ao clicar fora (click outside)
- ✅ Fecha ao pressionar ESC
- ✅ Acessibilidade completa (ARIA labels)
- ✅ Suporte a tema claro/escuro
- ✅ Estados de loading durante logout
- ✅ Extrai iniciais do nome do usuário automaticamente
- ✅ Fallback para email se não houver nome

### Uso no Header
```tsx
import { UserMenu } from './UserMenu'

export function Header() {
  return (
    <header>
      {/* ... outros elementos ... */}
      <UserMenu />
    </header>
  )
}
```

### Props
Nenhuma prop necessária - o componente usa o `useAuth()` hook internamente.

### Estados do Usuário
O componente exibe automaticamente:
- **Nome completo**: Se disponível em `user.user_metadata.full_name`
- **Email**: Se não houver nome completo
- **Iniciais**: Calculadas automaticamente do nome ou email

## 2. LogoutButton (Componente Standalone)

### Descrição
Botão simples e versátil de logout com três variantes de estilo.

### Localização
`/app/components/layout/LogoutButton.tsx`

### Variantes

#### Icon (Padrão)
Apenas o ícone de logout:
```tsx
<LogoutButton variant="icon" />
```

#### Text
Apenas texto:
```tsx
<LogoutButton variant="text" />
```

#### Full
Ícone + texto em botão estilizado:
```tsx
<LogoutButton variant="full" />
```

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `variant` | `'icon' \| 'text' \| 'full'` | `'icon'` | Estilo do botão |
| `className` | `string` | `''` | Classes CSS adicionais |
| `showConfirmation` | `boolean` | `false` | Exibe confirmação antes de fazer logout |

### Exemplos de Uso

#### Botão simples com ícone
```tsx
<LogoutButton />
```

#### Botão com texto e confirmação
```tsx
<LogoutButton 
  variant="full" 
  showConfirmation={true}
  className="mt-4"
/>
```

#### Botão customizado
```tsx
<LogoutButton 
  variant="text"
  className="text-lg hover:underline"
/>
```

## Integração com AuthContext

Ambos os componentes utilizam o hook `useAuth()` que fornece:

```tsx
const { user, signOut } = useAuth()
```

### Função signOut()
- Faz logout no Supabase
- Limpa a sessão do usuário
- Redireciona automaticamente para `/login`
- Trata erros internamente

## Fluxo de Logout

1. Usuário clica no botão de logout
2. Estado de loading é ativado (`isLoggingOut = true`)
3. Função `signOut()` é chamada
4. Supabase invalida a sessão
5. AuthContext atualiza o estado
6. Usuário é redirecionado para `/login`
7. Estado de loading é desativado (ou componente desmontado)

## Segurança

- ✅ Logout server-side via Supabase Auth
- ✅ Invalidação completa da sessão
- ✅ Limpeza de tokens e cookies
- ✅ Redirecionamento automático
- ✅ Tratamento de erros

## Acessibilidade

### UserMenu
- `aria-label` no botão principal
- `aria-expanded` e `aria-haspopup` para dropdown
- `role="menu"` e `role="menuitem"` nos itens
- Navegação por teclado (ESC para fechar)

### LogoutButton
- `aria-label` descritivo
- Estados disabled acessíveis
- Indicadores visuais de loading

## Estilização

### Cores
- **Logout**: Variante vermelha (`red-600`, `red-50`)
- **Perfil**: Cores do tema perfil (`perfil-primary`)
- **Tema**: Suporte a modo claro e escuro

### Animações
- Fade in/out do dropdown
- Slide in from top
- Pulse durante loading
- Rotate do chevron

## Testes Recomendados

1. ✅ Clicar no menu e verificar abertura
2. ✅ Clicar fora e verificar fechamento
3. ✅ Pressionar ESC e verificar fechamento
4. ✅ Fazer logout e verificar redirecionamento
5. ✅ Verificar funcionamento em telas pequenas
6. ✅ Testar com e sem nome de usuário
7. ✅ Verificar estados de loading
8. ✅ Testar tema claro e escuro

## Implementação Atual

O componente **UserMenu** já está integrado no Header da aplicação, substituindo o botão de perfil simples anterior.

### Arquivo: `/app/components/layout/Header.tsx`

```tsx
import { UserMenu } from './UserMenu'

// ...no final do header
<UserMenu />
```

## Manutenção

Para adicionar novos itens ao menu do usuário:

1. Abra `/app/components/layout/UserMenu.tsx`
2. Localize a seção "Opções do menu"
3. Adicione um novo Link ou button seguindo o padrão existente

Exemplo:
```tsx
<Link
  href="/nova-pagina"
  className="flex items-center px-4 py-2 text-sm..."
  role="menuitem"
  onClick={() => setIsOpen(false)}
>
  <NovoIcone className="h-4 w-4 mr-3" />
  <span>Nova Opção</span>
</Link>
```

## Troubleshooting

### Menu não abre
- Verifique se o AuthProvider está envolvendo a aplicação
- Verifique console para erros de autenticação

### Logout não funciona
- Verifique configuração do Supabase
- Verifique se as variáveis de ambiente estão corretas
- Verifique console para erros

### Iniciais não aparecem
- Verifique se o usuário tem `user_metadata.full_name` ou `email`
- Verifique se o usuário está autenticado

## Próximos Passos

Possíveis melhorias futuras:
- [ ] Adicionar upload de avatar
- [ ] Adicionar notificações no menu
- [ ] Adicionar atalhos de teclado
- [ ] Adicionar modo de logout de todos os dispositivos
- [ ] Adicionar confirmação por modal em vez de alert
