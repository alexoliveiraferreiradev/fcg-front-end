import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { bindSession } from '../api/client'
import { signIn } from '../api/auth'
import type { LoginResponse } from '../api/types'
import { readJson, writeJson } from '../lib/storage'
import { useToast } from '../components/Toast'

const KEY = 'fcg.session'

interface StoredSession extends LoginResponse {
  /** epoch ms */
  expiresAt: number
}

interface AuthValue {
  user: StoredSession | null
  isAdmin: boolean
  isPlayer: boolean
  login: (email: string, password: string) => Promise<StoredSession>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function loadSession(): StoredSession | null {
  const s = readJson<StoredSession>(KEY)
  return s && s.expiresAt > Date.now() ? s : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredSession | null>(loadSession)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()

  const clear = useCallback(() => {
    writeJson(KEY, null)
    setUser(null)
    queryClient.removeQueries({ queryKey: ['me'] })
  }, [queryClient])

  const logout = useCallback(() => {
    clear()
    navigate('/')
  }, [clear, navigate])

  const expire = useCallback(() => {
    clear()
    toast.show({ tone: 'error', title: 'Sessão expirada', text: 'Entre de novo para continuar.' })
    navigate('/entrar')
  }, [clear, navigate, toast])

  // Mantém o cliente HTTP com o token atual; precisa valer antes dos efeitos dos filhos.
  bindSession(user?.acessToken ?? null, expire)

  // Expira sozinho quando o prazo do token passar com a aba aberta.
  useEffect(() => {
    if (!user) return
    const ms = user.expiresAt - Date.now()
    const timer = window.setTimeout(expire, Math.max(ms, 0))
    return () => window.clearTimeout(timer)
  }, [user, expire])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await signIn(email, password)
      const session: StoredSession = { ...res, expiresAt: Date.now() + res.expiresIn * 1000 }
      writeJson(KEY, session)
      queryClient.removeQueries({ queryKey: ['me'] })
      setUser(session)
      return session
    },
    [queryClient],
  )

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAdmin: user?.perfilUser === 'Admin',
      isPlayer: user?.perfilUser === 'Player',
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
