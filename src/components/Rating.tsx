import { formatRating, hasAverage, RATING_MAX, ratingCountLabel, ratingSpeech, starsFor } from '../lib/rating'
import { StarIcon } from './Icons'
import './Rating.css'

/** Cinco estrelas, cheias até a nota arredondada. Decorativas: quem usa escreve o texto para leitor de tela. */
export function Stars({ value, className = '' }: { value: number | null; className?: string }) {
  const filled = starsFor(value)
  return (
    <span className={`stars ${className}`} aria-hidden="true">
      {Array.from({ length: RATING_MAX }, (_, i) => (
        <StarIcon key={i} className={i < filled ? 'stars__on' : 'stars__off'} fill={i < filled ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

/** Média compacta do card: "★ 4,3 (12)". Nada enquanto ninguém avaliou. */
export function RatingAverage({ average, count }: { average: number | null; count: number | null }) {
  if (count === null || !hasAverage(average, count)) return null
  return (
    <p className="rating-avg">
      <span className="sr-only">{ratingSpeech(average, count)}</span>
      <StarIcon className="rating-avg__star" fill="currentColor" />
      <span aria-hidden="true">{formatRating(average)}</span>
      <span className="rating-avg__count" aria-hidden="true">
        ({count.toLocaleString('pt-BR')})
      </span>
    </p>
  )
}

/** Média do painel: estrelas, nota e quantidade. Não diz "sem avaliações" quando a resposta não informou (Catalog antes da avaliação). */
export function RatingSummary({ average, count }: { average: number | null; count: number | null }) {
  if (count === null) return null
  if (!hasAverage(average, count)) {
    return <p className="rating-summary rating-summary--empty">Ainda sem avaliações</p>
  }
  return (
    <p className="rating-summary">
      <span className="sr-only">{ratingSpeech(average, count)}</span>
      <Stars value={average} />
      <strong className="rating-summary__value" aria-hidden="true">
        {formatRating(average)}
      </strong>
      <span className="rating-summary__count" aria-hidden="true">
        {ratingCountLabel(count)}
      </span>
    </p>
  )
}
