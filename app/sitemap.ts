import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/app/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()
  
  // Data atual para lastModified
  const currentDate = new Date()
  
  // Rotas públicas do aplicativo
  const routes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  return routes
}
