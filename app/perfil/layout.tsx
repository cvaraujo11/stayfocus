import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perfil',
  description: 'Gerencie suas informações pessoais e preferências no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
