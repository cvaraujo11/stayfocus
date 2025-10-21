import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Acompanhe todas as novidades, melhorias e correções do StayFocus. Veja o histórico completo de versões e atualizações da aplicação.',
  keywords: [
    'changelog',
    'atualizações',
    'versões',
    'novidades',
    'melhorias',
    'correções',
    'StayFocus',
    'histórico de versões'
  ],
  openGraph: {
    title: 'Changelog - StayFocus',
    description: 'Acompanhe todas as novidades, melhorias e correções do StayFocus',
    type: 'website',
  },
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
