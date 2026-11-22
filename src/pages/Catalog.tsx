import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCatalog, getPromoted } from '../api/catalog'
import type { GameGenre } from '../api/types'
import { fromCatalog, fromPromotion, genreLabel, sortPromotions, toGenre, type GameView } from '../lib/game'
import { retryDelay, retryUnlessClientError } from '../lib/queryPolicy'
import { parseSearchTerm } from '../lib/search'
import { GameCard, GameCardSkeleton } from '../components/GameCard'
import { GamePanel } from '../components/GamePanel'
import { GenreFilter } from '../components/GenreFilter'
import { Pagination } from '../components/Pagination'
import { Promotions, PromotionsSkeleton } from '../components/Promotions'
import { QueryProblem } from '../components/QueryProblem'
import { SearchBox } from '../components/SearchBox'
import { CatalogSearch } from './CatalogSearch'
import './Catalog.css'

const PAGE_SIZE = 12

function parsePage(value: string | null): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : 1
}

/** Estado da tela na URL: ?busca= (resultados da busca) ou ?genero= (filtro), e ?pagina=. */
interface CatalogParams {
  term?: string
  genre?: GameGenre
  page?: number
}

export function Catalog() {
  const [params, setParams] = useSearchParams()
  const term = parseSearchTerm(params.get('busca'))
  // toGenre aceita o nome antigo em inglês: links salvos com ?genero=Action continuam filtrando.
  const genre = term ? undefined : toGenre(params.get('genero'))
  const page = parsePage(params.get('pagina'))
  const [selected, setSelected] = useState<GameView | null>(null)

  const promoted = useQuery({
    queryKey: ['catalog', 'promoted'],
    queryFn: ({ signal }) => getPromoted(signal),
    staleTime: 60_000,
    retry: retryUnlessClientError,
    retryDelay,
  })

  const promotions = useMemo(() => sortPromotions((promoted.data?.items ?? []).map(fromPromotion)), [promoted.data])

  // O catálogo e a busca não trazem o fim da promoção; completa com o que veio de /promoted.
  const withEndDate = useCallback(
    (view: GameView): GameView => {
      if (view.discount === null) return view
      const promo = promotions.find((p) => p.id === view.id)
      return { ...view, endDate: promo?.endDate ?? null }
    },
    [promotions],
  )

  const update = (next: CatalogParams) => {
    const p = new URLSearchParams()
    if (next.term) p.set('busca', next.term)
    else if (next.genre) p.set('genero', next.genre)
    if (next.page && next.page > 1) p.set('pagina', String(next.page))
    setParams(p)
  }

  return (
    <main className="catalog container">
      <h1 className="sr-only">Catálogo de jogos</h1>

      <SearchBox term={term} onSearch={(t) => update({ term: t })} onClear={() => update({})} />

      {term ? (
        <CatalogSearch
          term={term}
          page={page}
          onPage={(n) => update({ term, page: n })}
          onClear={() => update({})}
          onOpen={setSelected}
          withEndDate={withEndDate}
        />
      ) : (
        <>
          {promoted.isPending ? (
            <PromotionsSkeleton />
          ) : promoted.isError && !promoted.data ? (
            <section className="promotions">
              <h2 className="section-title">Em promoção</h2>
              <QueryProblem error={promoted.error} retrying={promoted.isFetching} onRetry={() => promoted.refetch()} />
            </section>
          ) : (
            <Promotions promotions={promotions} onOpen={setSelected} />
          )}

          <AllGames genre={genre} page={page} update={update} onOpen={setSelected} withEndDate={withEndDate} />
        </>
      )}

      <GamePanel game={selected} onClose={() => setSelected(null)} />
    </main>
  )
}

interface AllGamesProps {
  genre: GameGenre | undefined
  page: number
  update: (next: CatalogParams) => void
  onOpen: (game: GameView) => void
  withEndDate: (game: GameView) => GameView
}

/** Todos os jogos ativos, com filtro de gênero e paginação no Catalog. */
function AllGames({ genre, page, update, onOpen, withEndDate }: AllGamesProps) {
  const gridTop = useRef<HTMLDivElement>(null)

  const games = useQuery({
    queryKey: ['catalog', 'games', genre ?? null, page],
    queryFn: ({ signal }) => getCatalog({ genre, page, pageSize: PAGE_SIZE }, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: retryUnlessClientError,
    retryDelay,
  })

  const list = useMemo(() => (games.data?.items ?? []).map((g) => withEndDate(fromCatalog(g))), [games.data, withEndDate])

  const goToPage = (n: number) => {
    update({ genre, page: n })
    gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const totalPages = games.data?.totalPages ?? 0
  const isEmpty = games.isSuccess && list.length === 0

  return (
    <section className="catalog__all" aria-labelledby="all-title">
      <div className="catalog__head" ref={gridTop}>
        <h2 id="all-title" className="section-title">
          Todos os jogos
        </h2>
        {games.data && games.data.totalItems > 0 && (
          <p className="catalog__count">
            {games.data.totalItems} {games.data.totalItems === 1 ? 'jogo' : 'jogos'}
            {genre && ` em ${genreLabel(genre)}`}
          </p>
        )}
      </div>

      <GenreFilter value={genre} onChange={(g) => update({ genre: g, page: 1 })} />

      {games.isError && <QueryProblem error={games.error} retrying={games.isFetching} onRetry={() => games.refetch()} />}

      {games.isPending && (
        <div className="catalog__grid">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="catalog__empty">
          <p className="catalog__empty-title">
            {page > 1 && totalPages > 0
              ? 'Esta página não existe mais.'
              : genre
                ? `Nenhum jogo de ${genreLabel(genre)} no catálogo.`
                : 'O catálogo ainda está vazio.'}
          </p>
          {page > 1 && totalPages > 0 ? (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => update({ genre, page: 1 })}>
              Voltar para a primeira página
            </button>
          ) : genre ? (
            <Link to="/" className="btn btn--ghost btn--sm">
              Ver todos
            </Link>
          ) : (
            <p className="catalog__empty-text">Jogos cadastrados no Admin aparecem aqui.</p>
          )}
        </div>
      )}

      {list.length > 0 && (
        <div className={`catalog__grid${games.isPlaceholderData ? ' catalog__grid--stale' : ''}`} aria-busy={games.isFetching}>
          {list.map((g, i) => (
            <GameCard key={g.id} game={g} onOpen={onOpen} eager={i < 6} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </section>
  )
}
