import { ApiError, request } from './client'
import type { GameCoverResponse, GameGenre, GamePromotionResponse, GameUserResponse, PagedResult, UserLibraryItemResponse } from './types'
import { chunk } from '../lib/library'

const COVERS_BATCH = 50

/** O Catalog devolve 404 quando não há itens; para a tela isso é uma lista vazia. */
async function pagedOrEmpty<T>(promise: Promise<PagedResult<T>>, page: number, pageSize: number): Promise<PagedResult<T>> {
  try {
    const result = await promise
    return { ...result, items: result.items ?? [] }
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return { items: [], pageNumber: page, pageSize, totalItems: 0, totalPages: 0 }
    }
    throw e
  }
}

export function getCatalog(params: { genre?: GameGenre; page: number; pageSize: number }, signal?: AbortSignal) {
  return pagedOrEmpty(
    request<PagedResult<GameUserResponse>>('/catalog/games', { query: params, auth: false, signal }),
    params.page,
    params.pageSize,
  )
}

export function getPromoted(signal?: AbortSignal) {
  return pagedOrEmpty(
    request<PagedResult<GamePromotionResponse>>('/catalog/games/promoted', {
      query: { page: 1, pageSize: 50 },
      auth: false,
      signal,
    }),
    1,
    50,
  )
}

/**
 * A biblioteca inteira do Player logado. /library tem limite por usuário no Kong,
 * por isso uma página grande e o resultado fica em cache (useLibrary) para a tela e o selo do catálogo.
 */
export async function getLibrary(signal?: AbortSignal): Promise<UserLibraryItemResponse[]> {
  const items: UserLibraryItemResponse[] = []
  const pageSize = 100
  for (let page = 1; ; page++) {
    const result = await pagedOrEmpty(
      request<PagedResult<UserLibraryItemResponse>>('/library', { query: { page, pageSize }, signal }),
      page,
      pageSize,
    )
    items.push(...result.items)
    if (page >= result.totalPages) return items
  }
}

/** Capas por id, inclusive de jogos desativados. Lotes de até 50 ids (limite do Catalog). */
export async function getGameCovers(ids: string[], signal?: AbortSignal): Promise<GameCoverResponse[]> {
  const batches = chunk(ids, COVERS_BATCH)
  const results = await Promise.all(
    batches.map((batch) => request<GameCoverResponse[]>('/catalog/games/covers', { query: { ids: batch }, auth: false, signal })),
  )
  return results.flat()
}
