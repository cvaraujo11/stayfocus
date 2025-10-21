import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'Conheça o roadmap de desenvolvimento do StayFocus: funcionalidades implementadas e planejadas para ajudar pessoas neurodivergentes na organização e produtividade.',
  keywords: [
    'roadmap',
    'funcionalidades',
    'desenvolvimento',
    'planejamento',
    'recursos',
    'TDAH',
    'autismo',
    'neurodivergente',
  ],
  openGraph: {
    title: 'Roadmap | StayFocus',
    description:
      'Conheça o roadmap de desenvolvimento do StayFocus: funcionalidades implementadas e planejadas para ajudar pessoas neurodivergentes.',
  },
  twitter: {
    title: 'Roadmap | StayFocus',
    description:
      'Conheça o roadmap de desenvolvimento do StayFocus: funcionalidades implementadas e planejadas para ajudar pessoas neurodivergentes.',
  },
}

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
