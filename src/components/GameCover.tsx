import { useState } from 'react'
import './GameCover.css'

// Paletas do placeholder: pares escuros que seguram texto branco, escolhidos pelo nome do jogo.
const PALETTES: [string, string][] = [
  ['#3b1f6b', '#c2477a'],
  ['#0f4c5c', '#2bb3a3'],
  ['#5c3a0f', '#d98e2b'],
  ['#6b1f1f', '#c24747'],
  ['#1f3b6b', '#47a0c2'],
  ['#1f5c33', '#6fae3f'],
  ['#4a0f3a', '#ed145b'],
  ['#2b2d30', '#7d8f99'],
]

function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

function placeholderColors(name: string): [string, string] {
  return PALETTES[hash(name) % PALETTES.length]
}

interface Props {
  name: string
  coverUrl: string | null
  className?: string
  /** Imagens acima da dobra carregam já. */
  eager?: boolean
}

/** Capa do jogo, ou placeholder com gradiente e o nome quando não há link ou a imagem falha. */
export function GameCover({ name, coverUrl, className = '', eager = false }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showImage = coverUrl && failedUrl !== coverUrl

  if (showImage) {
    return (
      <img
        className={`cover ${className}`}
        src={coverUrl}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailedUrl(coverUrl)}
      />
    )
  }

  const [from, to] = placeholderColors(name)
  return (
    <div className={`cover cover--placeholder ${className}`} style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}>
      <span aria-hidden="true">{name}</span>
    </div>
  )
}
