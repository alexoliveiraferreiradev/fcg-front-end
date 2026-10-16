import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { games, ownedIds, type MockGame } from './data.ts'

// Simula as rotas do Kong usadas pelo front, só em `npm run dev:mock`.
// Login: qualquer e-mail/senha; e-mail com "admin" entra como Admin; senha "errada" devolve 401.
// MOCK_PROMOS=0..5 limita quantas promoções aparecem (para testar o destaque); MOCK_LATENCY em ms.

const LATENCY = Number(process.env.MOCK_LATENCY ?? 350)
const PROMO_LIMIT = process.env.MOCK_PROMOS === undefined ? Infinity : Number(process.env.MOCK_PROMOS)

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
  }
}

function token(role: string) {
  return `mock.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.sig`
}

function roleFrom(req: IncomingMessage): string | null {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer mock.')) return null
  try {
    return JSON.parse(Buffer.from(auth.split('.')[1], 'base64url').toString()).role
  } catch {
    return null
  }
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
          const list = games.filter((g) => !genre || g.genre === genre).map(toUser)
          if (list.length === 0) return send(res, 404)
          return send(res, 200, paged(list, page, pageSize))
        }

        if (req.method === 'GET' && path === '/catalog/games/promoted') {
          const list = games.filter((g) => g.promoPrice !== undefined).slice(0, PROMO_LIMIT).map(toPromotion)
          if (list.length === 0) return send(res, 404)
          return send(res, 200, paged(list, page, pageSize))
        }

        if (req.method === 'GET' && path === '/library') {
          const role = roleFrom(req)
          if (!role) return send(res, 401)
          const items = ownedIds.map((gid) => {
            const g = games.find((x) => x.id === gid)!
            return { gameId: g.id, gameName: g.name, description: g.description, genre: g.genre, acquiredAt: '2026-10-12T09:45:00Z' }
          })
          return send(res, 200, paged(items, page, pageSize))
        }

        if (req.method === 'POST' && path === '/user/sign-in') {
          const body = await readJson(req)
          if (!body.email || !body.password) {
            return send(res, 400, { title: 'One or more validation errors occurred.', status: 400, errors: { Email: !body.email ? ['O e-mail é obrigatório.'] : [], Password: !body.password ? ['A senha é obrigatória.'] : [] } })
          }
          if (body.password === 'errada') return send(res, 401)
          const role = body.email.includes('admin') ? 'Admin' : 'Player'
          return send(res, 200, {
            acessToken: token(role),
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
