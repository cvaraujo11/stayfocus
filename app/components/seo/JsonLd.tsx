import Script from 'next/script'

interface JsonLdProps {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Schema.org para WebApplication
export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StayFocus',
  description:
    'Aplicativo de organização e produtividade desenvolvido especialmente para pessoas neurodivergentes com TDAH e autismo.',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://seu-dominio.com',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
  author: {
    '@type': 'Organization',
    name: 'StayFocus Team',
  },
}

// Schema.org para Organization
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'StayFocus',
  description:
    'Desenvolvemos ferramentas de organização e produtividade para pessoas neurodivergentes.',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://seu-dominio.com',
  logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://seu-dominio.com'}/images/stayfocus_logo.png`,
  sameAs: [
    // Adicione aqui links para redes sociais quando disponíveis
    // 'https://twitter.com/stayfocus',
    // 'https://facebook.com/stayfocus',
    // 'https://instagram.com/stayfocus',
  ],
}

// Schema.org para BreadcrumbList (exemplo para páginas internas)
export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
