# FCG Front-end — Plano de Implementação

Design: [../specs/2026-10-16-fcg-frontend-design.md](../specs/2026-10-16-fcg-frontend-design.md)
Rascunho visual: [../specs/2026-10-16-fcg-frontend-mockup.html](../specs/2026-10-16-fcg-frontend-mockup.html)

**Objetivo:** um front React que cobre todas as rotas do Kong (jogador e admin), com a identidade visual aprovada, mais as duas mudanças que ele exige: Catalog (capa, preços, promoções e capas em lote) e Kong (limites locais).

**Regras para quem executar**
- Três repositórios, em ordem: `fcg-catalog-api` → `fcg-infrastructure` → `fcg-frontend`. Cada parte fecha antes da próxima começar.
- **Nada de commit** sem o autor pedir. Quando ele pedir, nos repos `fcg-*` o commit **não leva** `Co-Authored-By` nem assinatura de assistente. Trabalhar em branch, nunca direto na `main`.
- Seguir o estilo do código existente: nomes, mensagens de log `[CatalogAPI] ...`, `DomainMessages`, testes xUnit + Moq + FluentAssertions.
- Pré-requisitos de máquina: .NET 9 SDK (já instalado) e **Node.js 20+ LTS (não instalado: o autor instala antes da Parte C)**.

---

## Parte A — `fcg-catalog-api`

Contexto: SQL Server; escrita via EF Core (`GameMapping`, migrations em `src/Fcg.Catalog.Infrastructure/Persistence/Migrations`); leitura via Dapper (`GameQueryRepository`, `PromotionQueryRepository`); catálogo público com cache Redis de 5 min (`CacheKeys`, handlers `*CacheHandler`).

### A1. Capa no domínio e na persistência
- `Domain/Entities/Game.cs`: propriedade `public string? CoverUrl { get; private set; }`. Parâmetro opcional `string? coverUrl = null` no construtor e no `Update(...)`. Validar com `AssertionConcern`: no máximo 500 caracteres, e ser URL absoluta `http(s)` **ou** caminho começando com `/`. Mensagem nova em `DomainMessages` (ex.: `GameCoverUrlInvalid`). O `DomainMessages` mora em `fcg.core.abstractions`: conferir se dá pra adicionar lá ou usar uma constante local seguindo o padrão do repo.
- `Infrastructure/Persistence/Mappings/GameMapping.cs`: `builder.Property(j => j.CoverUrl).HasMaxLength(500);` (nullable).
- Migration: `dotnet ef migrations add AddGameCoverUrl` no projeto Infrastructure, usando `CatalogDbContextFactory` e a mesma pasta `Persistence/Migrations`.
- Testes em `tests/Fcg.Catalog.Domain.Tests/Entities/GameTests.cs`: aceita nulo, aceita `https://...`, aceita `/covers/x.png`, rejeita `ftp://x` e texto solto, rejeita mais de 500 caracteres; `Update` troca a capa.

### A2. Comandos de jogo
- `AddGameCommand`: `public string? CoverUrl { get; init; }`. O validator aplica as mesmas regras de formato quando vier preenchido.
- `UpdateGameCommand`: `public string? NewCoverUrl { get; init; }` (+ validator). Nulo ou vazio limpa a capa.
- Handlers passam o valor pra entidade e devolvem `CoverUrl` no `GameResponse`.
- O evento `IGameCreatedIntegrationEvent` **não muda**: a UserLibrary não precisa da capa.
- Testes: ajustar `AddGameCommandHandlerTests` e `UpdateGameCommandHandlerTests` para cobrir a capa.

### A3. Respostas e consultas
- `GameResponse`, `GameUserResponse` e `GamePromotionResponse` ganham `CoverUrl`.
- `GameUserResponse`: **remover o `[JsonIgnore]`** de `OriginalPrice`.
- `GamePromotionResponse`: adicionar `GameId` (Guid) e `EndDate` (DateTime).
- SQL: incluir `j.CoverUrl` / `g.CoverUrl` em todos os `SELECT` de `GameQueryRepository` e `PromotionQueryRepository`. Nas duas consultas de promoções, incluir `g.Id AS GameId` e `p.EndDate`. Conferir se o `Id` já vai pra algum lugar: hoje `GamePromotionResponse` não tem `Id`, então o `g.Id` é descartado.
- **Cache:** a forma do JSON mudou. Mudar o prefixo das chaves em `CacheKeys` (ex.: sufixo `:v2`) para não servir resposta antiga do Redis.

