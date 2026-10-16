import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, RateLimitError, bindSession, buildUrl, request } from './client'

function mockFetch(status: number, body?: unknown) {
  const text = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)
  const fn = vi.fn(async () => new Response(text, { status }))
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
  bindSession(null, () => {})
})

describe('buildUrl', () => {
  it('prefixa /api e ignora parâmetros vazios', () => {
    expect(buildUrl('/catalog/games', { genre: undefined, page: 2, pageSize: 12 })).toBe('/api/catalog/games?page=2&pageSize=12')
  })
  it('repete a chave para listas', () => {
    expect(buildUrl('/x', { ids: ['a', 'b'] })).toBe('/api/x?ids=a&ids=b')
  })
})

describe('request', () => {
  it('envia o Bearer quando há sessão', async () => {
    const fetch = mockFetch(200, { ok: true })
    bindSession('tkn', () => {})
    await request('/library')
    const headers = (fetch.mock.calls[0] as unknown as [string, RequestInit])[1].headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tkn')
  })

  it('429 vira RateLimitError com a mensagem do Kong', async () => {
    mockFetch(429, { message: 'Você enviou muitos requests. Por favor tente mais tarde.' })
    await expect(request('/user/order')).rejects.toBeInstanceOf(RateLimitError)
    await expect(request('/user/order')).rejects.toThrow('Você enviou muitos requests')
  })

  it('401 com token limpa a sessão', async () => {
    mockFetch(401)
    const onUnauthorized = vi.fn()
    bindSession('tkn', onUnauthorized)
    await expect(request('/library')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('401 sem token (login errado) não mexe na sessão', async () => {
    mockFetch(401)
    const onUnauthorized = vi.fn()
    bindSession(null, onUnauthorized)
    await expect(request('/user/sign-in', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('400 de validação devolve erros por campo em camelCase', async () => {
    mockFetch(400, { title: 'Erro', errors: { ConfirmPassword: ['As senhas não conferem.'] } })
    const err = (await request('/user/register', { method: 'POST', body: {} }).catch((e) => e)) as ApiError
    expect(err.fieldErrors).toEqual({ confirmPassword: ['As senhas não conferem.'] })
  })

  it('resposta 200 sem corpo vira undefined', async () => {
    mockFetch(200)
    await expect(request('/user/order', { method: 'POST', body: [] })).resolves.toBeUndefined()
  })
})
