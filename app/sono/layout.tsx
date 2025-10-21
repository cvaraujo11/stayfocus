import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sono',
  description: 'Monitore e melhore a qualidade do seu sono no StayFocus.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SonoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
