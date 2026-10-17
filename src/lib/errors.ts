import { ApiError, isRateLimit } from '../api/client'

/** Mensagem para o usuário: a do Kong no 429, a da API quando houver. */
export function describe(e: unknown, fallback: string): string {
  if (isRateLimit(e)) return e.message
  if (e instanceof ApiError) return e.message || fallback
  return fallback
}
