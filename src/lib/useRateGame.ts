import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rateGame } from '../api/library'
import type { UserLibraryItemResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { libraryKey } from './useLibrary'
import { withRating } from './rating'

/**
 * Salva a nota do Player para um jogo da biblioteca.
 * Deu certo: grava a nota no cache de /library (sem refetch, o Kong limita a rota) e marca o catálogo
 * (lista, promoções e busca) como velho, para a média nova aparecer na próxima visita (o Catalog recalcula ao consumir o evento).
 */
export function useRateGame() {
  const { user } = useAuth()
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({ gameId, rating }: { gameId: string; rating: number }) => rateGame(gameId, rating),
    onSuccess: (_data, { gameId, rating }) => {
      client.setQueryData<UserLibraryItemResponse[]>(libraryKey(user?.id), (items) => (items ? withRating(items, gameId, rating) : items))
      // Lista, promoções e busca mostram a média: todas ficam velhas (sem refetch agora; a média muda depois).
      void client.invalidateQueries({ queryKey: ['catalog'], refetchType: 'none' })
    },
  })
}
