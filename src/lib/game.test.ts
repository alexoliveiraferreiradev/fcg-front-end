import { describe, expect, it } from 'vitest'
import { discountPercent, fromCatalog, fromPromotion, genreLabel, sortPromotions, toGenre } from './game'
import { formatPrice } from './format'
import { pageWindow } from './pagination'

describe('discountPercent', () => {
  it('arredonda para inteiro', () => {
    expect(discountPercent(99.9, 59.94)).toBe(40)
    expect(discountPercent(49.9, 37.42)).toBe(25)
  })
  it('sem desconto quando o preço não caiu', () => {
    expect(discountPercent(50, 50)).toBeNull()
    expect(discountPercent(0, 0)).toBeNull()
  })
})

describe('fromCatalog', () => {
  const base = { id: 'g1', name: 'X', description: '', currentPrice: 30, genre: 'RPG' as const, hasDiscount: true }
  it('usa originalPrice quando a API expõe', () => {
    expect(fromCatalog({ ...base, originalPrice: 60 })).toMatchObject({ originalPrice: 60, discount: 50 })
  })
  it('degrada sem originalPrice (Catalog antes da Parte A)', () => {
    expect(fromCatalog(base)).toMatchObject({ originalPrice: null, discount: null, coverUrl: null })
  })
  it('leva a média e a quantidade de avaliações', () => {
    expect(fromCatalog({ ...base, averageRating: 4.3, ratingCount: 12 })).toMatchObject({ averageRating: 4.3, ratingCount: 12 })
    expect(fromCatalog({ ...base, averageRating: null, ratingCount: 0 })).toMatchObject({ averageRating: null, ratingCount: 0 })
  })
  it('sem os campos de avaliação, não sabe a quantidade (Catalog antes da avaliação)', () => {
    expect(fromCatalog(base)).toMatchObject({ averageRating: null, ratingCount: null })
  })
})

describe('promoções', () => {
  const p = (name: string, discountPercentage: number, endDate?: string) =>
    fromPromotion({ promotionId: name, name, description: '', originalPrice: 100, currentPrice: 100 - discountPercentage, genre: 'RPG', discountPercentage, endDate })

  it('sem gameId não dá para pôr no carrinho', () => {
    expect(p('A', 10).id).toBeNull()
  })

  it('leva a média e a quantidade de avaliações; sem os campos, não sabe a quantidade', () => {
    const base = { promotionId: 'x', name: 'X', description: '', originalPrice: 100, currentPrice: 60, genre: 'RPG' as const, discountPercentage: 40 }
    expect(fromPromotion({ ...base, averageRating: 4.6, ratingCount: 214 })).toMatchObject({ averageRating: 4.6, ratingCount: 214 })
    expect(fromPromotion(base)).toMatchObject({ averageRating: null, ratingCount: null })
  })
  it('ordena por maior desconto, depois fim mais próximo', () => {
    const sorted = sortPromotions([p('A', 10), p('B', 50, '2026-11-01'), p('C', 50, '2026-10-20')])
    expect(sorted.map((g) => g.name)).toEqual(['C', 'B', 'A'])
  })
})

describe('formatPrice', () => {
  it('preço zero aparece como Grátis', () => {
    expect(formatPrice(0)).toBe('Grátis')
    expect(formatPrice(59.94)).toMatch(/R\$\s59,94/)
  })
})

describe('pageWindow', () => {
  it('mostra vizinhas e reticências', () => {
    expect(pageWindow(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10])
    expect(pageWindow(1, 3)).toEqual([1, 2, 3])
  })
})

describe('gêneros', () => {
  it('rótulo em português para as chaves do Catalog', () => {
    expect(genreLabel('Acao')).toBe('Ação')
    expect(genreLabel('MundoAberto')).toBe('Mundo aberto')
    expect(genreLabel('QuebraCabeca')).toBe('Quebra-cabeça')
    expect(genreLabel('Battle_Royale')).toBe('Battle Royale')
    expect(genreLabel('RPG')).toBe('RPG')
  })

  it('traduz o nome antigo em inglês guardado na biblioteca', () => {
    expect(genreLabel('Adventure')).toBe('Aventura')
    expect(genreLabel('OpenWorld')).toBe('Mundo aberto')
    expect(genreLabel('Sports')).toBe('Esportes')
    expect(genreLabel('Sport')).toBe('Esporte')
  })

  it('gênero desconhecido aparece como veio, sem sublinhado', () => {
    expect(genreLabel('Novo_Genero')).toBe('Novo Genero')
  })

  it('toGenre aceita a chave atual e a antiga; o resto é undefined', () => {
    expect(toGenre('Corrida')).toBe('Corrida')
    expect(toGenre('Racing')).toBe('Corrida')
    expect(toGenre('constructor')).toBeUndefined()
    expect(toGenre('')).toBeUndefined()
    expect(toGenre(null)).toBeUndefined()
  })
})
