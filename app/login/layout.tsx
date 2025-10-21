import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description:
    'Entre na sua conta StayFocus para acessar suas ferramentas de organização e produtividade personalizadas para neurodivergentes.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
