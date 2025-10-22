import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stayfocus-alpha.vercel.app'
  
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
