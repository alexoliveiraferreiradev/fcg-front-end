import type { HttpValidationProblemDetails } from './types'

const BASE = '/api'

export const KONG_RATE_LIMIT_MESSAGE = 'Você enviou muitos requests. Por favor tente mais tarde.'

export class ApiError extends Error {
  readonly status: number
  /** Erros por campo vindos de HttpValidationProblemDetails, com chave em minúsculas. */
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** HTTP 429 do Kong. */
export class RateLimitError extends ApiError {
  constructor(message: string) {
    super(429, message)
    this.name = 'RateLimitError'
  }
}

export const isRateLimit = (e: unknown): e is RateLimitError => e instanceof RateLimitError

interface Session {
  token: string | null
  onUnauthorized: () => void
}

// O AuthProvider registra aqui o token atual e o que fazer num 401 de rota protegida.
const session: Session = { token: null, onUnauthorized: () => {} }

export function bindSession(token: string | null, onUnauthorized: () => void) {
  session.token = token
  session.onUnauthorized = onUnauthorized
}

type Query = Record<string, string | number | string[] | undefined | null>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Query
  body?: unknown
  /** Envia o Bearer quando houver sessão. Padrão: true. */
  auth?: boolean
  signal?: AbortSignal
}

export function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
    else params.append(key, String(value))
  }
  const qs = params.toString()
  return `${BASE}${path}${qs ? `?${qs}` : ''}`
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function lowerKeys(errors: Record<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k.charAt(0).toLowerCase() + k.slice(1), v]))
}

function messageFrom(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) return body.replace(/^"|"$/g, '')
  if (body && typeof body === 'object') {
    const b = body as HttpValidationProblemDetails & { message?: string }
    return b.message ?? b.detail ?? b.title ?? fallback
  }
  return fallback
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, auth = true, signal } = opts
  const headers: Record<string, string> = { Accept: 'application/json' }
  const sentToken = auth && session.token ? session.token : null
  if (sentToken) headers.Authorization = `Bearer ${sentToken}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new ApiError(0, 'Não foi possível falar com o gateway. O Kong está rodando em localhost:8000?')
  }

  if (res.ok) return (await readBody(res)) as T

  const payload = await readBody(res)

  if (res.status === 429) throw new RateLimitError(messageFrom(payload, KONG_RATE_LIMIT_MESSAGE))

  if (res.status === 401 && sentToken) {
    session.onUnauthorized()
    throw new ApiError(401, 'Sua sessão expirou. Entre de novo.')
  }

  if (res.status === 400 && payload && typeof payload === 'object' && 'errors' in payload) {
    const p = payload as HttpValidationProblemDetails
    throw new ApiError(400, messageFrom(p, 'Confira os campos destacados.'), lowerKeys(p.errors ?? {}))
  }

  throw new ApiError(res.status, messageFrom(payload, `Erro ${res.status} ao chamar ${path}.`))
}