### A4. Endpoint público de capas em lote
- Query `GetGameCoversQuery(IReadOnlyCollection<Guid> Ids)` → `IEnumerable<GameCoverResponse { GameId, Name, CoverUrl }>`, em `Features/Catalog/Queries/User/GetGameCovers/`.
- Repositório: método novo em `IGameQueryRepository` com `SELECT j.Id AS GameId, j.Name, j.CoverUrl FROM Games j WHERE j.Id IN @Ids`, **sem filtrar `IsActive`**.
- Validação: de 1 a 100 ids. Fora disso, 400.
- Endpoint em `CatalogEndpoints`: `group.MapGet("/covers", ...)` recebendo `[FromQuery] Guid[] ids` (`?ids=a&ids=b`). Anônimo, como o resto do grupo. Sem cache Redis (consulta pequena).
- Teste do handler (mock do repositório).

### A5. Documentação e verificação
- Regenerar o `swagger.json` do repo (do mesmo jeito que foi gerado antes: conferir no README).
- Rodar `dotnet build` e `dotnet test` na solution. Tudo verde.
- Subir o ambiente (`docker compose` do `fcg-infrastructure` com a imagem local do catalog) e testar pelo Kong:
  - `GET :8000/catalog/games` traz `originalPrice` e `coverUrl`;
  - `GET :8000/catalog/games/promoted` traz `gameId`, `endDate` e `coverUrl`;
  - `GET :8000/catalog/games/covers?ids=...` funciona, inclusive pra jogo desativado;
  - `POST/PUT /admin/games` com `coverUrl` persiste.
- Observação: o docker-compose e o k8s usam imagens versionadas. Conferir no README do infra como apontar pra imagem local, sem publicar nada.

---

## Parte B — `fcg-infrastructure`

### B1. Limites configuráveis
- `kong/template/kong.yml.template`: em `order-route` e `userlibrary-route`, trocar `minute: 2` por `minute: ${ORDER_RATE_LIMIT_MINUTE}` e `minute: ${LIBRARY_RATE_LIMIT_MINUTE}`.
- `kong/generate-kong-config.ps1`: antes do `Replace`, preencher com padrão `2` quando a variável não estiver no `.env`. Substituir os dois placeholders. Manter o UTF-8 e a checagem de placeholder não resolvido.
- `.env.example` (se existir no repo; se não, documentar no README): `ORDER_RATE_LIMIT_MINUTE=2` e `LIBRARY_RATE_LIMIT_MINUTE=2`, com um comentário dizendo pra usar `60` quando for usar o front.
- `k8s/configs/kong-configmap.yaml`: **não mexer**.
- Regenerar o `kong.yml` local. Verificar que, sem as variáveis, o resultado é idêntico ao atual (diff só se a variável estiver definida).

### B2. OpenAPI do gateway
- `fcg-openapi-gateway.json`: adicionar `coverUrl` em `GameResponse`, `AddGameCommand` e `UpdateGameCommand`. Documentar as respostas de `/catalog/games` e `/catalog/games/promoted` (`PagedResult` de `GameUserResponse`/`GamePromotionResponse`) e a rota nova `/catalog/games/covers`.
- README: uma linha sobre o front e os limites locais.

---

## Parte C — `fcg-frontend`

Stack: Vite + React + TypeScript. Bibliotecas sugeridas (o design deixa a escolha pra quem constrói): React Router, TanStack Query (cache, polling e repetição) e CSS puro com variáveis (o tema é pequeno, não precisa de framework de estilo).

### C1. Base
- `git init` em `fcg-frontend` (a pasta já tem `docs/`). Criar com `npm create vite@latest . -- --template react-ts`, sem apagar `docs/`.
- `vite.config.ts`: proxy `/api` → `http://localhost:8000`, com `rewrite` removendo `/api`. O front sempre chama `/api/...`.
- `src/styles/theme.css`: tokens do design (preto, `#0E0F10`, `#181818`, `#2B2D30`, `#FFF`, `#ACC1CC`, `#ED145B`), fonte do sistema, cantos retos, títulos em caixa alta com traço rosa. Copiar o visual do rascunho.
- `src/api/client.ts`: `fetch` com `Authorization: Bearer` quando houver sessão. Tratar os erros:
  - 401: limpa a sessão e manda pro `/entrar`;
  - 429: lança erro com a mensagem do Kong;
  - 400 com `HttpValidationProblemDetails`: devolve os erros por campo.
- `src/api/types.ts`: tipos a partir das respostas (seção 3 do design + Parte A). Enums como string.
- Componentes base: `Header` (menu, carrinho com contador, usuário), `Toast` (avisos empilhados no canto), `GameCover` (imagem ou placeholder com gradiente derivado do nome), `Pagination`, `ConfirmDialog`.
- `public/covers/`: 6 a 10 imagens de exemplo, geradas localmente (SVG com gradiente e título, por exemplo), sem baixar imagens de terceiros.

