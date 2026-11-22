import { request } from './client'
import type { RateGameRequest } from './types'

/**
 * Avalia um jogo da biblioteca do Player logado (0 a 5; avaliar de novo troca a nota).
 * A UserLibrary grava a nota e publica o evento; o Catalog recalcula a média depois, ao consumir.
 */
export function rateGame(gameId: string, rating: number) {
  const body: RateGameRequest = { rating }
  return request<void>(`/library/${encodeURIComponent(gameId)}/rating`, { method: 'PUT', body })
}
