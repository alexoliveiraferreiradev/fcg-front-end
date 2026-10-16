import { ApiError, isRateLimit } from '../api/client'

/** 429 espera o balde do Kong esvaziar; demais falhas tentam de novo rápido. */
export function retryDelay(attempt: number, error: unknown): number {
  if (isRateLimit(error)) return 20_000
  return Math.min(1000 * 2 ** attempt, 8000)
}

/** Repete 429 e falhas de rede/servidor; não repete 4xx de cliente. */
export function retryUnlessClientError(failureCount: number, error: unknown): boolean {
  if (isRateLimit(error)) return failureCount < 6
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}
