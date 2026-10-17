import type { GameCoverResponse, UserLibraryItemResponse } from '../api/types'

/** Jogo da biblioteca como a tela e o painel consomem: sem preço, com a data de aquisição. */
export interface LibraryGame {
  id: string
  name: string
  description: string
  genre: string
  coverUrl: string | null
  acquiredAt: string
}

/** Junta os itens de /library com as capas do Catalog; mais recentes primeiro, empate pelo nome. */
export function toLibraryGames(items: UserLibraryItemResponse[], covers: GameCoverResponse[] = []): LibraryGame[] {
  const coverById = new Map(covers.map((c) => [c.gameId, c.coverUrl]))
  return items
    .map((item) => ({
      id: item.gameId,
      name: item.gameName,
      description: item.description,
      genre: item.genre,
      coverUrl: coverById.get(item.gameId) || null,
      acquiredAt: item.acquiredAt,
    }))
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
