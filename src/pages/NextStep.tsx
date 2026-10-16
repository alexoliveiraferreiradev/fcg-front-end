import { Link } from 'react-router-dom'

/** Rotas do menu que entram nas próximas etapas do plano (C4–C6). */
export function NextStep({ title }: { title: string }) {
  return (
    <main className="container page-simple">
      <h1 className="section-title">{title}</h1>
      <p>Esta tela entra numa próxima etapa da construção do front.</p>
      <Link to="/" className="btn btn--ghost btn--sm">
        Voltar ao catálogo
      </Link>
    </main>
  )
}

export function NotFound() {
  return <NextStep title="Página não encontrada" />
}
