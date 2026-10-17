import { useMemo } from 'react'
import { useLibrary } from './useLibrary'

const EMPTY = new Set<string>()

/** Conjunto de jogos do Player logado, para o selo "Na biblioteca". Lê o mesmo cache da tela Minha biblioteca. */
export function useOwnedGames(): Set<string> {
  const { data } = useLibrary()
  return useMemo(() => (data ? new Set(data.map((item) => item.gameId)) : EMPTY), [data])
}
