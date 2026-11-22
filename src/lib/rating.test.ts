import { describe, expect, it } from 'vitest'
import { formatRating, hasAverage, ratingCountLabel, ratingSpeech, starsFor, withRating } from './rating'

describe('formatRating', () => {
  it('usa uma casa decimal com vírgula', () => {
    expect(formatRating(4.25)).toBe('4,3')
    expect(formatRating(5)).toBe('5,0')
    expect(formatRating(0)).toBe('0,0')
  })
})

describe('ratingCountLabel', () => {
  it('singular e plural com separador de milhar', () => {
    expect(ratingCountLabel(1)).toBe('1 avaliação')
    expect(ratingCountLabel(12)).toBe('12 avaliações')
    expect(ratingCountLabel(1204)).toBe('1.204 avaliações')
  })
})

describe('ratingSpeech', () => {
  it('lê a média e a quantidade', () => {
    expect(ratingSpeech(4.3, 12)).toBe('Nota média 4,3 de 5, 12 avaliações')
  })
})

describe('starsFor', () => {
  it('arredonda notas fracionadas e limita a 0..5', () => {
    expect(starsFor(3.5)).toBe(4)
    expect(starsFor(3.4)).toBe(3)
    expect(starsFor(7)).toBe(5)
    expect(starsFor(-1)).toBe(0)
  })

  it('sem nota é zero estrelas', () => {
    expect(starsFor(null)).toBe(0)
    expect(starsFor(undefined)).toBe(0)
    expect(starsFor(Number.NaN)).toBe(0)
  })
})

describe('hasAverage', () => {
  it('só com média numérica e ao menos uma avaliação', () => {
    expect(hasAverage(4.3, 12)).toBe(true)
    expect(hasAverage(0, 1)).toBe(true)
    expect(hasAverage(null, 0)).toBe(false)
    expect(hasAverage(undefined, undefined)).toBe(false)
    expect(hasAverage(4, 0)).toBe(false)
  })
})

describe('withRating', () => {
  const item = (gameId: string, rating?: number | null) => ({
    gameId,
    gameName: gameId,
    description: '',
    genre: 'RPG',
    acquiredAt: '2026-10-01T10:00:00Z',
    rating,
  })

  it('troca só a nota do jogo avaliado', () => {
    const before = [item('a', null), item('b', 2)]
    const after = withRating(before, 'b', 5)
    expect(after.map((i) => i.rating)).toEqual([null, 5])
    expect(after[0]).toBe(before[0])
    expect(before[1].rating).toBe(2)
  })
})
