import { BackButton } from '@/app/components/common/BackButton'

export default function ConcursosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/estudos" className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Concursos</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Página de gerenciamento de concursos
      </p>
    </div>
  )
}
