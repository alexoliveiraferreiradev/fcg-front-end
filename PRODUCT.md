# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + TypeScript + Vite, escolhido pelo Claude no design doc (o autor pode reverter). Proxy do Vite (`/api` → `http://localhost:8000`) contorna a falta de CORS no Kong em dev. Sugeridos: React Router, TanStack Query, CSS puro com variáveis. Execução só com `npm run dev` por enquanto; Docker/k8s do front ficam para depois.

## Users

- **Primário: o autor do FCG.** Desenvolve os microsserviços .NET e hoje testa tudo endpoint a endpoint no Postman. Usa o front localmente para exercitar o ecossistema inteiro, como jogador e como admin, e ver os serviços conversando.
- **Secundário: quem assiste a uma apresentação/demo** (professores, avaliadores). O front aparece em vídeo ou demo, mas não é vitrine: o foco acadêmico é o back-end.

## Product Purpose

FIAP Cloud Games (FCG) é um conjunto de microsserviços (Users, Catalog, Order, Payments, UserLibrary, Notifications/Function) exposto pelo Kong. O front une todos numa única aplicação com cara de loja/biblioteca de jogos, para **testar e visualizar o ecossistema funcionando**.

Sucesso: sem Postman, o autor consegue cadastrar-se, logar, navegar no catálogo com promoções em destaque, comprar um ou mais jogos via pagamento simulado, ver o pedido sair de "processando" para aprovado/recusado, ver os jogos na biblioteca e, como admin, gerenciar jogos, promoções e usuários.

## Positioning

É um cliente de teste com cara de produto, não uma loja real. O que o distingue é tornar visível o que o Postman esconde: o caráter assíncrono da compra (pedido → processando → aprovado/recusado → biblioteca), os avisos que espelham os e-mails simulados da Notification Function, e os limites do gateway (429) tratados na tela.

## Operating Context

- Roda local, contra o `docker compose` do `fcg-infrastructure` (Kong em `localhost:8000`).
- Todas as chamadas passam pelo Kong; contratos em `fcg-openapi-gateway.json`.
- Perfis `Player` e `Admin`. Admin não compra (`/user/order` exige `PlayersOnly`).
- Rate limit do Kong é crítico: `/user/order` e `/library` a 2 req/min na entrega (folgados só no `.env` local); todos os JWTs caem no mesmo consumer, então abas e usuários dividem o mesmo balde.
- Compra é assíncrona: `POST /user/order` devolve 200 sem corpo; o front identifica o pedido novo como o `Draft` mais recente e consulta até sair de `Draft`.
- Documentos de referência: [design](docs/superpowers/specs/2026-10-16-fcg-frontend-design.md), [rascunho visual aprovado](docs/superpowers/specs/2026-10-16-fcg-frontend-mockup.html), [plano](docs/superpowers/plans/2026-10-16-fcg-frontend-plan.md).

## Capabilities and Constraints

- Telas: Catálogo (inicial, pública, promoções em destaque, filtro por gênero, paginação), Entrar/Cadastrar, Carrinho, Pagamento simulado, Pedidos (linha do tempo + histórico), Minha biblioteca, Minha conta, Admin (Jogos, Promoções, Usuários, Manutenção).
- Carrinho com vários jogos, guardado no navegador. Selo "Na biblioteca" cruzando catálogo e `/library`.
- Capas: link de texto digitado pelo admin (externo ou `/covers/<arquivo>`), sem upload. Jogo sem capa mostra placeholder com gradiente e nome.
- Transversais: 401 limpa sessão e volta ao login; 429 mostra a mensagem do Kong e tenta de novo depois; erros de validação aparecem junto aos campos.
- Enums trafegam como string; paginação via `PagedResult<T>`. Atenção: `acessToken` com um "c" só.
- **Anti-metas (falha mesmo funcionando):** chamar serviço sem passar pelo Kong; tela de pagamento pedir cartão, CPF ou qualquer dado que pareça real; mostrar "comprado!" logo após o POST, escondendo a assincronia.
- **Fora de escopo:** pagamento real, caixa de entrada de e-mails, deploy em produção, SEO, i18n, botão "forçar recusa", upload de imagens.
- Pré-requisitos no back-end (Catalog: `coverUrl`, `originalPrice` público, `gameId`/`endDate` nas promoções, capas em lote; Kong: limites configuráveis) vêm antes do front.

## Brand Commitments

- Nome exibido: logo em texto "FIAP." (ponto rosa) + "CLOUD GAMES". Não usar arquivos de logo oficiais da FIAP.
- Identidade inspirada no site da FIAP, conforme o rascunho aprovado e a seção 5 do design doc, com a fonte do sistema (não Montserrat/Gotham). É **ponto de partida**: telas futuras a respeitam, mas ela pode evoluir se algo funcionar melhor.
- Voz: pt-BR, direta e funcional, frases curtas ("+ Carrinho", "Pedido aprovado", "Pagamento recusado", "Cadastro efetuado").

## Evidence on Hand

- Rascunho visual aprovado (catálogo, pagamento, pedidos): `docs/superpowers/specs/2026-10-16-fcg-frontend-mockup.html`.
- Capas de exemplo: a criar em `public/covers/`, geradas localmente (sem imagens de terceiros).
- Não existem depoimentos, clientes, métricas ou preços reais; não inventar. Jogos e preços vêm do Catalog.

## Product Principles

1. **O ecossistema é o protagonista.** Cada tela existe para exercitar uma rota do Kong e tornar o resultado visível.
2. **Mostrar a verdade assíncrona.** Estados intermediários (processando, limite atingido, recusado) aparecem com clareza, nunca são mascarados.
3. **Simulação explícita.** Nada que pareça coleta de dado real; o caráter de teste fica evidente onde importa.
4. **Agradável e coerente, não sofisticado.** Bom o bastante para uma demo; esforço vai para clareza, não para ornamento.

## Accessibility & Inclusion

Básico razoável (fora de escopo ir além): contraste legível sobre fundo escuro, foco visível, navegação por teclado nos formulários e diálogos.
