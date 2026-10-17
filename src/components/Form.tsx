import { useId, type ReactNode } from 'react'
import { AlertIcon } from './Icons'
import './Form.css'

/** Campo com rótulo e erro ligado por aria-describedby; o input vem por render prop. `icon` aparece à esquerda, dentro do campo. */
export function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string
  error?: string[]
  icon?: ReactNode
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode
}) {
  const id = useId()
  const errId = `${id}-err`
  return (
    <div className={`field${error?.length ? ' field--error' : ''}${icon ? ' field--icon' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field__control">
        {icon && <span className="field__icon">{icon}</span>}
        {children({ id, 'aria-invalid': error?.length ? true : undefined, 'aria-describedby': error?.length ? errId : undefined })}
      </div>
      {error?.length ? (
        <p id={errId} className="field__error">
          {error.join(' ')}
        </p>
      ) : null}
    </div>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="notice notice--error" role="alert">
      <AlertIcon />
      <div>{message}</div>
    </div>
  )
}
