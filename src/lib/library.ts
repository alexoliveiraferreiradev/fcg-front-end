import type { GameCoverResponse, UserLibraryItemResponse } from '../api/types'

/** Jogo da biblioteca como a tela e o painel consomem: sem preço, com a data de aquisição. */
export interface LibraryGame {
  id: string
  name: string
  description: string
  genre: string
  coverUrl: string | null
  acquiredAt: string
  /** Nota do próprio Player (0 a 5); null enquanto ele não avaliou. */
  rating: number | null
  /** Saiu da loja (desativado ou o Catalog não conhece mais o id): continua na biblioteca, só não se compra mais. */
  offStore: boolean
}

/**
 * Junta os itens de /library com as capas do Catalog; mais recentes primeiro, empate pelo nome.
 * Sem `covers` (carregando ou falhou) não dá para saber se o jogo saiu da loja: fica como na loja.
 */
export function toLibraryGames(items: UserLibraryItemResponse[], covers?: GameCoverResponse[]): LibraryGame[] {
  const coverById = new Map((covers ?? []).map((c) => [c.gameId, c]))
  return items
    .map((item) => {
      const cover = coverById.get(item.gameId)
      return {
        id: item.gameId,
        name: item.gameName,
        description: item.description,
        genre: item.genre,
        coverUrl: cover?.coverUrl || null,
        acquiredAt: item.acquiredAt,
        rating: typeof item.rating === 'number' ? item.rating : null,
        offStore: covers !== undefined && (cover === undefined || cover.isActive === false),
      }
    })
    .sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt) || a.name.localeCompare(b.name, 'pt-BR'))
}

/** Fatia de uma lista já carregada, para paginar no cliente. Página fora do intervalo devolve vazio. */
export function pageOf<T>(list: T[], page: number, pageSize: number): { items: T[]; totalPages: number } {
  const totalPages = Math.ceil(list.length / pageSize)
  const start = (page - 1) * pageSize
  return { items: list.slice(start, start + pageSize), totalPages }
}

export function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}
