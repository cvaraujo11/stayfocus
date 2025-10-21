import { ListaCompras } from '../../components/receitas/ListaCompras'
import { BackButton } from '../../components/common/BackButton'

// This page renders the shopping list component.
export default function ListaComprasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/receitas" className="mb-4" />
      <ListaCompras />
    </div>
  )
}
