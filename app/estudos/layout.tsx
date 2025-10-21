import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Estudos e Concursos | StayFocus',
  description: 'Organize seus estudos para concursos públicos com ferramentas adaptadas para TDAH',
}

export default function EstudosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
