/**
 * Lê uma claim do payload do JWT, sem validar (quem valida é o Kong). Só para exibição, como o nome no cabeçalho.
 * Devolve null se o token não tiver o formato esperado ou a claim não for texto.
 */
export function jwtClaim(token: string, claim: string): string | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const value = (JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>)[claim]
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}
