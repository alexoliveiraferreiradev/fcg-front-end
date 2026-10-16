import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readJson, writeJson } from '../lib/storage'

const KEY = 'fcg.cart'
const PENDING_KEY = 'fcg.cart.pending'

export interface CartItem {
  id: string
  name: string
  price: number
  coverUrl: string | null
}

interface CartValue {
  items: CartItem[]
  count: number
  total: number
  has: (id: string) => boolean
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
  /** Incrementa a cada adição; o cabeçalho usa para animar o contador. */
  bumps: number
}

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readJson<CartItem[]>(KEY) ?? [])
  const [bumps, setBumps] = useState(0)

  useEffect(() => writeJson(KEY, items), [items])

  // Outra aba mexeu no carrinho.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(readJson<CartItem[]>(KEY) ?? [])
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((item: CartItem) => {
    setItems((list) => (list.some((i) => i.id === item.id) ? list : [...list, item]))
    setBumps((n) => n + 1)
  }, [])

  const remove = useCallback((id: string) => setItems((list) => list.filter((i) => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.length,
      total: items.reduce((sum, i) => sum + i.price, 0),
      has: (id) => items.some((i) => i.id === id),
      add,
      remove,
      clear,
      bumps,
    }),
    [items, add, remove, clear, bumps],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart fora do CartProvider')
  return ctx
}

// Visitante deslogado clicou "+ Carrinho": o jogo espera aqui até o login terminar.
export const pendingAdd = {
  set: (item: CartItem) => writeJson(PENDING_KEY, item, sessionStorage),
  take: (): CartItem | null => {
    const item = readJson<CartItem>(PENDING_KEY, sessionStorage)
    writeJson(PENDING_KEY, null, sessionStorage)
    return item
  },
}
