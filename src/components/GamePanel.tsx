import { useEffect, useRef, useState } from 'react'
import type { GameView } from '../lib/game'
import { genreLabel } from '../lib/game'
import { formatDayMonth } from '../lib/format'
import { GameCover } from './GameCover'
import { GameAction } from './GameAction'
import { Price } from './Price'
import { ClockIcon, CloseIcon } from './Icons'
import './GamePanel.css'

const EXIT_MS = 200

interface Props {
  game: GameView | null
  onClose: () => void
}

/**
 * Painel lateral de detalhe. <dialog> modal dá foco preso, Esc e devolve o foco ao card ao fechar.
 * Ao fechar, mantém o último jogo na tela até a animação de saída terminar.
 */
export function GamePanel({ game: current, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [shown, setShown] = useState(current)
  if (current && current !== shown) setShown(current)
  const closing = !current && shown !== null
  const game = current ?? shown

  useEffect(() => {
    const dialog = ref.current
    if (current && dialog && !dialog.open) dialog.showModal()
  }, [current])

  // Fecha depois da saída (0.2s no CSS). Timer em vez de animationend: numa aba em segundo plano
  // a animação não avança e o dialog modal ficaria aberto, travando a página.
  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => {
      ref.current?.close()
      setShown(null)
    }, EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [closing])

  return (
    <dialog
      ref={ref}
      className={`panel${closing ? ' panel--closing' : ''}`}
      aria-labelledby="panel-title"
      onClose={onClose}
      onCancel={(e) => {
        // Esc: em vez de fechar na hora, deixa a saída animar.
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // Clique no fundo (fora da folha) fecha.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {game && (
        <div className="panel__sheet">
          <div className="panel__bar">
            <button type="button" className="panel__close" onClick={onClose} aria-label="Fechar detalhe">
              <CloseIcon />
            </button>
          </div>
          <div className="panel__cover">
            <GameCover name={game.name} coverUrl={game.coverUrl} eager />
            {game.discount !== null && <span className="discount-tag panel__tag">-{game.discount}%</span>}
          </div>
          <div className="panel__body">
            <h2 id="panel-title" className="panel__name">
              {game.name}
            </h2>
            <p className="panel__genre">{genreLabel(game.genre)}</p>
            <div className="panel__deal">
              <Price current={game.currentPrice} original={game.originalPrice} className="panel__price" />
              {game.endDate && (
                <span className="panel__until">
                  <ClockIcon /> Promoção até {formatDayMonth(game.endDate)}
                </span>
              )}
            </div>
            <div className="panel__action">
              <GameAction game={game} size="md" block />
            </div>
            {game.description ? (
              <p className="panel__desc">{game.description}</p>
            ) : (
              <p className="panel__desc panel__desc--empty">Este jogo ainda não tem descrição.</p>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
