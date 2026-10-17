import { isRateLimit } from '../api/client'
import { AlertIcon, ClockIcon, RetryIcon } from './Icons'

/** Aviso de falha de uma consulta: 429 do Kong (com nova tentativa automática) ou erro com botão de tentar de novo. */
export function QueryProblem({ error, retrying, onRetry }: { error: unknown; retrying: boolean; onRetry: () => void }) {
  if (isRateLimit(error)) {
    return (
      <div className="notice notice--warn" role="status">
        <ClockIcon />
        <div>
          <strong>Limite do gateway atingido</strong>
          {error.message} {retrying ? 'Tentando de novo em instantes.' : ''}
        </div>
      </div>
    )
  }
  return (
    <div className="notice notice--error" role="alert">
      <AlertIcon />
      <div>
        <strong>Não deu para carregar</strong>
        {(error as Error).message}
        <div className="notice__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>
            <RetryIcon /> Tentar de novo
          </button>
        </div>
      </div>
    </div>
  )
}
