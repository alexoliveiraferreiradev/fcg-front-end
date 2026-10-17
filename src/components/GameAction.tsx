import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { pendingAdd, useCart, type CartItem } from '../cart/CartContext'
import { useOwnedGames } from '../lib/useOwnedGames'
import type { GameView } from '../lib/game'
import { CartIcon, CheckIcon, PlusIcon } from './Icons'

export type GameActionState = 'none' | 'owned' | 'in-cart' | 'add'

/** O que o visitante pode fazer com um jogo: Admin não compra; Player vê se já tem ou já pôs no carrinho. */
export function useGameAction(game: GameView) {
  const { user, isAdmin } = useAuth()
  const owned = useOwnedGames()
  const cart = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  let state: GameActionState = 'add'
  if (isAdmin || !game.id) state = 'none'
  else if (owned.has(game.id)) state = 'owned'
  else if (cart.has(game.id)) state = 'in-cart'

  const add = () => {
    if (!game.id) return
    const item: CartItem = { id: game.id, name: game.name, price: game.currentPrice, coverUrl: game.coverUrl }
    if (!user) {
      pendingAdd.set(item)
      navigate(`/entrar?voltar=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    cart.add(item)
  }

  return { state, add }
}

interface Props {
  game: GameView
  size?: 'sm' | 'md'
  block?: boolean
  /** Ghost no grid do catálogo, para o rosa ficar só nas promoções e no painel. */
  tone?: 'outline' | 'ghost'
}

export function GameAction({ game, size = 'sm', block = false, tone = 'outline' }: Props) {
  const { state, add } = useGameAction(game)
  const cls = `${size === 'sm' ? ' btn--sm' : ''}${block ? ' btn--block' : ''}`

  switch (state) {
    case 'none':
      return null
    case 'owned':
      return (
        <span className="state-chip state-chip--owned">
          <CheckIcon /> Na biblioteca
        </span>
      )
    case 'in-cart':
      return (
        <Link to="/carrinho" className={`state-chip state-chip--cart${block ? ' state-chip--block' : ''}`}>
          <CartIcon /> No carrinho
        </Link>
      )
    case 'add':
      return (
        <button type="button" className={`btn btn--${tone}${cls}`} onClick={add} aria-label={`Adicionar ${game.name} ao carrinho`}>
          <PlusIcon /> Carrinho
        </button>
      )
  }
}
