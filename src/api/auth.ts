import { request } from './client'
import type { LoginResponse, RegisterUserCommand } from './types'

export function signIn(email: string, password: string) {
  return request<LoginResponse>('/user/sign-in', { method: 'POST', body: { email, password }, auth: false })
}

export function register(command: RegisterUserCommand) {
  return request<void>('/user/register', { method: 'POST', body: command, auth: false })
}
