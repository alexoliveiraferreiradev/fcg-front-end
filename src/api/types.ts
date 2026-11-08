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
  /** Média das notas (0 a 5, uma casa); null enquanto ninguém avaliou. Ausente antes da avaliação no Catalog. */
  averageRating?: number | null
  ratingCount?: number
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
  /** Média das notas (0 a 5, uma casa); null enquanto ninguém avaliou. Ausente antes da avaliação no Catalog. */
  averageRating?: number | null
  ratingCount?: number
}

/** GET /catalog/games/covers?ids=... (inclui jogos desativados) */
export interface GameCoverResponse {
  gameId: string
  name: string
  coverUrl: string | null
  /** false quando o jogo saiu da loja. Ausente em Catalog antigo. */
  isActive?: boolean
}

/** GET /library */
export interface UserLibraryItemResponse {
  gameId: string
  gameName: string
  description: string
  genre: string
  acquiredAt: string
  /** Nota do próprio Player (0 a 5); null enquanto ele não avaliou. Ausente antes da avaliação na UserLibrary. */
  rating?: number | null
}

/** PUT /library/{gameId}/rating: o jogo vem da rota e o usuário do token. */
export interface RateGameRequest {
  rating: number
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

/** GET /my-account/ (dados do próprio usuário; perfil e id ficam na sessão) */
export interface UserAccountResponse {
  name: string
  email: string
}

/** PUT /my-account/update: o back-end exige nome, senha e confirmação juntos. */
export interface UpdateAccountRequest {
  name: string
  password: string
  confirmPassword: string
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
