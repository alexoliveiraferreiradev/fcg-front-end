import { useQuery } from '@tanstack/react-query'
import { getGameCovers, getLibrary } from '../api/catalog'
import { useAuth } from '../auth/AuthContext'
import { retryDelay, retryUnlessClientError } from './queryPolicy'

/** Chave da biblioteca do Player. Invalidar ['me', 'library'] quando um pedido for aprovado. */
export const libraryKey = (userId: string | undefined) => ['me', 'library', userId] as const

/**
 * A biblioteca inteira do Player logado, num cache só para a tela e o selo "Na biblioteca".
 * /library tem 10 req/min por usuário no Kong: sem refetch ao focar a janela e válida por 1 minuto.
 */
export function useLibrary() {
  const { user, isPlayer } = useAuth()
  return useQuery({
    queryKey: libraryKey(user?.id),
    queryFn: ({ signal }) => getLibrary(signal),
    enabled: isPlayer,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: retryUnlessClientError,
    retryDelay,
  })
}

/** Capas dos jogos pedidos (inclusive desativados), em cache por 5 minutos. */
export function useGameCovers(ids: string[]) {
  const sorted = [...ids].sort()
  return useQuery({
    queryKey: ['catalog', 'covers', sorted.join(',')],
    queryFn: ({ signal }) => getGameCovers(sorted, signal),
    enabled: sorted.length > 0,
    staleTime: 5 * 60_000,
    retry: retryUnlessClientError,
    retryDelay,
  })
}