### C2. Sessão
- `AuthContext`: guarda `LoginResponse` em `localStorage`, calcula a expiração por `expiresIn` e expõe `user`, `isAdmin`, `login`, `logout`.
- Rotas protegidas: `RequireAuth` e `RequireAdmin`.
- Tela `/entrar` com duas abas, Entrar e Cadastrar. Cadastro com sucesso mostra o aviso "Cadastro efetuado" e vai pra aba Entrar com o e-mail já preenchido.

### C3. Catálogo (`/`)
- Destaque de promoções (`/catalog/games/promoted`): um grande e dois menores, com selo `-X%`, preço riscado e "até dd/mm".
- Filtro de gênero (enum `GameGenre`) e grade paginada (`/catalog/games`).
- Card: capa, nome, gênero, preço (riscado quando `hasDiscount`) e botão "+ Carrinho" ou selo "Na biblioteca".
- "Na biblioteca": para Player logado, buscar a biblioteca uma vez (todas as páginas com `pageSize` grande), guardar o conjunto de `gameId` em cache e reaproveitar em todas as telas. Invalidar quando um pedido for concluído.
- Admin não vê "+ Carrinho", porque a API bloqueia compra pra admin.

### C4. Carrinho, pagamento e pedidos
- `CartContext` em `localStorage`, guardando id, nome, preço atual e capa.
- `/carrinho`: itens, remover, total e botão "Ir para pagamento".
- `/pagamento`: aviso de simulação e opções fictícias (cartão de teste, Pix simulado com QR desenhado, boleto simulado), **sem nenhum campo de dado**. "Pagar" faz `POST /user/order` com os ids, limpa o carrinho e vai pra `/pedidos?novo=1`.
- `/pedidos`: `GET /user/order`. Com `novo=1`, marca como atual o `Draft` mais recente e mostra a linha do tempo. Consulta de novo a cada ~5 s enquanto houver `Draft` (TanStack Query `refetchInterval`) e para quando nenhum estiver em `Draft`. Na transição, mostra o aviso "Pedido aprovado — N jogos liberados na sua biblioteca" ou "Pagamento recusado — pedido cancelado". Se vier 429, mostra o aviso e espera 60 s antes de tentar de novo.
- Tabela de histórico: pedido (id curto), data, jogos, total e status com cor.

### C5. Biblioteca e Minha conta
- `/biblioteca`: `GET /library` paginado, capas via `GET /catalog/games/covers?ids=...` (um lote por página) e data de aquisição.
- `/conta`: formulário de nome, senha e confirmação (`PUT /my-account/update`). "Desativar conta" com confirmação → `PUT /my-account/deactivate-account` → logout.

### C6. Admin (`/admin`, só Admin)
- Layout com menu lateral: Jogos, Promoções, Usuários e Manutenção.
- **Jogos:** tabela (`GET /admin/games`) com busca local por nome e filtro ativo/inativo. Modal de cadastro/edição com nome, descrição, preço, gênero e capa (com pré-visualização e sugestões de `/covers/...`). Ativar/desativar com confirmação.
- **Promoções:** lista (`GET /admin/promotions`). Criar com jogo (select), valor, início e fim. Editar valor e data fim. Desativar.
- **Usuários:** lista e detalhe. Promover, rebaixar, reativar. Desativar com `DeactivationReason` (select).
- **Manutenção:** botões "Republicar jogos" e "Republicar usuários", com confirmação.
- Antes de escrever cada tela, conferir o contrato exato no `fcg-openapi-gateway.json`: nomes de campos, se o id vai no corpo ou na rota e o formato de data.

### C7. Fechamento
- Testes mínimos (Vitest): `client.ts` (401/429/validação), detecção da transição de status do pedido e cálculo do desconto.
- `npm run build` e `npm run lint` limpos.
- README do `fcg-frontend`: pré-requisitos (Node, ambiente do infra rodando, limites locais no `.env`), `npm install` e `npm run dev`.
- Teste manual de ponta a ponta pelo navegador:
  1. cadastrar e logar;
  2. ver o catálogo e as promoções com capa;
  3. colocar 2 jogos no carrinho e pagar;
  4. ver "processando" virar aprovado ou recusado;
  5. ver os jogos na biblioteca e o selo no catálogo;
  6. logar como admin e cadastrar um jogo com capa;
  7. criar uma promoção e ver o jogo no destaque.

---

## Fora deste plano
- CORS no Kong, Dockerfile/compose/k8s do front.
- Botão "forçar recusa" do pagamento.
- Upload de imagens.
