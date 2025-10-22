import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/app/components/layout/Header'
import { Footer } from '@/app/components/layout/Footer'
import { Providers } from '@/app/providers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { JsonLd, webApplicationSchema, organizationSchema } from '@/app/components/seo/JsonLd'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://stayfocus-alpha.vercel.app'),
  title: {
    default: 'StayFocus - Organização para Neurodivergentes',
    template: '%s | StayFocus',
  },
  description:
    'Aplicativo de organização e produtividade desenvolvido especialmente para pessoas neurodivergentes com TDAH e autismo. Gerencie tarefas, medicamentos, sono e muito mais.',
  keywords: [
    'TDAH',
    'autismo',
    'neurodivergência',
    'organização',
    'produtividade',
    'gestão de tarefas',
    'saúde mental',
    'aplicativo neurodivergente',
    'planejamento',
    'rotina',
  ],
  authors: [{ name: 'StayFocus Team' }],
  creator: 'StayFocus',
  publisher: 'StayFocus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: '/images/stayfocus_logo.png', type: 'image/png' }],
    apple: '/images/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://stayfocus-alpha.vercel.app',
    siteName: 'StayFocus',
    title: 'StayFocus - Organização para Neurodivergentes',
    description:
      'Aplicativo de organização e produtividade desenvolvido especialmente para pessoas neurodivergentes com TDAH e autismo.',
    images: [
      {
        url: '/images/stayfocus_logo.png',
        width: 1200,
        height: 630,
        alt: 'StayFocus - Organização para Neurodivergentes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StayFocus - Organização para Neurodivergentes',
    description:
      'Aplicativo de organização e produtividade desenvolvido especialmente para pessoas neurodivergentes com TDAH e autismo.',
    images: ['/images/stayfocus_logo.png'],
    creator: '@stayfocus',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Adicione aqui os códigos de verificação quando disponíveis
    // google: 'seu-codigo-google',
    // yandex: 'seu-codigo-yandex',
    // bing: 'seu-codigo-bing',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <JsonLd data={webApplicationSchema} />
        <JsonLd data={organizationSchema} />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4">
                {children}
                <Footer />
              </main>
            </div>
          </div>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
