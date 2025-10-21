import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saúde',
  description: 'Gerencie seus medicamentos e monitore seu bem-estar no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SaudeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
