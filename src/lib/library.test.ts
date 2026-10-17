import { describe, expect, it } from 'vitest'
import { chunk, pageOf, toLibraryGames } from './library'
import { formatDate } from './format'

const item = (gameId: string, gameName: string, acquiredAt: string) => ({
  gameId,
  gameName,
  description: '',
  genre: 'RPG',
  acquiredAt,
})

describe('toLibraryGames', () => {
  it('ordena do mais recente para o mais antigo, empate pelo nome', () => {
    const list = toLibraryGames([
      item('a', 'Antigo', '2026-10-01T10:00:00Z'),
      item('z', 'Zeta', '2026-10-12T09:45:00Z'),
      item('b', 'Beta', '2026-10-12T09:45:00Z'),
    ])
    expect(list.map((g) => g.name)).toEqual(['Beta', 'Zeta', 'Antigo'])
  })

  it('usa a capa do Catalog e cai no placeholder quando falta', () => {
    const list = toLibraryGames(
      [item('a', 'A', '2026-10-01T10:00:00Z'), item('b', 'B', '2026-10-02T10:00:00Z'), item('c', 'C', '2026-10-03T10:00:00Z')],
      [
        { gameId: 'a', name: 'A', coverUrl: '/covers/a.svg' },
        { gameId: 'b', name: 'B', coverUrl: null },
      ],
    )
    expect(Object.fromEntries(list.map((g) => [g.id, g.coverUrl]))).toEqual({ a: '/covers/a.svg', b: null, c: null })
  })
})

describe('pageOf', () => {
  const list = Array.from({ length: 14 }, (_, i) => i)
  it('fatia pelo tamanho da página', () => {
    expect(pageOf(list, 1, 12)).toEqual({ items: list.slice(0, 12), totalPages: 2 })
    expect(pageOf(list, 2, 12)).toEqual({ items: [12, 13], totalPages: 2 })
  })
  it('página além do fim fica vazia', () => {
    expect(pageOf(list, 3, 12).items).toEqual([])
    expect(pageOf([], 1, 12)).toEqual({ items: [], totalPages: 0 })
  })
})

describe('chunk', () => {
  it('divide em lotes do tamanho pedido', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 50)).toEqual([])
  })
})

describe('formatDate', () => {
  it('formata dia, mês e ano em pt-BR', () => {
    expect(formatDate('2026-10-12T09:45:00Z')).toBe('12/10/2026')
  })
  it('data inválida vira texto vazio', () => {
    expect(formatDate('ontem')).toBe('')
  })
})
