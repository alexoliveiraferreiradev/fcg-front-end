import { formatPrice, priceSpeech } from '../lib/format'

interface Props {
  current: number
  original: number | null
  className?: string
}

/** Preço atual, com o original riscado quando há desconto. Leitor de tela ouve "de X por Y". */
export function Price({ current, original, className = '' }: Props) {
  return (
    <span className={`price ${className}`}>
      <span className="sr-only">{priceSpeech(current, original)}</span>
      {original !== null && (
        <s className="price__old" aria-hidden="true">
          {formatPrice(original)}
        </s>
      )}
      <span className={`price__now${current === 0 ? ' price__now--free' : ''}`} aria-hidden="true">
        {formatPrice(current)}
      </span>
    </span>
  )
}
