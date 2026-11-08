import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { games, orphan, owned, type MockGame } from './data.ts'

// Simula as rotas do Kong usadas pelo front, só em `npm run dev:mock`.
// Login: qualquer e-mail/senha; e-mail com "admin" entra como Admin; senha "errada" devolve 401.
// MOCK_PROMOS=0..5 limita quantas promoções aparecem (para testar o destaque); MOCK_LIBRARY=0..14 limita a biblioteca
// (0 testa a biblioteca vazia); MOCK_LATENCY em ms; MOCK_RATING_DELAY em ms até a média do catálogo mudar depois de uma nota.

const LATENCY = Number(process.env.MOCK_LATENCY ?? 350)
const PROMO_LIMIT = process.env.MOCK_PROMOS === undefined ? Infinity : Number(process.env.MOCK_PROMOS)
const LIBRARY_LIMIT = process.env.MOCK_LIBRARY === undefined ? Infinity : Number(process.env.MOCK_LIBRARY)
const RATING_DELAY = Number(process.env.MOCK_RATING_DELAY ?? 1500)

function send(res: ServerResponse, status: number, body?: unknown) {
  res.statusCode = status
  if (body === undefined) return res.end()
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function paged<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    pageNumber: page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize),
  }
}

async function readJson(req: IncomingMessage): Promise<Record<string, string>> {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || '{}')
  } catch {
    return {}
  }
}

const currentPrice = (g: MockGame) => g.promoPrice ?? g.originalPrice

// Avaliações em memória (somem ao reiniciar o Vite): a nota do Player por jogo (UserLibrary)
// e a soma/quantidade por jogo (Catalog), que muda só depois de RATING_DELAY, como o consumer do Service Bus.
const playerRatings = new Map(owned.flatMap((o) => (o.rating === undefined ? [] : [[o.id, o.rating] as const])))
const catalogRatings = new Map(games.map((g) => [g.id, { ...(g.ratings ?? { sum: 0, count: 0 }) }]))

// Como o Game do Catalog: média com uma casa, null sem avaliações.
function ratingOf(gameId: string) {
  const r = catalogRatings.get(gameId)
  if (!r || r.count === 0) return { averageRating: null, ratingCount: 0 }
  return { averageRating: Math.round((r.sum / r.count) * 10) / 10, ratingCount: r.count }
}

/** Primeira nota soma e conta; reavaliação troca a nota antiga pela nova (AddRating/ChangeRating do Game). */
function applyToCatalog(gameId: string, previous: number | undefined, rating: number) {
  const r = catalogRatings.get(gameId)
  if (!r) return // jogo que o Catalog não conhece mais: o consumer não acha o Game
  if (previous === undefined) {
    r.sum += rating
    r.count++
  } else {
    r.sum += rating - previous
  }
}

function toUser(g: MockGame) {
  const price = currentPrice(g)
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    originalPrice: g.originalPrice,
    currentPrice: price,
    genre: g.genre,
    hasDiscount: price < g.originalPrice,
    coverUrl: g.coverUrl ?? null,
    ...ratingOf(g.id),
  }
}

