---
version: 1
slug: "src-pages-catalog-tsx"
primary_target: "src/pages/Catalog.tsx"
related_targets: []
---

# Catálogo (`/`)

Brief aprovado pelo autor em 2026-10-16 (`/impeccable shape catálogo`). Sem direction contract: a direção visual é o rascunho aprovado (`docs/superpowers/specs/2026-10-16-fcg-frontend-mockup.html`), sem rodada de conceito.

## Trabalho e público
- Página inicial, pública. Chega o autor (como Player ou Admin) testando o fluxo, ou quem assiste a uma demo.
- Modo: **Operate**. Sucesso = achar um jogo e colocá-lo no carrinho, provando que o Catalog responde pelo Kong e que a biblioteca é cruzada com o catálogo.

## Resultado e prova
- Ação principal: "+ Carrinho". Secundárias: filtrar por gênero, abrir o painel de detalhe.
- Dados só das APIs: `/catalog/games/promoted`, `/catalog/games` (paginado, `genre`) e `/library` (selo "Na biblioteca"). Nada de preço, desconto ou data inventados.

## Direção
- Mundo visual do rascunho aprovado, como ponto de partida, não redesign.
- Composição fixa: destaque de promoções → filtro → grade → paginação.
- Momento memorável: o destaque de promoções (card grande com `-X%`, preço riscado, "até dd/mm").

## Escopo e limites
- Inclui: cabeçalho, destaque, filtro, grade, paginação e **painel lateral de detalhe** (sem rota nova).
- Não inclui: carrinho, pagamento, demais telas.
- Anti-metas: Admin vendo "+ Carrinho"; preço/desconto calculados no front além do % do selo (derivado de `originalPrice` e preço atual); qualquer chamada fora de `/api`.

## Estados e volumes
- Promoções: 0 → seção some · 1 → só o grande · 2 → grande + 1 menor · 3 → layout aprovado · 4+ → os 3 maiores descontos no destaque e o resto numa faixa rolável abaixo, **ordenada por maior desconto**.
- Grade: carregando = esqueletos na proporção 3:4 · vazia no gênero = mensagem + "Ver todos" · erro = aviso + "Tentar de novo" · 429 = mensagem do Kong e nova tentativa depois.
- Card: capa (`coverUrl`) ou placeholder com gradiente e nome. Desconto = riscado + selo. **Preço 0 aparece como "Grátis".** Nome com no máximo 2 linhas.
- Visitante:
  - **Deslogado:** "+ Carrinho" leva a `/entrar`; após o login volta ao catálogo com o jogo já no carrinho e um aviso.
  - **Player:** "+ Carrinho", "Na biblioteca", ou "No carrinho" (leva a `/carrinho`) quando já adicionado.
  - **Admin:** nenhuma ação de compra no card nem no painel.

## Interação e layout
- Clique no card (fora do botão) abre o painel lateral: capa grande, nome, gênero, descrição, preço (com fim da promoção) e a mesma ação do card. Fecha com Esc, clique fora ou ×; foco preso no painel e devolvido ao card ao fechar.
- Filtro: botões com o enum `GameGenre` + "Todos". Filtro e página na URL (`?genero=RPG&pagina=2`), para F5 e voltar funcionarem.
- Responsivo: grade fluida; no celular o destaque vira coluna única e o painel ocupa a tela inteira.
- "+ Carrinho": o contador do cabeçalho atualiza e o botão vira "No carrinho". Sem aviso a cada clique.

## Restrições e decisões em aberto
- Conferir no `fcg-openapi-gateway.json` a lista exata do `GameGenre` e os campos do card.
- Fica para o builder: tamanho de página (sugestão: 12) e o desenho do placeholder.
- Acessibilidade básica: foco visível, painel navegável por teclado, preço riscado lido como "de R$ X por R$ Y".
- Caminho do arquivo `src/pages/Catalog.tsx` é provisório; se a estrutura de pastas mudar, mover o brief.
