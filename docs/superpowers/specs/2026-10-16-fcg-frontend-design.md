# FCG Front-end — Documento de Design

Data: 2026-10-16
Rascunho visual aprovado: [2026-10-16-fcg-frontend-mockup.html](2026-10-16-fcg-frontend-mockup.html)

## 1. Intenção

O FIAP Cloud Games (FCG) é um conjunto de microsserviços .NET (Users, Catalog, Order, Payments, UserLibrary e Notifications/Function) exposto através do Kong. Hoje o autor testa tudo pelo Postman, endpoint a endpoint.

O front-end existe para **testar e visualizar o ecossistema funcionando**, unindo todos os serviços numa única aplicação com cara de biblioteca/loja de jogos. O foco acadêmico do projeto continua sendo o back-end. O front **não** é vitrine para avaliador: precisa ser agradável e coerente, não sofisticado.

**Sucesso:** o autor consegue, sem Postman, cadastrar-se, logar, navegar no catálogo (com promoções em destaque), comprar um ou mais jogos via pagamento simulado, ver o pedido mudar de "processando" para aprovado/recusado, ver os jogos na biblioteca e, como admin, gerenciar jogos, promoções e usuários.

## 2. Metas, não-metas e anti-metas

**Metas**
- Cobrir todas as rotas expostas pelo Kong (`fcg-openapi-gateway.json`), de jogador e de admin.
- Mostrar o fluxo assíncrono da compra de forma visível (pedido → processando → aprovado/recusado → biblioteca).
- Mostrar avisos do tipo "Cadastro efetuado", "Pedido aprovado", "Pagamento recusado", espelhando os e-mails simulados da Notification Function.
- Identidade visual inspirada no site da FIAP.

**Não-metas**
- Pagamento real ou coleta de qualquer dado de pagamento real.
- Caixa de entrada de e-mails / leitura dos logs da Function.
- Deploy em produção, SEO, internacionalização, acessibilidade além do básico razoável.
- Botão "forçar recusa" do pagamento (exigiria mudar a Payments API — ideia registrada, fora do escopo).

**Anti-metas (seria falha mesmo funcionando)**
- O front chamar qualquer serviço diretamente, sem passar pelo Kong.
- A tela de pagamento pedir número de cartão, CPF ou qualquer dado que pareça real.
- Esconder do usuário o caráter assíncrono da compra (ex.: mostrar "comprado!" imediatamente após o POST).

## 3. Restrições conhecidas (levantadas no código)

- **Gateway:** Kong em `http://localhost:8000` (docker-compose do `fcg-infrastructure`). Rotas e contratos em `fcg-openapi-gateway.json`.
- **Mensageria:** a comunicação entre serviços migrou de RabbitMQ para Azure Service Bus (já no `main` do `fcg-infrastructure`). Irrelevante para o front, que só fala HTTP com o Kong.
- **CORS:** o Kong não tem plugin CORS. Será configurado depois; em desenvolvimento o proxy do Vite resolve.
- **Autenticação:** `POST /user/sign-in` retorna `LoginResponse { acessToken, expiresIn, id, email, claims[], perfilUser }` (atenção: `acessToken` com um "c" só). Rotas protegidas usam `Authorization: Bearer <token>` (plugin `jwt` do Kong + policies nas APIs).
- **Perfis:** `Player` e `Admin`. `/user/order` exige a policy `PlayersOnly` — admin não compra.
- **Enums** trafegam como string (`JsonStringEnumConverter`) — ex.: `genre: "RPG"`, `status: "Draft"`.
- **Paginação:** `PagedResult<T> { items, pageNumber, pageSize, totalItems, totalPages }` em `/catalog/games` (`genre`, `page`, `pageSize`) e `/library` (`page`, `pageSize`).
- **Compra:** `POST /user/order` recebe um array de GUIDs de jogos e retorna **200 sem corpo** (nenhum id de pedido). O pedido nasce `Draft`; vira `Completed` ou `Cancelled` de forma assíncrona (Payments simula ~90% de aprovação). `GET /user/order` retorna `OrderHistoryResponse[] { orderId, orderDate, status, totalAmount, items[{ gameId, gameName, paidPrice }] }`.
- **Biblioteca:** `GET /library` retorna `UserLibraryItemResponse { gameId, gameName, description, genre, acquiredAt }` — sem preço nem capa.
- **Rate limiting do Kong (crítico para o fluxo de compra):**
  - `/user/order`: **2 req/min** (POST e GET somados)
  - `/library`: **2 req/min**
  - `/catalog/games`: 5/s, 10/min · `/admin/games` e `/admin/promotions`: 5/min · `/admin/users` e `/my-account`: 10/min · sign-in/register: 5/min
  - Nenhuma rota define `limit_by`, então o limite é por consumer. Todo JWT cai no único consumer `fcg-cliente`, e por isso todos os usuários e abas dividem o mesmo balde.
  - Erro de limite vem com a mensagem "Você enviou muitos requests. Por favor tente mais tarde." (HTTP 429).

