import { describe, expect, it } from 'vitest'
import { parseSearchTerm, resultCountLabel, SEARCH_MAX_LENGTH } from './search'

describe('parseSearchTerm', () => {
  it('tira os espaços das pontas', () => {
    expect(parseSearchTerm('  corrida  ')).toBe('corrida')
  })

  it('vazio ou só espaços não é busca', () => {
    expect(parseSearchTerm('')).toBeUndefined()
    expect(parseSearchTerm('   ')).toBeUndefined()
    expect(parseSearchTerm(null)).toBeUndefined()
  })

  it('corta no limite do Catalog', () => {
    expect(parseSearchTerm('a'.repeat(150))).toHaveLength(SEARCH_MAX_LENGTH)
  })
})

describe('resultCountLabel', () => {
  it('singular e plural', () => {
    expect(resultCountLabel(1)).toBe('1 resultado')
    expect(resultCountLabel(3)).toBe('3 resultados')
    expect(resultCountLabel(1204)).toBe('1.204 resultados')
  })
})
