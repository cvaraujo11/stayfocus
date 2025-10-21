import { DetalhesReceita } from '../../components/receitas/DetalhesReceita'
import { BackButton } from '../../components/common/BackButton'

interface ReceitaDetalhesPageProps {
  params: {
    id: string
  }
}

// This page will be dynamically rendered based on the [id] parameter
export default function ReceitaDetalhesPage({ params }: ReceitaDetalhesPageProps) {
  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <BackButton href="/receitas" />
      </div>
      <DetalhesReceita id={params.id} />
    </div>
  )
}

// Optional: Add generateStaticParams if you want to pre-render some recipe pages at build time
// export async function generateStaticParams() {
//   // Fetch a list of recipe IDs from your data source (e.g., the store or an API)
//   // const recipes = await fetchRecipes(); // Replace with your data fetching logic
//   // return recipes.map((recipe) => ({
//   //   id: recipe.id,
//   // }));
//   return []; // Return empty array if not pre-rendering
// }
