import { describe, expect, it } from 'vitest'
import { jwtClaim } from './jwt'

const encode = (claims: object) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(claims))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const token = (claims: object) => `cabecalho.${encode(claims)}.assinatura`

describe('jwtClaim', () => {
  it('lê o unique_name com acentos (base64url sem padding)', () => {
    expect(jwtClaim(token({ unique_name: 'João Conceição', nameid: 'x' }), 'unique_name')).toBe('João Conceição')
  })
  it('null quando a claim falta ou não é texto', () => {
    expect(jwtClaim(token({ nameid: 'x' }), 'unique_name')).toBeNull()
    expect(jwtClaim(token({ unique_name: 42 }), 'unique_name')).toBeNull()
  })
  it('null para token malformado', () => {
    expect(jwtClaim('sem-pontos', 'unique_name')).toBeNull()
    expect(jwtClaim('a.%%%.c', 'unique_name')).toBeNull()
  })
})