function toPromotion(g: MockGame, i: number) {
  const price = currentPrice(g)
  return {
    promotionId: `10000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    gameId: g.id,
    name: g.name,
    description: g.description,
    originalPrice: g.originalPrice,
    currentPrice: price,
    genre: g.genre,
    discountPercentage: Math.round(((g.originalPrice - price) / g.originalPrice) * 10000) / 100,
    endDate: g.promoEnd,
    coverUrl: g.coverUrl ?? null,
    ...ratingOf(g.id),
  }
}

// Como o token real, o payload leva unique_name (o front mostra no cabeçalho).
function token(role: string, email: string) {
  return `mock.${Buffer.from(JSON.stringify({ role, email, unique_name: accountName(email) })).toString('base64url')}.sig`
}

function claimsFrom(req: IncomingMessage): { role: string; email: string } | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer mock.')) return null
  try {
    return JSON.parse(Buffer.from(auth.split('.')[1], 'base64url').toString())
  } catch {
    return null
  }
}

function roleFrom(req: IncomingMessage): string | null {
  return claimsFrom(req)?.role ?? null
}

// Minha conta em memória: nome por e-mail e contas desativadas (que não entram mais). Some ao reiniciar o Vite.
const accountNames = new Map<string, string>()
const deactivated = new Set<string>()
const accountName = (email: string) => accountNames.get(email) ?? (email.includes('admin') ? 'Admin de Exemplo' : 'Player de Exemplo')

// Mesmas regras do UpdateUserCommandValidator; erros com chave em PascalCase, como a API.
function accountErrors(body: Record<string, string>): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const name = (body.name ?? '').trim()
  if (name.length < 3 || name.length > 50) errors.Name = ['O nome do usuário deve conter entre 3 e 50 caracteres.']
  const p = body.password ?? ''
  const pw: string[] = []
  if (p.length < 8 || p.length > 60) pw.push('A senha deve ter entre 8 e 60 caracteres.')
  if (!/[A-Z]/.test(p)) pw.push('A senha deve conter uma letra maiúscula.')
  if (!/[a-z]/.test(p)) pw.push('A senha deve conter uma letra minúscula.')
  if (!/[0-9]/.test(p)) pw.push('A senha deve conter um número.')
  if (!/[!?*.@]/.test(p)) pw.push('A senha deve conter um caractere especial.')
  if (pw.length) errors.Password = pw
  if (!body.confirmPassword) errors.ConfirmPassword = ['A confirmação de senha do usuário é obrigatória.']
  else if (body.confirmPassword !== p) errors.ConfirmPassword = ['A senha e a confirmação de senha devem ser iguais.']
  return errors
}

export function mockApi(): Plugin {
  return {
    name: 'fcg-mock-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const url = new URL(req.url, 'http://mock')
        const path = url.pathname.replace(/^\/api/, '')
        const page = Number(url.searchParams.get('page') ?? 1)
        const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
        await new Promise((r) => setTimeout(r, LATENCY))

        if (req.method === 'GET' && path === '/catalog/games') {
          const genre = url.searchParams.get('genre')
          const list = games.filter((g) => !g.inactive && (!genre || g.genre === genre)).map(toUser)
          if (list.length === 0) return send(res, 404)
          return send(res, 200, paged(list, page, pageSize))
        }

        if (req.method === 'GET' && path === '/catalog/games/promoted') {
          const list = games.filter((g) => !g.inactive && g.promoPrice !== undefined).slice(0, PROMO_LIMIT).map(toPromotion)
          if (list.length === 0) return send(res, 404)
          return send(res, 200, paged(list, page, pageSize))
        }

        if (req.method === 'GET' && path === '/catalog/games/covers') {
          const ids = url.searchParams.getAll('ids')
          if (ids.length === 0 || new Set(ids).size > 50) {
            return send(res, 400, { title: 'One or more validation errors occurred.', status: 400, errors: { ids: [ids.length === 0 ? 'Informe ao menos um id de jogo.' : 'Informe no máximo 50 ids de jogo por consulta.'] } })
          }
          const found = games.filter((g) => ids.includes(g.id)).map((g) => ({ gameId: g.id, name: g.name, coverUrl: g.coverUrl ?? null, isActive: !g.inactive }))
          return send(res, 200, found)
        }

        if (req.method === 'GET' && path === '/library') {
          const role = roleFrom(req)
          if (!role) return send(res, 401)
          if (role !== 'Player') return send(res, 403)
          const items = [
            ...owned.map(({ id, acquiredAt }) => {
              const g = games.find((x) => x.id === id)!
              return { gameId: g.id, gameName: g.name, description: g.description, genre: g.genre, acquiredAt, rating: playerRatings.get(id) ?? null }
            }),
            { ...orphan, rating: playerRatings.get(orphan.gameId) ?? null },
          ].slice(0, LIBRARY_LIMIT)
          // Como a UserLibrary: biblioteca vazia responde 404.
          if (items.length === 0) return send(res, 404)
          return send(res, 200, paged(items, page, pageSize))
        }

        const rated = path.match(/^\/library\/([^/]+)\/rating$/)
        if (req.method === 'PUT' && rated) {
          const role = roleFrom(req)
          if (!role) return send(res, 401)
          if (role !== 'Player') return send(res, 403)
          const gameId = decodeURIComponent(rated[1])
          // Mesmas mensagens do LibraryEntry.Rate e do handler (DomainException vira 400).
          if (!owned.some((o) => o.id === gameId) && orphan.gameId !== gameId) {
            return send(res, 400, { title: 'Bad Request', status: 400, detail: 'Jogo não encontrado.' })
          }
          const rating = ((await readJson(req)) as Record<string, unknown>).rating
          if (typeof rating !== 'number' || Number.isNaN(rating) || rating < 0 || rating > 5) {
            return send(res, 400, { title: 'Bad Request', status: 400, detail: 'A avaliação deve ser entre 0 e 5.' })
          }
          const previous = playerRatings.get(gameId)
          playerRatings.set(gameId, rating)
          setTimeout(() => applyToCatalog(gameId, previous, rating), RATING_DELAY)
          return send(res, 204)
        }

        if (path === '/my-account' || path === '/my-account/' || path.startsWith('/my-account/')) {
          const claims = claimsFrom(req)
          if (!claims) return send(res, 401)
          const { email } = claims
          if (req.method === 'GET' && (path === '/my-account' || path === '/my-account/')) {
            return send(res, 200, { name: accountName(email), email })
          }
          if (req.method === 'PUT' && path === '/my-account/update') {
            const body = await readJson(req)
            const errors = accountErrors(body)
            if (Object.keys(errors).length) return send(res, 400, { title: 'One or more validation errors occurred.', status: 400, errors })
            accountNames.set(email, body.name.trim())
            return send(res, 200, { name: body.name.trim(), email })
          }
          if (req.method === 'PUT' && path === '/my-account/deactivate-account') {
            deactivated.add(email)
            return send(res, 204)
          }
        }

        if (req.method === 'POST' && path === '/user/sign-in') {
          const body = await readJson(req)
          if (!body.email || !body.password) {
            return send(res, 400, { title: 'One or more validation errors occurred.', status: 400, errors: { Email: !body.email ? ['O e-mail é obrigatório.'] : [], Password: !body.password ? ['A senha é obrigatória.'] : [] } })
          }
          if (body.password === 'errada' || deactivated.has(body.email)) return send(res, 401)
          const role = body.email.includes('admin') ? 'Admin' : 'Player'
          return send(res, 200, {
            acessToken: token(role, body.email),
            expiresIn: 3600,
            id: role === 'Admin' ? 'admin-0001' : 'player-0001',
            email: body.email,
            claims: [],
            perfilUser: role,
          })
        }

        if (req.method === 'POST' && path === '/user/register') {
          const body = await readJson(req)
          if (body.email?.startsWith('existe')) return send(res, 409)
          if (body.password !== body.confirmPassword) {
            return send(res, 400, { status: 400, errors: { ConfirmPassword: ['As senhas não conferem.'] } })
          }
          return send(res, 201)
        }

        return send(res, 404, { title: `Rota sem mock: ${req.method} ${path}` })
      })
    },
  }
}
