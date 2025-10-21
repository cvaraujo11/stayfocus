import { AdicionarReceitaForm } from '../../components/receitas/AdicionarReceitaForm'
import { BackButton } from '../../components/common/BackButton'

// This page renders the form for adding a new recipe.
// No 'receitaParaEditar' prop is passed, so the form starts empty.
export default function AdicionarReceitaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/receitas" className="mb-4" />
      <AdicionarReceitaForm />
    </div>
  )
}
