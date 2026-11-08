import type { GameView } from '../lib/game'
import { genreLabel } from '../lib/game'
import { formatDayMonth } from '../lib/format'
import { GameCover } from './GameCover'
import { GameAction } from './GameAction'
import { Price } from './Price'
import { RatingAverage } from './Rating'
import { ClockIcon } from './Icons'
import './Promotions.css'

type Variant = 'lead' | 'side' | 'strip'

function PromoCard({ game, variant, onOpen }: { game: GameView; variant: Variant; onOpen: (g: GameView) => void }) {
  const until = game.endDate ? formatDayMonth(game.endDate) : ''
  return (
    <article className={`promo promo--${variant}${game.coverUrl ? '' : ' promo--no-cover'}`}>
      {variant !== 'strip' && (
        <div className="promo__backdrop" aria-hidden="true">
          <GameCover name={game.name} coverUrl={game.coverUrl} eager />
        </div>
      )}
      {/* Sem capa no destaque, o placeholder só repetiria o título: o fundo carrega a cor sozinho. */}
      {(game.coverUrl || variant === 'strip') && (
        <div className="promo__cover">
          <GameCover name={game.name} coverUrl={game.coverUrl} eager={variant !== 'strip'} />
        </div>
      )}
      <div className="promo__info">
        {game.discount !== null && <span className="discount-tag promo__tag">-{game.discount}%</span>}
        <h3 className="promo__name">
          <button type="button" className="promo__open" onClick={() => onOpen(game)}>
            {game.name}
          </button>
        </h3>
        {variant === 'lead' && (
          <p className="promo__meta">
            {genreLabel(game.genre)}
            {game.description && <span className="promo__desc">{game.description}</span>}
          </p>
        )}
        <RatingAverage average={game.averageRating} count={game.ratingCount} />
        <div className="promo__deal">
          <Price current={game.currentPrice} original={game.originalPrice} className="promo__price" />
          {until && (
            <span className="promo__until">
              <ClockIcon /> até {until}
            </span>
          )}
        </div>
        <div className="promo__action">
          <GameAction game={game} size={variant === 'lead' ? 'md' : 'sm'} />
        </div>
      </div>
    </article>
  )
}

interface Props {
  /** Já ordenadas por maior desconto. */
  promotions: GameView[]
  onOpen: (g: GameView) => void
}

/** 1 → só o grande · 2 → grande + 1 · 3 → grande + 2 · 4+ → os 3 maiores no destaque e o resto na faixa. */
export function Promotions({ promotions, onOpen }: Props) {
  if (promotions.length === 0) return null
  const [lead, ...others] = promotions
  const side = others.slice(0, 2)
  const strip = others.slice(2)

  return (
    <section className="promotions" aria-labelledby="promo-title">
      <h2 id="promo-title" className="section-title">
        Em promoção
      </h2>
      <div className={`promotions__hero promotions__hero--${1 + side.length}`}>
        <PromoCard game={lead} variant="lead" onOpen={onOpen} />
        {side.length > 0 && (
          <div className="promotions__side">
            {side.map((g) => (
              <PromoCard key={g.id ?? g.name} game={g} variant="side" onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
      {strip.length > 0 && (
        <div className="promotions__strip-wrap">
          <h3 className="promotions__more">Mais promoções</h3>
          <div className="promotions__strip" tabIndex={0} role="group" aria-label="Mais promoções, role para o lado">
            {strip.map((g) => (
              <PromoCard key={g.id ?? g.name} game={g} variant="strip" onOpen={onOpen} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function PromotionsSkeleton() {
  return (
    <section className="promotions" aria-hidden="true">
      <div className="section-title">Em promoção</div>
      <div className="promotions__hero promotions__hero--3">
        <div className="promo promo--lead skeleton" />
        <div className="promotions__side">
          <div className="promo promo--side skeleton" />
          <div className="promo promo--side skeleton" />
        </div>
      </div>
    </section>
  )
}
