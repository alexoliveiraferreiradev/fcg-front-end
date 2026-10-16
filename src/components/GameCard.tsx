import type { GameView } from '../lib/game'
import { genreLabel } from '../lib/game'
import { GameCover } from './GameCover'
import { GameAction } from './GameAction'
import { Price } from './Price'
import './GameCard.css'

interface Props {
  game: GameView
  onOpen: (game: GameView) => void
  eager?: boolean
}

export function GameCard({ game, onOpen, eager }: Props) {
  return (
    <article className="game-card">
      <div className="game-card__cover">
        <GameCover name={game.name} coverUrl={game.coverUrl} eager={eager} />
        {game.discount !== null && <span className="discount-tag game-card__tag">-{game.discount}%</span>}
      </div>
      <div className="game-card__body">
        <h3 className="game-card__name">
          {/* O botão do nome cobre o card inteiro; o botão de carrinho fica acima dele. */}
          <button type="button" className="game-card__open" onClick={() => onOpen(game)}>
            {game.name}
          </button>
        </h3>
        <p className="game-card__genre">{genreLabel(game.genre)}</p>
        <div className="game-card__row">
          <Price current={game.currentPrice} original={game.originalPrice} />
          <div className="game-card__action">
            <GameAction game={game} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function GameCardSkeleton() {
  return (
    <div className="game-card game-card--skeleton" aria-hidden="true">
      <div className="game-card__cover skeleton" />
      <div className="game-card__body">
        <div className="skeleton skeleton--line" style={{ width: '75%' }} />
        <div className="skeleton skeleton--line" style={{ width: '40%', height: 10 }} />
        <div className="skeleton skeleton--line" style={{ width: '55%', marginTop: 'auto' }} />
      </div>
    </div>
  )
}
