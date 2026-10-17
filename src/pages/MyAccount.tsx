import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deactivateMyAccount, getMyAccount, updateMyAccount } from '../api/account'
import { ApiError } from '../api/client'
import type { UserAccountResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PASSWORD_RULES, validateAccountForm } from '../lib/account'
import { retryDelay, retryUnlessClientError } from '../lib/queryPolicy'
import { Field, FormError } from '../components/Form'
import { describe } from '../lib/errors'
import { QueryProblem } from '../components/QueryProblem'
import { useToast } from '../components/Toast'
import { AlertIcon, CheckIcon, CloseIcon, LockIcon, UserIcon } from '../components/Icons'
import './MyAccount.css'

/** Minha conta: dados do usuário logado, troca de nome e senha e desativação da própria conta. */
export function MyAccount() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/entrar?voltar=%2Fconta" replace />
  return <Account />
}

function Account() {
  const { user, logout } = useAuth()
  const accountKey = ['me', 'account', user?.id]

  // /my-account/ tem 10 req/min por usuário: sem refetch ao focar a janela.
  const account = useQuery({
    queryKey: accountKey,
    queryFn: ({ signal }) => getMyAccount(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: retryUnlessClientError,
    retryDelay,
  })

  const notFound = account.error instanceof ApiError && account.error.status === 404

  return (
    <main className="account container">
      <h1 className="section-title">Minha conta</h1>

      <section className="account__panel" aria-labelledby="account-data">
        <h2 id="account-data" className="account__title">
          Seus dados
        </h2>
        {account.isPending && (
          <div className="account__skeleton" aria-busy="true">
            <div className="skeleton skeleton--line" style={{ width: '45%' }} />
            <div className="skeleton skeleton--line" style={{ width: '60%' }} />
          </div>
        )}
        {notFound ? (
          <div className="notice notice--error" role="alert">
            <AlertIcon />
            <div>
              <strong>Conta não encontrada</strong>
              Esta sessão aponta para um usuário que não existe mais. Entre de novo com outra conta.
              <div className="notice__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                  Sair
                </button>
              </div>
            </div>
          </div>
        ) : (
          account.isError && <QueryProblem error={account.error} retrying={account.isFetching} onRetry={() => account.refetch()} />
        )}
        {account.data && (
          <dl className="account__data">
            <div>
              <dt>Nome</dt>
              <dd>{account.data.name}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{account.data.email}</dd>
            </div>
          </dl>
        )}
      </section>

      {account.data && <UpdateForm account={account.data} queryKey={accountKey} />}

      <DeactivateSection />
    </main>
  )
}

function UpdateForm({ account, queryKey }: { account: UserAccountResponse; queryKey: unknown[] }) {
  const queryClient = useQueryClient()
  const { updateName } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(account.name)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const errors = validateAccountForm({ name, password, confirmPassword })
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setBusy(true)
    try {
      const updated = await updateMyAccount({ name: name.trim(), password, confirmPassword })
      queryClient.setQueryData(queryKey, updated)
      updateName(updated.name)
      setPassword('')
      setConfirmPassword('')
      toast.show({ tone: 'success', title: 'Dados atualizados', text: 'Use a nova senha no próximo login.' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && Object.keys(err.fieldErrors).length) setFieldErrors(err.fieldErrors)
      else setFormError(describe(err, 'Não foi possível atualizar agora.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="account__panel" aria-labelledby="account-update">
      <h2 id="account-update" className="account__title">
        Alterar nome e senha
      </h2>
      <p className="account__hint">A API pede o nome junto com a senha nova, mesmo quando só a senha muda.</p>
      <form className="form" onSubmit={onSubmit} noValidate>
        <FormError message={formError} />
        <Field label="Nome" icon={<UserIcon />} error={fieldErrors.name}>
          {(p) => <input {...p} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="Nova senha" icon={<LockIcon />} error={fieldErrors.password}>
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
        <ul className="rules" aria-label="Regras da senha">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(password)
            return (
              <li key={rule.id} className={ok ? 'rules__item rules__item--ok' : 'rules__item'}>
                {ok ? <CheckIcon /> : <CloseIcon />}
                <span>{rule.label}</span>
                <span className="sr-only">{ok ? '(atendida)' : '(pendente)'}</span>
              </li>
            )
          })}
        </ul>
        <Field label="Confirmar nova senha" icon={<LockIcon />} error={fieldErrors.confirmPassword}>
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
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </section>
  )
}

function DeactivateSection() {
  const { logout } = useAuth()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDeactivate = async () => {
    setBusy(true)
    setError(null)
    try {
      await deactivateMyAccount()
      toast.show({ tone: 'info', title: 'Conta desativada', text: 'Para voltar a usar, peça a um Admin que reative a conta.' })
      logout()
    } catch (err) {
      setError(describe(err, 'Não foi possível desativar a conta agora.'))
      setBusy(false)
    }
  }

  return (
    <section className="account__panel account__panel--danger" aria-labelledby="account-deactivate">
      <h2 id="account-deactivate" className="account__title">
        Desativar conta
      </h2>
      <p className="account__hint">
        Você sai na hora e não consegue mais entrar. Seus jogos e pedidos continuam guardados, e só um Admin pode reativar a conta.
      </p>
      <FormError message={error} />
      {confirming ? (
        <div className="account__confirm" role="group" aria-label="Confirmar desativação">
          <p>Tem certeza? Esta ação encerra a sua sessão.</p>
          <div className="account__actions">
            <button type="button" className="btn btn--danger" onClick={onDeactivate} disabled={busy}>
              {busy ? 'Desativando…' : 'Desativar minha conta'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)} disabled={busy}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="account__actions">
          <button type="button" className="btn btn--danger-outline" onClick={() => setConfirming(true)}>
            Desativar conta…
          </button>
        </div>
      )}
    </section>
  )
}
