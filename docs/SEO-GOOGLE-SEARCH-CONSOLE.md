# Guia de Submissão ao Google Search Console

## 📋 Pré-requisitos

- [ ] Domínio configurado e em produção
- [ ] Variável `NEXT_PUBLIC_BASE_URL` configurada no `.env.local`
- [ ] Deploy realizado com sucesso

## 🚀 Passos para Configuração

### 1. Acessar o Google Search Console

1. Acesse: https://search.google.com/search-console
2. Faça login com sua conta Google
3. Clique em "Adicionar propriedade"

### 2. Verificar Propriedade do Site

Escolha um dos métodos de verificação:

#### Opção A: Verificação por arquivo HTML
1. Baixe o arquivo de verificação fornecido pelo Google
2. Coloque o arquivo na pasta `public/` do projeto
3. Faça deploy
4. Clique em "Verificar" no Google Search Console

#### Opção B: Verificação por tag HTML
1. Copie a meta tag fornecida pelo Google
2. Adicione no `app/layout.tsx` dentro do `<head>`
3. Faça deploy
4. Clique em "Verificar" no Google Search Console

#### Opção C: Verificação por DNS (Recomendado)
1. Copie o registro TXT fornecido pelo Google
2. Adicione no seu provedor de DNS
3. Aguarde propagação (pode levar até 48h)
4. Clique em "Verificar" no Google Search Console

### 3. Submeter Sitemap

1. No Google Search Console, vá em "Sitemaps" no menu lateral
2. Digite: `sitemap.xml`
3. Clique em "Enviar"
4. Aguarde o Google processar (pode levar alguns dias)

### 4. Verificar Robots.txt

1. No Google Search Console, vá em "Configurações" > "Rastreadores"
2. Clique em "Testar robots.txt"
3. Verifique se as regras estão corretas
4. Teste URLs específicas para confirmar bloqueio/permissão

## 📊 Monitoramento

Após a configuração, monitore regularmente:

- **Cobertura**: Páginas indexadas vs. excluídas
- **Desempenho**: Cliques, impressões, CTR, posição média
- **Experiência**: Core Web Vitals, usabilidade mobile
- **Segurança**: Problemas de segurança detectados

## 🔧 Arquivos Criados

### `/public/robots.txt`
Arquivo estático que define regras de rastreamento para bots.

### `/app/robots.ts`
Gerador dinâmico de robots.txt (Next.js App Router).
- Usa `NEXT_PUBLIC_BASE_URL` para URL do sitemap
- Bloqueia rotas privadas automaticamente

### `/app/sitemap.ts`
Gerador dinâmico de sitemap.xml (Next.js App Router).
- Atualiza automaticamente a cada build
- Inclui apenas rotas públicas
- Define prioridades e frequências de atualização

## 🌐 URLs Geradas

Após o deploy, os seguintes endpoints estarão disponíveis:

- `https://seu-dominio.com/robots.txt`
- `https://seu-dominio.com/sitemap.xml`

## ⚙️ Configuração de Ambiente

Adicione no seu `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com
```

**Importante**: Substitua `seu-dominio.com` pela URL real do seu site em produção.

## 🔄 Atualizações Futuras

### Adicionar novas rotas públicas

Edite `app/sitemap.ts` e adicione a nova rota no array:

```typescript
{
  url: `${baseUrl}/nova-rota`,
  lastModified: currentDate,
  changeFrequency: 'weekly' as const,
  priority: 0.7,
}
```

### Bloquear novas rotas privadas

Edite `app/robots.ts` e adicione no array `disallow`:

```typescript
disallow: [
  // ... rotas existentes
  '/nova-rota-privada',
],
```

## 📚 Recursos Adicionais

- [Documentação Next.js - Metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Google Search Console - Central de Ajuda](https://support.google.com/webmasters)
- [Robots.txt - Especificação](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Sitemaps - Protocolo](https://www.sitemaps.org/protocol.html)
