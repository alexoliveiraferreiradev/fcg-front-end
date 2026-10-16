import { GAME_GENRES, type GameGenre } from '../api/types'
import { genreLabel } from '../lib/game'
import './GenreFilter.css'

interface Props {
  value: GameGenre | undefined
  onChange: (genre: GameGenre | undefined) => void
}

export function GenreFilter({ value, onChange }: Props) {
  const options: (GameGenre | undefined)[] = [undefined, ...GAME_GENRES]
  return (
    <div className="genres" role="group" aria-label="Filtrar por gênero">
      {options.map((g) => (
        <button
          key={g ?? 'all'}
          type="button"
          className="genres__pill"
          aria-pressed={value === g}
          onClick={() => onChange(g)}
        >
          {g ? genreLabel(g) : 'Todos'}
        </button>
      ))}
    </div>
  )
}
