import { useState } from 'react'
import { GAME_GENRES, type GameGenre } from '../api/types'
import { genreLabel } from '../lib/game'
import './GenreFilter.css'

/** Gêneros sempre visíveis no desktop; o resto fica atrás de "Mais gêneros". */
const VISIBLE_COUNT = 8

interface Props {
  value: GameGenre | undefined
  onChange: (genre: GameGenre | undefined) => void
}

export function GenreFilter({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  const options: (GameGenre | undefined)[] = [undefined, ...GAME_GENRES]
  const hidden = GAME_GENRES.slice(VISIBLE_COUNT).filter((g) => g !== value).length

  return (
    <div className={`genres${expanded ? ' genres--expanded' : ''}`} role="group" aria-label="Filtrar por gênero">
      {options.map((g, i) => {
        // O gênero selecionado nunca some, mesmo sendo um dos escondidos.
        const extra = i > VISIBLE_COUNT && value !== g
        return (
          <button
            key={g ?? 'all'}
            type="button"
            className={`genres__pill${extra ? ' genres__pill--extra' : ''}`}
            aria-pressed={value === g}
            onClick={() => onChange(g)}
          >
            {g ? genreLabel(g) : 'Todos'}
          </button>
        )
      })}
      <button type="button" className="genres__more" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
        {expanded ? 'Menos gêneros' : `Mais gêneros (${hidden})`}
      </button>
    </div>
  )
}