## 4. Decisões tomadas

### 4.1 Do autor
- Front unifica todos os serviços, sempre via Kong.
- O catálogo é a tela principal, com promoções em destaque.
- Escopo: jogador (catálogo, login/cadastro, compra, pedidos, biblioteca, minha conta) **e** admin (jogos, promoções, usuários).
- Tela de pagamento **simulada**, sem dados reais.
- Notificações: avisos na tela com o resultado ("Pedido aprovado", "Cadastro efetuado"), sem caixa de entrada.
- Capa dos jogos: adicionar no back-end (Catalog) o caminho/URL da imagem.
- CORS no Kong: fica para depois.
- Identidade visual da FIAP (fiap.com.br), **com a fonte do sistema** (não Montserrat/Gotham).
- **Rate limit:** limites folgados só no ambiente local. A entrega e o k8s mantêm os valores atuais (ver seção 7).
- **Capa:** link (texto) digitado pelo admin, sem upload (ver seção 8).
- Tecnologia do front: delegada ao Claude (ver 4.2).
- Rascunho visual (catálogo, pagamento, pedidos) aprovado como está, incluindo carrinho e selo "Na biblioteca".

### 4.2 Do Claude (o autor pode reverter)
- **Stack:** React + TypeScript + Vite. Proxy do Vite (`/api` → `http://localhost:8000`) contorna CORS em dev.
- **Repositório novo:** `fcg-frontend`, ao lado dos demais `fcg-*`.
- **Avisos de resultado** são derivados das respostas das APIs (cadastro OK; pedido mudou de `Draft` para `Completed`/`Cancelled`), não da Function — o front não tem como observar a Function.
- **Carrinho** com vários jogos (a API já aceita lista), guardado no navegador.
- **Selo "Na biblioteca"** no catálogo, cruzando o catálogo com `/library`.
- **Capa na biblioteca:** o front busca as capas por um novo endpoint público em lote do Catalog (seção 6), que devolve também jogos desativados. Assim não muda evento nem contrato da UserLibrary, e a capa editada pelo admin aparece na hora (não existe evento de "jogo atualizado").
- **Mudança no Catalog** (capa + campos que faltam pro rascunho aprovado) é um passo separado, feito antes do front.
- **Admin** é construído a partir da descrição em texto da seção 5, sem esperar outro rascunho, no mesmo estilo das telas de jogador. Fica por último na ordem de construção.
- **Execução:** só `npm run dev` (Vite) por enquanto. Dockerfile/compose/k8s do front e CORS no Kong ficam para quando o CORS for configurado.
- **Pedido recém-criado:** como o POST não devolve id, o front identifica o novo pedido como o `Draft` mais recente no histórico logo após o POST.

## 5. Telas

Identidade: fundo preto `#000`, painéis `#0E0F10`/`#181818`, linhas `#2B2D30`, texto `#FFF`, texto secundário `#ACC1CC`, destaque rosa FIAP `#ED145B`. Cantos retos, títulos em caixa alta com espaçamento e um traço rosa antes, logo em texto "FIAP." com ponto rosa + "CLOUD GAMES". Fonte do sistema (`system-ui, Segoe UI, sans-serif`). Não usar arquivos de logo oficiais da FIAP.

Cabeçalho comum: logo · Catálogo · Minha biblioteca · Meus pedidos · Admin (só para Admin) · carrinho (contador) · usuário (e-mail + perfil) ou "Entrar".

