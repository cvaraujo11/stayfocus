import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finanças',
  description: 'Gerencie suas finanças pessoais no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function FinancasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
