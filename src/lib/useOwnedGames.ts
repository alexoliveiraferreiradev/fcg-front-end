import { useQuery } from '@tanstack/react-query'
import { getOwnedGameIds } from '../api/catalog'
import { useAuth } from '../auth/AuthContext'
import { retryUnlessClientError, retryDelay } from './queryPolicy'

const EMPTY = new Set<string>()

/**
 * Conjunto de jogos do Player logado, para o selo "Na biblioteca".
 * Buscado uma vez por sessão (/library: 2 req/min); invalidar ['me', 'library'] quando um pedido for concluído.
 */
export function useOwnedGames(): Set<string> {
  const { user, isPlayer } = useAuth()
  const { data } = useQuery({
    queryKey: ['me', 'library', 'ids', user?.id],
    queryFn: ({ signal }) => getOwnedGameIds(signal),
    enabled: isPlayer,
    staleTime: Infinity,
    retry: retryUnlessClientError,
    retryDelay,
  })
  return data ?? EMPTY
}
