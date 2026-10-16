# fcg-frontend

Front-end do FIAP Cloud Games para testar e visualizar o ecossistema de microsserviços sem Postman. Todas as chamadas passam pelo Kong.

## Pré-requisitos

- Node.js 20+
- Ambiente do `fcg-infrastructure` rodando (Kong em `http://localhost:8000`)
- Para comprar várias vezes seguidas, limites locais folgados no `.env` do infra (`ORDER_RATE_LIMIT_MINUTE`, `LIBRARY_RATE_LIMIT_MINUTE`)

## Rodando

```bash
npm install
npm run dev        # usa o Kong via proxy do Vite (/api → localhost:8000)
npm run dev:mock   # sem back-end: dados de exemplo de mock/, com faixa de aviso na tela
```

No modo mock, qualquer e-mail/senha entra; e-mail com "admin" entra como Admin; a senha `errada` devolve 401. `MOCK_PROMOS=0..5` limita as promoções exibidas.

```bash
npm test           # Vitest
npm run lint
npm run build
```

## Estado

Pronto: base (tema, cabeçalho, sessão, carrinho, avisos), catálogo com promoções, filtro, paginação e painel de detalhe, e a tela Entrar/Cadastrar.
Próximas etapas: carrinho/pagamento/pedidos, biblioteca, minha conta, admin.

O catálogo usa os campos da mudança planejada no `fcg-catalog-api` (`coverUrl`, `originalPrice` público, `gameId`/`endDate` nas promoções). Sem eles, os cards mostram o placeholder no lugar da capa, sem preço riscado, e as promoções ficam sem botão de carrinho.
