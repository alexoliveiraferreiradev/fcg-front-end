import type { UserLibraryItemResponse } from '../api/types'

// Mesma escala do LibraryEntry (UserLibrary) e do Avaliation (Catalog): de 0 a 5.
export const RATING_MAX = 5
/** Notas que a tela oferece: estrelas inteiras de 1 a 5 (a API aceita 0, mas "zero estrelas" não é um clique). */
export const RATING_STEPS = [1, 2, 3, 4, 5] as const

const oneDecimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** "4,3" */
export function formatRating(value: number): string {
  return oneDecimal.format(value)
}

/** "1 avaliação", "1.204 avaliações" */
export function ratingCountLabel(count: number): string {
  return count === 1 ? '1 avaliação' : `${count.toLocaleString('pt-BR')} avaliações`
}

/** Texto para leitor de tela: "Nota média 4,3 de 5, 12 avaliações". */
export function ratingSpeech(average: number, count: number): string {
  return `Nota média ${formatRating(average)} de ${RATING_MAX}, ${ratingCountLabel(count)}`
}

/** Estrelas cheias para uma nota da API (pode vir fracionada): arredonda e limita a 0..5. */
export function starsFor(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(RATING_MAX, Math.max(0, Math.round(value)))
}

/** A média só aparece quando o Catalog já mandou os campos e alguém avaliou. */
export function hasAverage(average: number | null | undefined, count: number | null | undefined): average is number {
  return typeof average === 'number' && typeof count === 'number' && count > 0
}

/** Troca a nota de um jogo no cache de /library, sem pedir a biblioteca de novo (o Kong limita /library). */
export function withRating(items: UserLibraryItemResponse[], gameId: string, rating: number): UserLibraryItemResponse[] {
  return items.map((item) => (item.gameId === gameId ? { ...item, rating } : item))
}
