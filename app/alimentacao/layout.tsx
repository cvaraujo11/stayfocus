import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alimentação',
  description: 'Planeje suas refeições e acompanhe sua hidratação no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AlimentacaoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
