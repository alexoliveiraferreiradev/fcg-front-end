import { useState, type FormEvent } from 'react'
import type { LibraryGame } from '../lib/library'
import { describe } from '../lib/errors'
import { formatRating, RATING_MAX, RATING_STEPS, starsFor } from '../lib/rating'
import { useRateGame } from '../lib/useRateGame'
import { CheckIcon, StarIcon } from './Icons'
import './Rating.css'

/** "4" para nota inteira, "3,5" quando a API devolveu fracionada. */
const ratingText = (value: number) => (Number.isInteger(value) ? String(value) : formatRating(value))

const starLabel = (n: number) => `${n} de ${RATING_MAX} ${n === 1 ? 'estrela' : 'estrelas'}`

/**
 * Avaliação do Player no painel da biblioteca. Rádios nativos (setas trocam a nota) e um botão para salvar:
 * salvar a cada seta mandaria vários PUTs para uma rota com limite no Kong.
 * Use com key={game.id} para zerar o rascunho ao trocar de jogo.
 */
export function RateGame({ game }: { game: LibraryGame }) {
  const [value, setValue] = useState(() => starsFor(game.rating))
  const [hover, setHover] = useState(0)
  const rate = useRateGame()

  const shown = hover || value
  const dirty = value > 0 && value !== game.rating
  const justSaved = rate.isSuccess && !dirty

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!dirty || rate.isPending) return
    rate.mutate({ gameId: game.id, rating: value })
  }

  let hint: string
  if (rate.isPending) hint = 'Salvando sua nota…'
  else if (justSaved) hint = 'Nota salva. A média do catálogo atualiza em instantes.'
  else if (game.rating === null) hint = value ? `Sua nota: ${starLabel(value)}.` : 'Você ainda não avaliou este jogo.'
  else if (dirty) hint = `Nota atual: ${ratingText(game.rating)}. Salve para trocar por ${value}.`
  else hint = `Sua nota: ${ratingText(game.rating)} de ${RATING_MAX}.`

  return (
    <form className="rate" onSubmit={submit}>
      <fieldset className="rate__field" disabled={rate.isPending}>
        <legend className="rate__legend">Sua avaliação</legend>
        <div className="rate__row">
          <div className="rate__stars" onMouseLeave={() => setHover(0)}>
            {RATING_STEPS.map((n) => (
              <label key={n} className={`rate__star${n <= shown ? ' rate__star--on' : ''}`} onMouseEnter={() => setHover(n)}>
                <input
                  type="radio"
                  className="sr-only"
                  name={`rating-${game.id}`}
                  value={n}
                  checked={value === n}
                  onChange={() => {
                    // Setas do teclado: a prévia do mouse não pode esconder a nota escolhida.
                    setValue(n)
                    setHover(0)
                  }}
                />
                <StarIcon fill={n <= shown ? 'currentColor' : 'none'} />
                <span className="sr-only">{starLabel(n)}</span>
              </label>
            ))}
          </div>
          <button type="submit" className="btn btn--outline btn--sm" disabled={!dirty || rate.isPending}>
            {rate.isPending ? 'Salvando…' : game.rating === null ? 'Avaliar' : 'Trocar nota'}
          </button>
        </div>
      </fieldset>

      <p className={`rate__hint${justSaved ? ' rate__hint--ok' : ''}`} role="status">
        {justSaved && <CheckIcon />}
        {hint}
      </p>
      {rate.isError && (
        <p className="rate__error" role="alert">
          {describe(rate.error, 'Não foi possível salvar a nota. Tente de novo.')}
        </p>
      )}
    </form>
  )
}
