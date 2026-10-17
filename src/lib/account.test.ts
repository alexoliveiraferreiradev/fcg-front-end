import { describe, expect, it } from 'vitest'
import { PASSWORD_RULES, validateAccountForm } from './account'

const failing = (password: string) => PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.id)

describe('PASSWORD_RULES', () => {
  it('aceita uma senha que cumpre todas as regras', () => {
    expect(failing('Senha.Forte1')).toEqual([])
  })
  it('aponta cada regra que falta', () => {
    expect(failing('curta')).toEqual(['length', 'upper', 'number', 'special'])
    expect(failing('SEMMINUSCULA1!')).toEqual(['lower'])
    expect(failing('Sem#Simbolo1')).toEqual(['special'])
    expect(failing('A1a!' + 'x'.repeat(57))).toEqual(['length'])
  })
})

describe('validateAccountForm', () => {
  const ok = { name: 'Ana Teste', password: 'Senha.Forte1', confirmPassword: 'Senha.Forte1' }

  it('sem erros quando tudo está certo', () => {
    expect(validateAccountForm(ok)).toEqual({})
  })
  it('nome com menos de 3 caracteres, ignorando espaços', () => {
    expect(validateAccountForm({ ...ok, name: '  An ' })).toHaveProperty('name')
  })
  it('senha fora das regras', () => {
    expect(validateAccountForm({ ...ok, password: 'fraca', confirmPassword: 'fraca' })).toHaveProperty('password')
  })
  it('confirmação vazia ou diferente', () => {
    expect(validateAccountForm({ ...ok, confirmPassword: '' }).confirmPassword).toEqual(['Repita a nova senha.'])
    expect(validateAccountForm({ ...ok, confirmPassword: 'Senha.Forte2' }).confirmPassword).toEqual(['As senhas não são iguais.'])
  })
})
