import Script from 'next/script'
import { getBaseUrl } from '@/app/lib/env'

interface JsonLdProps {
  data: Record<string, any>
}

/**
 * Sanitizes JSON string to prevent XSS attacks in script tags
 * 
 * When embedding JSON in HTML script tags, certain characters must be escaped
 * to prevent script injection attacks. This function escapes:
 * - < (less than) → \u003c - prevents </script> tag injection
 * - > (greater than) → \u003e - prevents > in closing tags
 * - & (ampersand) → \u0026 - prevents HTML entity confusion
 * 
 * These unicode escapes are valid in JSON and JavaScript, and search engines
 * like Google correctly parse them in JSON-LD structured data.
 * 
 * @param jsonString - The JSON string to sanitize
 * @returns Sanitized JSON string safe for embedding in script tags
 * 
 * @example
 * ```ts
 * const dangerous = '{"name": "Test</script><script>alert(1)</script>"}';
 * const safe = sanitizeJsonForScript(dangerous);
 * // Result: '{"name": "Test\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e"}'
 * ```
 */
function sanitizeJsonForScript(jsonString: string): string {
  return jsonString
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * JsonLd component for embedding structured data in pages
 * 
 * Renders JSON-LD structured data for SEO purposes. The component automatically
 * sanitizes the JSON to prevent XSS attacks when embedding in script tags.
 * 
 * @param data - The structured data object to embed (Schema.org format)
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data)
  const sanitizedJson = sanitizeJsonForScript(jsonString)
  
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJson }}
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
  url: getBaseUrl(),
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
  url: getBaseUrl(),
  logo: `${getBaseUrl()}/images/stayfocus_logo.png`,
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
