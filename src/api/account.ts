import { request } from './client'
import type { UpdateAccountRequest, UserAccountResponse } from './types'

// Rota /my-account/ do Kong (10 req/min por usuário). O Kong casa o prefixo com a barra final.

export function getMyAccount(signal?: AbortSignal) {
  return request<UserAccountResponse>('/my-account/', { signal })
}

/** Devolve o nome e o e-mail atualizados. */
export function updateMyAccount(body: UpdateAccountRequest) {
  return request<UserAccountResponse>('/my-account/update', { method: 'PUT', body })
}

export function deactivateMyAccount() {
  return request<void>('/my-account/deactivate-account', { method: 'PUT' })
}