1. **Catálogo (página inicial, pública)** — destaque de promoções no topo (`/catalog/games/promoted`), filtro por gênero (enum `GameGenre`), grade de cards: capa, nome, gênero, preço original riscado + preço atual quando `hasDiscount`, selo de desconto (%), botão "+ Carrinho" ou "Na biblioteca". Paginação.
2. **Entrar / Cadastrar** — uma tela, duas abas. Cadastro: nome, e-mail, senha, confirmação. Sucesso → aviso "Cadastro efetuado". Login guarda token e dados do usuário.
3. **Carrinho / Pagamento simulado** — resumo dos itens e total; aviso explícito de simulação; escolha fictícia de forma de pagamento (cartão de teste, Pix simulado, boleto simulado) **sem nenhum campo de dado**; botão "Pagar" → `POST /user/order`.
4. **Pedido / Meus pedidos** — linha do tempo do pedido atual (criado → processando → aprovado/recusado → na biblioteca) e tabela de histórico (`GET /user/order`). Ao mudar o status: aviso "Pedido aprovado" ou "Pagamento recusado".
5. **Minha biblioteca** — grade de capas (`/library`), paginada, com data de aquisição.
6. **Minha conta** — editar nome e senha (`PUT /my-account/update`, campos `name`, `password`, `confirmPassword`); desativar conta (`PUT /my-account/deactivate-account`) com confirmação.
7. **Admin** (menu lateral):
   - **Jogos:** lista (`GET /admin/games`), cadastrar (`POST`, incluindo capa), editar (`PUT /admin/games/{id}`), ativar/desativar.
   - **Promoções:** lista, criar (jogo, valor promocional, início, fim), editar (novo valor, nova data fim), desativar.
   - **Usuários:** lista, detalhe, promover, rebaixar, desativar (com motivo `DeactivationReason`), reativar.
   - **Manutenção** (discreto): "Republicar jogos" e "Republicar usuários".

Comportamentos transversais:
- Token expirado/401 → limpa sessão e volta para o login.
- 429 → aviso com a mensagem do Kong.
- Erros de validação (`HttpValidationProblemDetails`) aparecem junto aos campos.

## 6. Mudança no back-end (pré-requisito)

No `fcg-catalog-api` (decisão do Claude, para o rascunho aprovado ser construível):

1. **Capa:** novo campo de texto `coverUrl` no jogo (opcional), persistido, aceito em `AddGameCommand`/`UpdateGameCommand` e devolvido em `GameResponse` (admin), `GameUserResponse` (público) e `GamePromotionResponse` (promoções).
2. **Preço original no catálogo público:** hoje `GameUserResponse.OriginalPrice` tem `[JsonIgnore]`, então o card não consegue mostrar o preço riscado nem o % de desconto. Passar a expor `originalPrice`.
3. **Promoções públicas:** `GamePromotionResponse` não tem `gameId` (não dá pra pôr no carrinho) nem `endDate` (não dá pra mostrar "até 31/10"). Adicionar os dois.
4. **Capas em lote:** novo endpoint público `GET /catalog/games/covers?ids=...` devolvendo `{ gameId, name, coverUrl }` para os ids pedidos, **incluindo jogos desativados**. Não precisa de rota nova no Kong: o caminho já cai na rota `/catalog/games`, que casa por prefixo (como `/promoted`).
5. Atualizar o `swagger.json` do Catalog e o `fcg-openapi-gateway.json` (hoje eles não documentam `GameUserResponse`/`GamePromotionResponse`).

Jogos sem capa: o front mostra um placeholder com gradiente e o nome do jogo.

## 7. Mudança no Kong: limites locais (pré-requisito)

No `fcg-infrastructure`, o `kong/template/kong.yml.template` passa a ter placeholders para o `minute` das rotas `order-route` e `userlibrary-route` (ex.: `${ORDER_RATE_LIMIT_MINUTE}`, `${LIBRARY_RATE_LIMIT_MINUTE}`). O `generate-kong-config.ps1` lê esses valores do `.env` e, **se estiverem ausentes, usa 2**, o valor atual. Assim a entrega não muda de comportamento. O `.env.example` documenta que, pra usar o front em dev, convém algo como 60. Os manifests do k8s ficam como estão.

Mesmo com limites folgados, o front trata 429: mostra a mensagem do Kong e tenta de novo depois, sem quebrar a tela. A consulta de status do pedido acontece a cada poucos segundos (o intervalo fica a critério de quem constrói) e para quando o pedido sai de `Draft`.

## 8. Capa: link digitado

- O admin digita a capa como texto: um link externo ou um caminho servido pelo próprio front.
- O front traz uma pasta `public/covers/` com algumas imagens de exemplo, usadas como `/covers/<arquivo>`.
- Sem upload de arquivo, storage ou rota nova para servir imagens.
- O formulário de jogo mostra uma pré-visualização da capa a partir do link.

## 9. Ordem de construção

1. Catalog: capa, `originalPrice` público, `gameId`/`endDate` nas promoções, endpoint de capas em lote, OpenAPI.
2. Kong: placeholders de limite.
3. Front: base (Vite, proxy, tema, cabeçalho, sessão) → catálogo → login/cadastro → carrinho/pagamento/pedidos → biblioteca → minha conta → admin.

## 10. Deixado para quem for construir
- Estrutura de pastas, bibliotecas de roteamento/requisições/estado/estilo.
- Formato exato do placeholder de capa.
- Tamanho de página padrão.
- Testes: o mínimo razoável para um front de apoio a testes.

