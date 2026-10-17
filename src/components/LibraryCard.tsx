import type { LibraryGame } from '../lib/library'
import { genreLabel } from '../lib/game'
import { formatDate } from '../lib/format'
import { GameCover } from './GameCover'
import './GameCard.css'

interface Props {
  game: LibraryGame
  onOpen: (game: LibraryGame) => void
  /** Capas ainda carregando: mostra o shimmer no lugar do placeholder. */
  coverPending?: boolean
  eager?: boolean
}

export function LibraryCard({ game, onOpen, coverPending, eager }: Props) {
  return (
    <article className="game-card">
      <div className={`game-card__cover${coverPending ? ' skeleton' : ''}`}>
        {!coverPending && <GameCover name={game.name} coverUrl={game.coverUrl} eager={eager} />}
      </div>
      <div className="game-card__body">
        <h3 className="game-card__name">
          {/* O botão do nome cobre o card inteiro. */}
          <button type="button" className="game-card__open" onClick={() => onOpen(game)}>
            {game.name}
          </button>
        </h3>
        <p className="game-card__genre">{genreLabel(game.genre)}</p>
        <p className="game-card__acquired">
          Adquirido em <time dateTime={game.acquiredAt}>{formatDate(game.acquiredAt)}</time>
        </p>
      </div>
    </article>
  )
}
