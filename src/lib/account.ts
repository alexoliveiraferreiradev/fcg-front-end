// Regras do UpdateUserCommandValidator (fcg-usuario-api), repetidas no front para mostrar
// o que falta enquanto a pessoa digita. A validação que vale continua sendo a da API.

export const NAME_MIN = 3
export const NAME_MAX = 50

export interface PasswordRule {
  id: string
  label: string
  test: (password: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'De 8 a 60 caracteres', test: (p) => p.length >= 8 && p.length <= 60 },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'Um número', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Um destes símbolos: ! ? * . @', test: (p) => /[!?*.@]/.test(p) },
]

export interface AccountForm {
  name: string
  password: string
  confirmPassword: string
}

/** Erros por campo, com as mesmas chaves que a API devolve (name, password, confirmPassword). */
export function validateAccountForm({ name, password, confirmPassword }: AccountForm): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const trimmed = name.trim()
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
    errors.name = [`O nome deve ter de ${NAME_MIN} a ${NAME_MAX} caracteres.`]
  }
  const missing = PASSWORD_RULES.filter((r) => !r.test(password))
  if (missing.length) errors.password = ['A senha ainda não atende a todas as regras.']
  if (!confirmPassword) errors.confirmPassword = ['Repita a nova senha.']
  else if (confirmPassword !== password) errors.confirmPassword = ['As senhas não são iguais.']
  return errors
}
