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

const GENRE_LABELS: Record<GameGenre, string> = {
  Acao: 'Ação',
  Aventura: 'Aventura',
  Estrategia: 'Estratégia',
  RPG: 'RPG',
  Esporte: 'Esporte',
  Simulacao: 'Simulação',
  QuebraCabeca: 'Quebra-cabeça',
  Terror: 'Terror',
  Luta: 'Luta',
  FPS: 'FPS',
  MundoAberto: 'Mundo aberto',
  Plataforma: 'Plataforma',
  Corrida: 'Corrida',
  Indie: 'Indie',
  Esportes: 'Esportes',
  Roguelike: 'Roguelike',
  MOBA: 'MOBA',
  Battle_Royale: 'Battle Royale',
  Metroidvania: 'Metroidvania',
  Soulslike: 'Soulslike',
}

/**
 * Nomes em inglês de antes da troca no Catalog. A UserLibrary guarda o gênero da compra como texto,
 * então itens antigos da biblioteca (e links antigos com ?genero=) ainda chegam assim.
 */
const LEGACY_GENRES: Record<string, GameGenre> = {
  Action: 'Acao',
  Adventure: 'Aventura',
  Strategy: 'Estrategia',
  Sport: 'Esporte',
  Simulation: 'Simulacao',
  Puzzle: 'QuebraCabeca',
  Horror: 'Terror',
  Fighting: 'Luta',
  OpenWorld: 'MundoAberto',
  Platformer: 'Plataforma',
  Racing: 'Corrida',
  Sports: 'Esportes',
}

const isGenre = (value: string): value is GameGenre => Object.hasOwn(GENRE_LABELS, value)

/** Chave atual do gênero, aceitando o nome antigo em inglês; undefined para o que não é gênero. */
export function toGenre(value: string | null | undefined): GameGenre | undefined {
  if (!value) return undefined
  if (isGenre(value)) return value
  // hasOwn: o valor vem da URL, e "constructor" acharia o Object.prototype.
  return Object.hasOwn(LEGACY_GENRES, value) ? LEGACY_GENRES[value] : undefined
}

/** "MundoAberto" → "Mundo aberto"; o nome antigo também ("OpenWorld" → "Mundo aberto"). Desconhecido: o texto sem "_". */
export function genreLabel(genre: string): string {
  const key = toGenre(genre)
  return key ? GENRE_LABELS[key] : genre.replace(/_/g, ' ')
}
