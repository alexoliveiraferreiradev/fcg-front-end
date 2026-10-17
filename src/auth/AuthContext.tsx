import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { bindSession } from '../api/client'
import { signIn } from '../api/auth'
import type { LoginResponse } from '../api/types'
import { jwtClaim } from '../lib/jwt'
import { readJson, writeJson } from '../lib/storage'
import { useToast } from '../components/Toast'

const KEY = 'fcg.session'

interface StoredSession extends LoginResponse {
  /** epoch ms */
  expiresAt: number
  /** Nome para exibir: claim unique_name do token, atualizado quando a pessoa troca o nome em Minha conta. */
  name: string
}

interface AuthValue {
  user: StoredSession | null
  isAdmin: boolean
  isPlayer: boolean
  login: (email: string, password: string) => Promise<StoredSession>
  logout: () => void
  /** O token continua com o nome antigo; a sessão guarda o novo para o cabeçalho. */
  updateName: (name: string) => void
}

const AuthContext = createContext<AuthValue | null>(null)

function loadSession(): StoredSession | null {
  const s = readJson<StoredSession>(KEY)
  if (!s || s.expiresAt <= Date.now()) return null
  // Sessões gravadas antes do campo name existir.
  return s.name ? s : { ...s, name: jwtClaim(s.acessToken, 'unique_name') ?? s.email }
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

  // A navegação do React Router roda em transição; limpar a sessão na mesma transição evita que a página
  // protegida em que a pessoa estava renderize sem usuário e a mande para /entrar antes de chegar em /.
  const logout = useCallback(() => {
    navigate('/')
    startTransition(clear)
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
      const session: StoredSession = {
        ...res,
        expiresAt: Date.now() + res.expiresIn * 1000,
        name: jwtClaim(res.acessToken, 'unique_name') ?? res.email,
      }
      writeJson(KEY, session)
      queryClient.removeQueries({ queryKey: ['me'] })
      setUser(session)
      return session
    },
    [queryClient],
  )

  const updateName = useCallback((name: string) => {
    setUser((current) => {
      if (!current) return current
      const next = { ...current, name }
      writeJson(KEY, next)
      return next
    })
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAdmin: user?.perfilUser === 'Admin',
      isPlayer: user?.perfilUser === 'Player',
      login,
      logout,
      updateName,
    }),
    [user, login, logout, updateName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
