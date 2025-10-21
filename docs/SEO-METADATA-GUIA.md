# Guia de Implementação de Metadata - StayFocus

## 📋 Visão Geral

Este documento descreve a implementação completa de metadata para SEO no StayFocus, incluindo Open Graph, Twitter Cards, Schema.org e configurações específicas por página.

## 🎯 Objetivos Alcançados

- ✅ Metadata completa no layout principal
- ✅ Metadata específica para cada página
- ✅ Open Graph tags para redes sociais
- ✅ Twitter Cards configuradas
- ✅ Schema.org markup (JSON-LD)
- ✅ Canonical URLs
- ✅ Robots meta tags por página
- ✅ Títulos únicos e descritivos
- ✅ Descrições otimizadas (150-160 caracteres)

## 📁 Arquivos Criados

### 1. `/app/lib/metadata.ts`
Biblioteca centralizada com funções helper para criar metadata consistente em todas as páginas.

**Funcionalidades:**
- `createPageMetadata()` - Função helper para gerar metadata
- Metadata pré-configurada para cada página
- Keywords específicas por seção
- Configuração de indexação (noIndex para páginas privadas)

### 2. Layouts por Página

Criados layouts específicos para cada rota com metadata otimizada:

#### Páginas Públicas (Indexadas)
- `/app/login/layout.tsx` - Login (noindex)
- `/app/registro/layout.tsx` - Registro
- `/app/roadmap/layout.tsx` - Roadmap

#### Páginas Privadas (Não Indexadas)
- `/app/perfil/layout.tsx`
- `/app/saude/layout.tsx`
- `/app/hiperfocos/layout.tsx`
- `/app/lazer/layout.tsx`
- `/app/alimentacao/layout.tsx`
- `/app/sono/layout.tsx`
- `/app/autoconhecimento/layout.tsx`
- `/app/financas/layout.tsx`
- `/app/receitas/layout.tsx`

### 3. `/app/components/seo/JsonLd.tsx`

Componente para adicionar Schema.org markup (JSON-LD) nas páginas.

**Schemas Implementados:**
- `WebApplication` - Define o app como aplicação web
- `Organization` - Informações da organização
- `BreadcrumbList` - Helper para breadcrumbs (uso futuro)

## 🔍 Estrutura de Metadata

### Layout Principal (`app/layout.tsx`)

```typescript
{
  metadataBase: URL base do site
  title: {
    default: Título padrão
    template: Template para páginas internas
  }
  description: Descrição principal (150-160 caracteres)
  keywords: Array de palavras-chave relevantes
  authors: Informações de autoria
  creator: Criador do conteúdo
  publisher: Publicador
  formatDetection: Desabilita detecção automática
  icons: Favicons e ícones
  openGraph: {
    type: Tipo de conteúdo
    locale: Idioma
    url: URL canônica
    siteName: Nome do site
    title: Título para redes sociais
    description: Descrição para redes sociais
    images: Imagens de preview
  }
  twitter: {
    card: Tipo de card
    title: Título para Twitter
    description: Descrição para Twitter
    images: Imagens de preview
    creator: Handle do Twitter
  }
  robots: {
    index: Permitir indexação
    follow: Seguir links
    googleBot: Configurações específicas do Google
  }
  verification: {
    // Códigos de verificação (adicionar após configurar)
  }
}
```

### Layouts de Página

Cada página tem metadata específica com:
- **Título único** (50-60 caracteres)
- **Descrição otimizada** (150-160 caracteres)
- **Keywords específicas** da seção
- **Configuração de robots** (index/noindex)
- **Open Graph e Twitter Cards** personalizados

## 🌐 Schema.org (JSON-LD)

### WebApplication Schema

Define o StayFocus como uma aplicação web:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "StayFocus",
  "description": "...",
  "url": "...",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  }
}
```

### Organization Schema

Define a organização por trás do app:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StayFocus",
  "description": "...",
  "url": "...",
  "logo": "..."
}
```

## 📊 Palavras-chave por Página

