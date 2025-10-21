import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hiperfocos',
  description: 'Organize seus projetos e interesses especiais no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function HiperfocosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
