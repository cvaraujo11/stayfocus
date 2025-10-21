import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Receitas',
  description: 'Organize suas receitas favoritas no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ReceitasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
