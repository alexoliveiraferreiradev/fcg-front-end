import { useMemo, useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { pageOf, toLibraryGames } from '../lib/library'
import { useGameCovers, useLibrary } from '../lib/useLibrary'
import { GameCardSkeleton } from '../components/GameCard'
import { GamePanel } from '../components/GamePanel'
import { LibraryCard } from '../components/LibraryCard'
import { Pagination } from '../components/Pagination'
import { QueryProblem } from '../components/QueryProblem'
import './Catalog.css'

const PAGE_SIZE = 12

function parsePage(value: string | null): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : 1
}

/** Minha biblioteca: os jogos do Player, paginados no cliente sobre o cache de /library. */
export function Library() {
  const { user, isAdmin } = useAuth()

  if (!user) return <Navigate to="/entrar?voltar=%2Fbiblioteca" replace />
  if (isAdmin) {
    return (
      <main className="catalog container">
        <h1 className="section-title">Minha biblioteca</h1>
        <div className="catalog__empty">
          <p className="catalog__empty-title">Admin não tem biblioteca.</p>
          <p className="catalog__empty-text">A biblioteca é dos Players: entre com uma conta de Player para ver os jogos comprados.</p>
        </div>
      </main>
    )
  }
  return <PlayerLibrary />
}

function PlayerLibrary() {
  const [params, setParams] = useSearchParams()
  const page = parsePage(params.get('pagina'))
  // Guarda o id: o painel lê o jogo da lista, e a nota salva aparece nele sem fechar.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const top = useRef<HTMLDivElement>(null)

  const library = useLibrary()
  const ids = useMemo(() => (library.data ?? []).map((item) => item.gameId), [library.data])
  const covers = useGameCovers(ids)

  // Sem capas (falha no Catalog) os cards seguem com o placeholder.
  const games = useMemo(() => toLibraryGames(library.data ?? [], covers.data), [library.data, covers.data])
  const { items, totalPages } = pageOf(games, page, PAGE_SIZE)
  const selected = games.find((g) => g.id === selectedId) ?? null
  const coverPending = covers.isPending && covers.fetchStatus !== 'idle'

  const goToPage = (n: number) => {
    setParams(n > 1 ? { pagina: String(n) } : {})
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="catalog container">
      <section className="catalog__all" aria-labelledby="library-title">
        <div className="catalog__head" ref={top}>
          <h1 id="library-title" className="section-title">
            Minha biblioteca
          </h1>
          {games.length > 0 && (
            <p className="catalog__count">
              {games.length} {games.length === 1 ? 'jogo' : 'jogos'}
            </p>
          )}
        </div>

        {library.isError && <QueryProblem error={library.error} retrying={library.isFetching} onRetry={() => library.refetch()} />}

        {library.isPending && !library.isError && (
          <div className="catalog__grid" aria-busy="true">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        )}

        {library.isSuccess && games.length === 0 && (
          <div className="catalog__empty">
            <p className="catalog__empty-title">Sua biblioteca está vazia.</p>
            <p className="catalog__empty-text">Os jogos aparecem aqui depois que o pagamento do pedido é aprovado.</p>
            <Link to="/" className="btn btn--ghost btn--sm">
              Ver o catálogo
            </Link>
          </div>
        )}

        {library.isSuccess && games.length > 0 && items.length === 0 && (
          <div className="catalog__empty">
            <p className="catalog__empty-title">Esta página não existe mais.</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => goToPage(1)}>
              Voltar para a primeira página
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="catalog__grid">
            {items.map((g, i) => (
              <LibraryCard key={g.id} game={g} onOpen={(g) => setSelectedId(g.id)} coverPending={coverPending} eager={i < 6} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      </section>

      <GamePanel game={selected} onClose={() => setSelectedId(null)} />
    </main>
  )
}
