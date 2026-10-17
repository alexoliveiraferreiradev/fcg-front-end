const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatPrice(value: number): string {
  return value === 0 ? 'Grátis' : brl.format(value)
}

/** "31/10" */
export function formatDayMonth(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** "12/10/2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Texto para leitor de tela: "de R$ 99,90 por R$ 59,94". */
export function priceSpeech(current: number, original: number | null): string {
  if (original === null) return formatPrice(current)
  return `de ${formatPrice(original)} por ${formatPrice(current)}`
}
