// Contratos das APIs vistos pelo Kong (fcg-openapi-gateway.json + código dos serviços).
// Campos marcados "Parte A" chegam com a mudança planejada no fcg-catalog-api;
// até lá vêm ausentes e o front degrada (sem capa, sem preço riscado).

export const GAME_GENRES = [
  'Action',
  'Adventure',
  'Strategy',
  'RPG',
  'Sport',
  'Simulation',
  'Puzzle',
  'Horror',
  'Fighting',
  'FPS',
  'OpenWorld',
  'Platformer',
  'Racing',
  'Indie',
  'Sports',
  'Roguelike',
  'MOBA',
  'Battle_Royale',
  'Metroidvania',
  'Soulslike',
] as const

export type GameGenre = (typeof GAME_GENRES)[number]

export type UserRole = 'Player' | 'Admin'

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/** GET /catalog/games */
export interface GameUserResponse {
  id: string
  name: string
  description: string
  currentPrice: number
  genre: GameGenre
  hasDiscount: boolean
  /** Parte A: hoje tem [JsonIgnore] no Catalog. */
  originalPrice?: number
  /** Parte A */
  coverUrl?: string | null
}

/** GET /catalog/games/promoted */
export interface GamePromotionResponse {
  promotionId: string
  name: string
  description: string
  originalPrice: number
  currentPrice: number
  genre: GameGenre
  discountPercentage: number
  /** Parte A */
  gameId?: string
  /** Parte A */
  endDate?: string
  /** Parte A */
  coverUrl?: string | null
}

/** GET /library */
export interface UserLibraryItemResponse {
  gameId: string
  gameName: string
  description: string
  genre: string
  acquiredAt: string
}

export interface ClaimResponse {
  type: string
  value: string
}

/** POST /user/sign-in. Atenção: `acessToken` com um "c" só. */
export interface LoginResponse {
  acessToken: string
  /** Segundos. */
  expiresIn: number
  id: string
  email: string
  claims: ClaimResponse[]
  perfilUser: UserRole
}

export interface RegisterUserCommand {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface HttpValidationProblemDetails {
  title?: string
  status?: number
  detail?: string
  errors?: Record<string, string[]>
}
