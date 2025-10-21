import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar Conta',
  description:
    'Crie sua conta gratuita no StayFocus e comece a organizar sua vida com ferramentas desenvolvidas especialmente para pessoas neurodivergentes.',
  keywords: [
    'registro',
    'criar conta',
    'cadastro',
    'sign up',
    'TDAH',
    'autismo',
    'neurodivergente',
  ],
  openGraph: {
    title: 'Criar Conta | StayFocus',
    description:
      'Crie sua conta gratuita no StayFocus e comece a organizar sua vida com ferramentas desenvolvidas especialmente para pessoas neurodivergentes.',
  },
  twitter: {
    title: 'Criar Conta | StayFocus',
    description:
      'Crie sua conta gratuita no StayFocus e comece a organizar sua vida com ferramentas desenvolvidas especialmente para pessoas neurodivergentes.',
  },
}

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
