import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/app/lib/env'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/registro',
          '/roadmap',
        ],
        disallow: [
          '/perfil',
          '/auth',
          '/alimentacao',
          '/autoconhecimento',
          '/financas',
          '/hiperfocos',
          '/lazer',
          '/receitas',
          '/saude',
          '/sono',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
