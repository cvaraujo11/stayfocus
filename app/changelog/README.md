# Changelog do StayFocus

Esta pasta contém a página de Changelog e os dados de versionamento da aplicação.

## Estrutura

- `page.tsx` - Componente da página de Changelog
- `changelog-data.ts` - Dados das versões e mudanças
- `README.md` - Este arquivo de documentação

## Como Adicionar uma Nova Versão

1. Abra o arquivo `changelog-data.ts`
2. Adicione um novo objeto no **início** do array `changelogData` (versões mais recentes primeiro)
3. Use o seguinte formato:

```typescript
{
  version: '1.3.0', // Formato: MAJOR.MINOR.PATCH
  date: '2025-01-20', // Formato: YYYY-MM-DD
  changes: [
    {
      type: 'feature', // ou 'improvement', 'fix', 'info'
      description: 'Descrição clara da mudança'
    },
    // Adicione mais mudanças conforme necessário
  ]
}
```

## Tipos de Mudanças

### `feature` (Novidade)
- Novas funcionalidades adicionadas ao sistema
- Cor: Azul
- Ícone: Sparkles (✨)
- Exemplo: "Nova página de relatórios mensais"

### `improvement` (Melhoria)
- Melhorias em funcionalidades existentes
- Cor: Roxo
- Ícone: Wrench (🔧)
- Exemplo: "Interface do dashboard mais responsiva"

### `fix` (Correção)
- Correções de bugs e problemas
- Cor: Vermelho
- Ícone: Bug (🐛)
- Exemplo: "Correção no salvamento de dados"

### `info` (Informação)
- Anúncios, avisos ou informações gerais
- Cor: Verde
- Ícone: Info (ℹ️)
- Exemplo: "Manutenção programada para o dia 15"

## Versionamento Semântico

Seguimos o padrão [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x): Mudanças incompatíveis com versões anteriores
- **MINOR** (x.1.x): Novas funcionalidades compatíveis com versões anteriores
- **PATCH** (x.x.1): Correções de bugs compatíveis com versões anteriores

## Exemplo Completo

```typescript
{
  version: '1.3.0',
  date: '2025-01-20',
  changes: [
    {
      type: 'feature',
      description: 'Sistema de notificações push para lembretes'
    },
    {
      type: 'feature',
      description: 'Integração com Google Calendar'
    },
    {
      type: 'improvement',
      description: 'Performance 50% mais rápida no carregamento'
    },
    {
      type: 'fix',
      description: 'Correção no cálculo de estatísticas mensais'
    },
    {
      type: 'info',
      description: 'Novo tutorial interativo disponível'
    }
  ]
}
```

## Boas Práticas

1. **Seja claro e conciso**: Descreva a mudança de forma que os usuários entendam
2. **Use linguagem amigável**: Evite jargões técnicos quando possível
3. **Agrupe mudanças relacionadas**: Coloque mudanças similares na mesma versão
4. **Mantenha a ordem**: Sempre adicione novas versões no início do array
5. **Data correta**: Use a data de lançamento, não a data de desenvolvimento

## Acesso à Página

Os usuários podem acessar o Changelog através de:
- URL direta: `/changelog`
- Link no Footer da aplicação
- Menu de navegação (se implementado)

## Comunicação com Usuários

O Changelog serve como canal oficial de comunicação sobre:
- Novas funcionalidades lançadas
- Melhorias implementadas
- Bugs corrigidos
- Avisos importantes
- Roadmap de desenvolvimento

Mantenha sempre atualizado para que os usuários saibam o que está acontecendo com a aplicação!
