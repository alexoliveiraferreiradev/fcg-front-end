import type { GameGenre, GamePromotionResponse, GameUserResponse } from '../api/types'

/** Forma única que card, destaque e painel consomem, vinda do catálogo ou das promoções. */
export interface GameView {
  /** Ausente em promoções enquanto o Catalog não expõe `gameId` (Parte A). */
  id: string | null
  name: string
  description: string
  genre: GameGenre
  currentPrice: number
  /** Só quando há desconto e a API informou o preço original. */
  originalPrice: number | null
  /** Percentual inteiro, ex.: 40. */
  discount: number | null
  coverUrl: string | null
  endDate: string | null
  /** Média do Catalog (0 a 5); null sem avaliações ou quando a resposta não traz a média. */
  averageRating: number | null
  /** null quando a resposta não informa (Catalog antes da avaliação): a tela não diz "sem avaliações" sem saber. */
  ratingCount: number | null
}

export function discountPercent(original: number, current: number): number | null {
  if (!(original > 0) || current >= original) return null
  const pct = Math.round(((original - current) / original) * 100)
  return pct > 0 ? pct : null
}

export function fromCatalog(g: GameUserResponse): GameView {
  const original = g.hasDiscount && typeof g.originalPrice === 'number' ? g.originalPrice : null
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    genre: g.genre,
    currentPrice: g.currentPrice,
    originalPrice: original,
    discount: original === null ? null : discountPercent(original, g.currentPrice),
    coverUrl: g.coverUrl || null,
    endDate: null,
    averageRating: typeof g.averageRating === 'number' ? g.averageRating : null,
    ratingCount: typeof g.ratingCount === 'number' ? g.ratingCount : null,
  }
}

export function fromPromotion(p: GamePromotionResponse): GameView {
  const discount = p.discountPercentage > 0 ? Math.round(p.discountPercentage) : discountPercent(p.originalPrice, p.currentPrice)
  return {
    id: p.gameId ?? null,
    name: p.name,
    description: p.description,
    genre: p.genre,
    currentPrice: p.currentPrice,
    originalPrice: discount ? p.originalPrice : null,
    discount: discount || null,
    coverUrl: p.coverUrl || null,
    endDate: p.endDate ?? null,
    averageRating: typeof p.averageRating === 'number' ? p.averageRating : null,
    ratingCount: typeof p.ratingCount === 'number' ? p.ratingCount : null,
  }
}

/** Maior desconto primeiro; empate pelo fim mais próximo, depois pelo nome. */
export function sortPromotions(list: GameView[]): GameView[] {
  return [...list].sort(
    (a, b) =>
      (b.discount ?? 0) - (a.discount ?? 0) ||
      (a.endDate ?? '9999').localeCompare(b.endDate ?? '9999') ||
      a.name.localeCompare(b.name, 'pt-BR'),
  )
}

export function genreLabel(genre: string): string {
  if (genre === 'OpenWorld') return 'Open World'
  return genre.replace(/_/g, ' ')
}
