import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autoconhecimento',
  description: 'Registre suas reflexões e padrões pessoais no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AutoconhecimentoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
