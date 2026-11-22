/** Mesmo limite do SearchGamesQueryValidator no Catalog. */
export const SEARCH_MAX_LENGTH = 100

/** Termo da busca vindo da URL ou do campo: sem espaços nas pontas e no máximo 100 caracteres; vazio vira undefined. */
export function parseSearchTerm(value: string | null | undefined): string | undefined {
  const term = (value ?? '').trim().slice(0, SEARCH_MAX_LENGTH).trim()
  return term || undefined
}

/** "1 resultado", "1.204 resultados" */
export function resultCountLabel(count: number): string {
  return count === 1 ? '1 resultado' : `${count.toLocaleString('pt-BR')} resultados`
}
