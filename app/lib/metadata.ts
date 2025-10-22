import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stayfocus-alpha.vercel.app'

// Metadata base compartilhada
const baseMetadata = {
  metadataBase: new URL(baseUrl),
  applicationName: 'StayFocus',
  authors: [{ name: 'StayFocus Team' }],
  generator: 'Next.js',
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
  creator: 'StayFocus',
  publisher: 'StayFocus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'StayFocus',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@stayfocus',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
}

// Função helper para criar metadata de página
export function createPageMetadata({
  title,
  description,
  path = '',
  keywords = [],
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  keywords?: string[]
  noIndex?: boolean
}): Metadata {
  const fullTitle = `${title} | StayFocus`
  const url = `${baseUrl}${path}`
  const imageUrl = `${baseUrl}/images/stayfocus_logo.png`

  return {
    ...baseMetadata,
    title: fullTitle,
    description,
    keywords: [...baseMetadata.keywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: fullTitle,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'StayFocus - Organização para Neurodivergentes',
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : baseMetadata.robots,
  }
}

// Metadata específica para cada página pública
export const homeMetadata = createPageMetadata({
  title: 'Início',
  description:
    'StayFocus: aplicativo de organização e produtividade desenvolvido especialmente para pessoas neurodivergentes com TDAH e autismo. Gerencie tarefas, medicamentos, sono e muito mais.',
  path: '/',
  keywords: [
    'painel neurodivergente',
    'dashboard TDAH',
    'organização diária',
    'gestão de rotina',
  ],
})

export const loginMetadata = createPageMetadata({
  title: 'Login',
  description:
    'Entre na sua conta StayFocus para acessar suas ferramentas de organização e produtividade personalizadas para neurodivergentes.',
  path: '/login',
  keywords: ['login', 'entrar', 'acesso'],
  noIndex: true,
})

export const registroMetadata = createPageMetadata({
  title: 'Criar Conta',
  description:
    'Crie sua conta gratuita no StayFocus e comece a organizar sua vida com ferramentas desenvolvidas especialmente para pessoas neurodivergentes.',
  path: '/registro',
  keywords: ['registro', 'criar conta', 'cadastro', 'sign up'],
})

export const roadmapMetadata = createPageMetadata({
  title: 'Roadmap',
  description:
    'Conheça o roadmap de desenvolvimento do StayFocus: funcionalidades implementadas e planejadas para ajudar pessoas neurodivergentes na organização e produtividade.',
  path: '/roadmap',
  keywords: [
    'roadmap',
    'funcionalidades',
    'desenvolvimento',
    'planejamento',
    'recursos',
  ],
})

// Metadata para páginas privadas (não indexadas)
export const perfilMetadata = createPageMetadata({
  title: 'Perfil',
  description: 'Gerencie suas informações pessoais e preferências no StayFocus.',
  path: '/perfil',
  noIndex: true,
})

export const saudeMetadata = createPageMetadata({
  title: 'Saúde',
  description: 'Gerencie seus medicamentos e monitore seu bem-estar.',
  path: '/saude',
  noIndex: true,
})

export const hiperfocosMetadata = createPageMetadata({
  title: 'Hiperfocos',
  description: 'Organize seus projetos e interesses especiais.',
  path: '/hiperfocos',
  noIndex: true,
})

export const lazerMetadata = createPageMetadata({
  title: 'Lazer',
  description: 'Planeje suas atividades de lazer e descanso.',
  path: '/lazer',
  noIndex: true,
})

export const alimentacaoMetadata = createPageMetadata({
  title: 'Alimentação',
  description: 'Planeje suas refeições e acompanhe sua hidratação.',
  path: '/alimentacao',
  noIndex: true,
})

export const sonoMetadata = createPageMetadata({
  title: 'Sono',
  description: 'Monitore e melhore a qualidade do seu sono.',
  path: '/sono',
  noIndex: true,
})

export const autoconhecimentoMetadata = createPageMetadata({
  title: 'Autoconhecimento',
  description: 'Registre suas reflexões e padrões pessoais.',
  path: '/autoconhecimento',
  noIndex: true,
})

export const financasMetadata = createPageMetadata({
  title: 'Finanças',
  description: 'Gerencie suas finanças pessoais.',
  path: '/financas',
  noIndex: true,
})

export const receitasMetadata = createPageMetadata({
  title: 'Receitas',
  description: 'Organize suas receitas favoritas.',
  path: '/receitas',
  noIndex: true,
})
