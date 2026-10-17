import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertIcon, CheckIcon, CloseIcon } from './Icons'
import './Toast.css'

// Avisos que espelham os e-mails simulados da Notification Function ("Cadastro efetuado", "Pedido aprovado"...).

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastInput {
  tone: ToastTone
  title: string
  text?: string
  /** ms; padrão 6000. */
  duration?: number
}

interface ToastItem extends ToastInput {
  id: number
  /** Animando a saída (0.2s no CSS); sai da lista logo depois. */
  leaving?: boolean
}

interface ToastValue {
  show: (t: ToastInput) => void
}

const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 200)
  }, [])

  const show = useCallback(
    (t: ToastInput) => {
      const id = nextId.current++
      setItems((list) => [...list.slice(-3), { ...t, id }])
      window.setTimeout(() => dismiss(id), t.duration ?? 6000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="region" aria-label="Avisos" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.tone}${t.leaving ? ' toast--leaving' : ''}`}
            role={t.tone === 'error' ? 'alert' : 'status'}
          >
            <span className="toast__mark">{t.tone === 'error' ? <AlertIcon /> : <CheckIcon />}</span>
            <div className="toast__body">
              <strong>{t.title}</strong>
              {t.text && <span>{t.text}</span>}
            </div>
            <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Fechar aviso">
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast fora do ToastProvider')
  return ctx
}
