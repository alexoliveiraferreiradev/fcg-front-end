import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { register } from '../api/auth'
import { ApiError, isRateLimit } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { pendingAdd, useCart } from '../cart/CartContext'
import { useToast } from '../components/Toast'
import { AlertIcon } from '../components/Icons'
import './SignIn.css'

type Tab = 'entrar' | 'cadastrar'

/** Só caminhos internos: evita redirecionar para outro site via ?voltar=. */
function safeReturn(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string[]
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode
}) {
  const id = useId()
  const errId = `${id}-err`
  return (
    <div className={`field${error?.length ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': error?.length ? true : undefined, 'aria-describedby': error?.length ? errId : undefined })}
      {error?.length ? (
        <p id={errId} className="field__error">
          {error.join(' ')}
        </p>
      ) : null}
    </div>
  )
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="notice notice--error" role="alert">
      <AlertIcon />
      <div>{message}</div>
    </div>
  )
}

function describe(e: unknown, fallback: string): string {
  if (isRateLimit(e)) return e.message
  if (e instanceof ApiError) return e.message || fallback
  return fallback
}

export function SignIn() {
  const { user, login } = useAuth()
  const cart = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const back = safeReturn(params.get('voltar'))

  const [tab, setTab] = useState<Tab>(params.get('aba') === 'cadastrar' ? 'cadastrar' : 'entrar')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (user && !busy) return <Navigate to={back} replace />

  const switchTab = (t: Tab) => {
    setTab(t)
    setFormError(null)
    setFieldErrors({})
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    setFieldErrors({})
    try {
      const session = await login(email.trim(), password)
      const pending = pendingAdd.take()
      if (pending && session.perfilUser === 'Player') {
        cart.add(pending)
        toast.show({ tone: 'success', title: 'Adicionado ao carrinho', text: pending.name })
      } else if (pending) {
        toast.show({ tone: 'info', title: 'Admin não compra jogos', text: `${pending.name} não foi para o carrinho.` })
      }
      navigate(back, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setFormError('E-mail ou senha inválidos.')
      else if (err instanceof ApiError && err.status === 400) {
        setFieldErrors(err.fieldErrors)
        setFormError(Object.keys(err.fieldErrors).length ? null : err.message)
      } else setFormError(describe(err, 'Não foi possível entrar agora.'))
    } finally {
      setBusy(false)
    }
  }

  const onRegister = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    setFieldErrors({})
    try {
      await register({ name: name.trim(), email: email.trim(), password, confirmPassword })
      toast.show({
        tone: 'success',
        title: 'Cadastro efetuado',
        text: 'Um e-mail de boas-vindas foi enviado (simulado). Agora é só entrar.',
      })
      setPassword('')
      setConfirmPassword('')
      switchTab('entrar')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setFieldErrors({ email: ['Este e-mail já está cadastrado.'] })
      else if (err instanceof ApiError && err.status === 400) {
        setFieldErrors(err.fieldErrors)
        setFormError(Object.keys(err.fieldErrors).length ? null : err.message)
      } else setFormError(describe(err, 'Não foi possível cadastrar agora.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="signin container">
      <div className="signin__card">
        <h1 className="section-title">{tab === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>
        {back !== '/' && tab === 'entrar' && (
          <p className="signin__hint">Entre para continuar de onde parou.</p>
        )}

        <div className="tabs" role="tablist" aria-label="Acesso">
          <button type="button" role="tab" aria-selected={tab === 'entrar'} onClick={() => switchTab('entrar')}>
            Entrar
          </button>
          <button type="button" role="tab" aria-selected={tab === 'cadastrar'} onClick={() => switchTab('cadastrar')}>
            Cadastrar
          </button>
        </div>

        {tab === 'entrar' ? (
          <form className="form" onSubmit={onLogin} noValidate>
            <FormError message={formError} />
            <Field label="E-mail" error={fieldErrors.email}>
              {(p) => (
                <input {...p} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              )}
            </Field>
            <Field label="Senha" error={fieldErrors.password}>
              {(p) => (
                <input
                  {...p}
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>
            <button type="submit" className="btn btn--block" disabled={busy || !email || !password}>
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={onRegister} noValidate>
            <FormError message={formError} />
            <Field label="Nome" error={fieldErrors.name}>
              {(p) => <input {...p} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />}
            </Field>
            <Field label="E-mail" error={fieldErrors.email}>
              {(p) => (
                <input {...p} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              )}
            </Field>
            <Field label="Senha" error={fieldErrors.password}>
              {(p) => (
                <input
                  {...p}
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>
            <Field label="Confirmar senha" error={fieldErrors.confirmPassword}>
              {(p) => (
                <input
                  {...p}
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}
            </Field>
            <button type="submit" className="btn btn--block" disabled={busy || !name || !email || !password || !confirmPassword}>
              {busy ? 'Cadastrando…' : 'Criar conta'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
