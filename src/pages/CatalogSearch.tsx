import { useMemo, useRef } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchCatalog } from '../api/catalog'
import { fromCatalog, type GameView } from '../lib/game'
import { retryDelay, retryUnlessClientError } from '../lib/queryPolicy'
import { resultCountLabel } from '../lib/search'
import { GameCard, GameCardSkeleton } from '../components/GameCard'
import { Pagination } from '../components/Pagination'
import { QueryProblem } from '../components/QueryProblem'

const PAGE_SIZE = 12

interface Props {
  term: string
  page: number
  onPage: (page: number) => void
  onClear: () => void
  onOpen: (game: GameView) => void
  /** Completa o fim da promoção, que a busca (como o catálogo) não traz. */
  withEndDate: (game: GameView) => GameView
}

/** Resultados da busca no Elasticsearch, na ordem de relevância que a API devolve. */
export function CatalogSearch({ term, page, onPage, onClear, onOpen, withEndDate }: Props) {
  const top = useRef<HTMLDivElement>(null)

  const results = useQuery({
    queryKey: ['catalog', 'search', term, page],
    queryFn: ({ signal }) => searchCatalog({ term, page, pageSize: PAGE_SIZE }, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: retryUnlessClientError,
    retryDelay,
  })

  const list = useMemo(() => (results.data?.items ?? []).map((g) => withEndDate(fromCatalog(g))), [results.data, withEndDate])
  const total = results.data?.totalItems ?? 0
  const totalPages = results.data?.totalPages ?? 0
  const pageGone = results.isSuccess && list.length === 0 && page > 1 && total > 0

  const goToPage = (n: number) => {
    onPage(n)
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="catalog__all" aria-labelledby="search-title">
      <div className="catalog__head" ref={top}>
        <h2 id="search-title" className="section-title">
          Resultados da busca
        </h2>
        {results.data && (
          // Anuncia a contagem quando a busca termina, para quem usa leitor de tela.
          <p className="catalog__count" role="status">
            {total > 0 ? `${resultCountLabel(total)} para “${term}”` : `Nada encontrado para “${term}”`}
          </p>
        )}
      </div>

      {results.isError && <QueryProblem error={results.error} retrying={results.isFetching} onRetry={() => results.refetch()} />}

      {results.isPending && (
        <div className="catalog__grid" aria-busy="true">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      )}

      {results.isSuccess && list.length === 0 && (
        <div className="catalog__empty">
          {pageGone ? (
            <>
              <p className="catalog__empty-title">Esta página não existe mais.</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => goToPage(1)}>
                Voltar para a primeira página
              </button>
            </>
          ) : (
            <>
              <p className="catalog__empty-title">Nenhum jogo encontrado para “{term}”.</p>
              <p className="catalog__empty-text">Confira a grafia ou tente pelo gênero, como “corrida” ou “terror”.</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onClear}>
                Ver todos os jogos
              </button>
            </>
          )}
        </div>
      )}

      {list.length > 0 && (
        <div className={`catalog__grid${results.isPlaceholderData ? ' catalog__grid--stale' : ''}`} aria-busy={results.isFetching}>
          {list.map((g, i) => (
            <GameCard key={g.id} game={g} onOpen={onOpen} eager={i < 6} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </section>
  )
}
