import { ApiError, request } from './client'
import type { GameGenre, GamePromotionResponse, GameUserResponse, PagedResult, UserLibraryItemResponse } from './types'

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
 * Todos os gameId da biblioteca. /library tem limite de 2 req/min no Kong,
 * por isso uma página grande e o resultado fica em cache na sessão.
 */
export async function getOwnedGameIds(signal?: AbortSignal): Promise<Set<string>> {
  const owned = new Set<string>()
  const pageSize = 100
  for (let page = 1; ; page++) {
    const result = await pagedOrEmpty(
      request<PagedResult<UserLibraryItemResponse>>('/library', { query: { page, pageSize }, signal }),
      page,
      pageSize,
    )
    result.items.forEach((item) => owned.add(item.gameId))
    if (page >= result.totalPages) return owned
  }
}
