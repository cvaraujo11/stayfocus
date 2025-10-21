import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lazer',
  description: 'Planeje suas atividades de lazer e descanso no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LazerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