### Globais (Todas as Páginas)
- TDAH
- autismo
- neurodivergência
- organização
- produtividade
- gestão de tarefas
- saúde mental
- aplicativo neurodivergente
- planejamento
- rotina

### Página Inicial
- painel neurodivergente
- dashboard TDAH
- organização diária
- gestão de rotina

### Registro
- registro
- criar conta
- cadastro
- sign up

### Roadmap
- roadmap
- funcionalidades
- desenvolvimento
- planejamento
- recursos

## 🔧 Como Adicionar Metadata em Novas Páginas

### 1. Criar Layout Específico

Crie um arquivo `layout.tsx` na pasta da rota:

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Título da Página',
  description: 'Descrição otimizada de 150-160 caracteres...',
  keywords: ['palavra1', 'palavra2', 'palavra3'],
  robots: {
    index: false, // true para páginas públicas
    follow: false, // true para páginas públicas
  },
  openGraph: {
    title: 'Título da Página | StayFocus',
    description: 'Descrição para redes sociais...',
  },
  twitter: {
    title: 'Título da Página | StayFocus',
    description: 'Descrição para Twitter...',
  },
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

### 2. Usar Helper do metadata.ts

Alternativamente, use a função helper:

```typescript
import { createPageMetadata } from '@/app/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Título da Página',
  description: 'Descrição otimizada...',
  path: '/caminho-da-pagina',
  keywords: ['palavra1', 'palavra2'],
  noIndex: false, // true para páginas privadas
})
```

## 🎨 Open Graph e Twitter Cards

### Imagens de Preview

Todas as páginas usam a mesma imagem de preview:
- **Localização:** `/public/images/stayfocus_logo.png`
- **Dimensões recomendadas:** 1200x630px
- **Formato:** PNG ou JPG

### Personalização Futura

Para criar imagens específicas por página:

1. Crie a imagem em `/public/images/og/`
2. Adicione no metadata da página:

```typescript
openGraph: {
  images: [
    {
      url: '/images/og/nome-da-pagina.png',
      width: 1200,
      height: 630,
      alt: 'Descrição da imagem',
    },
  ],
}
```

## 🔍 Validação e Testes

### Ferramentas de Validação

1. **Open Graph Debugger**
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/

2. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator

3. **Schema.org Validator**
   - https://validator.schema.org/
   - Google Rich Results Test: https://search.google.com/test/rich-results

4. **Lighthouse (Chrome DevTools)**
   - Audita SEO, performance e acessibilidade

### Como Testar

1. **Localmente:**
   ```bash
   npm run dev
   ```
   - Acesse: http://localhost:3000
   - Inspecione o `<head>` no DevTools

2. **Em Produção:**
   - Faça deploy
   - Use as ferramentas de validação acima
   - Verifique no Google Search Console

## 📈 Monitoramento

### Métricas para Acompanhar

1. **Google Search Console**
   - Impressões por página
   - CTR (Click-Through Rate)
   - Posição média
   - Páginas indexadas

2. **Google Analytics**
   - Tráfego orgânico por página
   - Taxa de rejeição
   - Tempo na página
   - Conversões

3. **Redes Sociais**
   - Compartilhamentos
   - Cliques em links
   - Engajamento

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Imagens OG Personalizadas**
   - Criar imagens específicas para cada seção
   - Usar ferramentas como Canva ou Figma

2. **Breadcrumbs**
   - Implementar navegação breadcrumb
   - Adicionar Schema.org BreadcrumbList

3. **FAQ Schema**
   - Adicionar seção de perguntas frequentes
   - Implementar FAQ Schema.org

4. **Article Schema**
   - Para blog posts futuros
   - Rich snippets no Google

5. **Video Schema**
   - Para tutoriais em vídeo
   - Aparecer em resultados de vídeo

## 📚 Recursos Adicionais

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)

## ⚙️ Configuração de Ambiente

Certifique-se de que a variável de ambiente está configurada:

```env
NEXT_PUBLIC_BASE_URL=https://seu-dominio.com
```

**Importante:** Substitua pela URL real em produção.

---

**Implementado por:** Kiro AI  
**Data:** 20/10/2025  
**Status:** ✅ Completo
