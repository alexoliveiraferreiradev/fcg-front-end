// Dados de exemplo para `npm run dev:mock`. Jogos, preços e descrições são inventados;
// o formato segue o contrato do Catalog depois da Parte A (coverUrl, originalPrice, gameId, endDate), com os gêneros em português.

export interface MockGame {
  id: string
  name: string
  description: string
  genre: string
  originalPrice: number
  /** Preço promocional, quando houver promoção ativa. */
  promoPrice?: number
  promoEnd?: string
  coverUrl?: string
  /** Notas que já existiam no Catalog: soma e quantidade, como o Game guarda (RatingSum/RatingCount). */
  ratings?: { sum: number; count: number }
  /** Desativado pelo Admin: some do catálogo e das promoções, mas segue nas capas e na biblioteca de quem comprou. */
  inactive?: boolean
}

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const games: MockGame[] = [
  { id: id(1), ratings: { sum: 984.4, count: 214 }, name: 'Hollow Depths', genre: 'Metroidvania', originalPrice: 99.9, promoPrice: 59.94, promoEnd: '2026-10-31T23:59:00Z', coverUrl: '/covers/hollow-depths.svg', description: 'Desça por cavernas que mudam a cada ciclo de maré. Cada habilidade nova abre um caminho que você já tinha visto e não conseguia alcançar.' },
  { id: id(2), ratings: { sum: 339.3, count: 87 }, name: 'Neon Rally', genre: 'Corrida', originalPrice: 49.9, promoPrice: 37.42, promoEnd: '2026-10-24T23:59:00Z', coverUrl: '/covers/neon-rally.svg', description: 'Corridas noturnas em circuitos de rua, com garagem para personalizar e campeonato on-line semanal.' },
  { id: id(3), ratings: { sum: 235.2, count: 56 }, name: 'Kingdom Tactics', genre: 'Estrategia', originalPrice: 79.9, promoPrice: 39.95, promoEnd: '2026-11-05T23:59:00Z', coverUrl: '/covers/kingdom-tactics.svg', description: 'Estratégia por turnos em mapas de hexágonos. Recrute, negocie alianças e defenda o castelo antes do inverno.' },
  { id: id(4), ratings: { sum: 3732.4, count: 1204 }, name: 'Starfall Online', genre: 'MOBA', originalPrice: 0, coverUrl: '/covers/starfall-online.svg', description: 'Arenas 5 contra 5 com mais de 40 heróis. Gratuito para jogar.' },
  { id: id(5), ratings: { sum: 1403.6, count: 319 }, name: 'Iron Front', genre: 'FPS', originalPrice: 149.9, coverUrl: '/covers/iron-front.svg', description: 'Tiro tático em equipe com destruição de cenário e partidas de 32 jogadores.' },
  { id: id(6), name: 'Farm Days', genre: 'Simulacao', originalPrice: 29.9, description: 'Plante, colha e reforme a fazenda da família. Ritmo tranquilo, estações do ano e cooperativo local.' },
  { id: id(7), ratings: { sum: 4516.8, count: 941 }, name: 'Ashen Oath', genre: 'Soulslike', originalPrice: 199.9, promoPrice: 149.92, promoEnd: '2026-10-28T23:59:00Z', coverUrl: '/covers/ashen-oath.svg', description: 'Um juramento quebrado, um reino em cinzas. Combate exigente, chefes memoráveis e nenhum mapa.' },
  { id: id(8), ratings: { sum: 48.0, count: 12 }, name: 'Pixel Pals', genre: 'Plataforma', originalPrice: 19.9, promoPrice: 9.95, promoEnd: '2026-10-20T23:59:00Z', coverUrl: '/covers/pixel-pals.svg', description: 'Plataforma em dupla. Um pula, o outro segura. Feito para jogar no sofá com alguém.' },
  { id: id(9), ratings: { sum: 166.5, count: 45 }, name: 'Crimson Arena', genre: 'Luta', originalPrice: 119.9, coverUrl: '/covers/crimson-arena.svg', description: 'Luta 2D com 24 personagens, modo história e rollback no on-line.' },
  { id: id(10), ratings: { sum: 94.3, count: 23 }, name: 'Deep Signal', genre: 'Terror', originalPrice: 59.9, coverUrl: '/covers/deep-signal.svg', description: 'Uma estação de pesquisa no fundo do mar parou de responder. Você é a equipe de resgate.' },
  { id: id(11), inactive: true, name: 'Wildlands Odyssey', genre: 'MundoAberto', originalPrice: 249.9, description: 'Um continente inteiro para explorar a cavalo, com clima dinâmico e mais de 200 missões.' },
  { id: id(12), name: 'Rune Tiles', genre: 'QuebraCabeca', originalPrice: 14.9, description: 'Quebra-cabeças de runas que se encaixam em padrões. Mais de 300 fases.' },
  { id: id(13), ratings: { sum: 6409.0, count: 2210 }, name: 'Last Circle', genre: 'Battle_Royale', originalPrice: 0, coverUrl: '/covers/last-circle.svg', description: 'Cem jogadores, uma ilha e um círculo que fecha. Gratuito para jogar.' },
  { id: id(14), ratings: { sum: 4.5, count: 1 }, name: 'Dungeon Loop', genre: 'Roguelike', originalPrice: 39.9, coverUrl: '/covers/dungeon-loop.svg', description: 'Cada morte reinicia a masmorra, mas o que você aprendeu fica.' },
  { id: id(15), ratings: { sum: 1889.4, count: 402 }, name: 'Chronicles of Vael', genre: 'RPG', originalPrice: 179.9, coverUrl: '/covers/chronicles-of-vael.svg', description: 'RPG de grupo com escolhas que mudam o mundo, seis companheiros e combate em tempo real pausável.' },
  { id: id(16), name: 'Goal Rush', genre: 'Esportes', originalPrice: 89.9, coverUrl: '/covers/goal-rush.svg', description: 'Futebol arcade de cinco contra cinco, com partidas de quatro minutos.' },
  { id: id(17), ratings: { sum: 77.4, count: 18 }, name: 'Lantern Path', genre: 'Aventura', originalPrice: 44.9, coverUrl: '/covers/lantern-path.svg', description: 'Uma menina, uma lanterna e uma floresta que só existe de noite.' },
  { id: id(18), name: 'Byte Garden', genre: 'Indie', originalPrice: 24.9, coverUrl: '/covers/byte-garden.svg', description: 'Cultive plantas feitas de código e veja o jardim crescer sozinho enquanto você dorme.' },
  { id: id(19), ratings: { sum: 30.6, count: 9 }, name: 'Steel Horizon', genre: 'Acao', originalPrice: 129.9, coverUrl: '/covers/steel-horizon.svg', description: 'Ação em terceira pessoa com mechas customizáveis e campanha cooperativa para dois.' },
  { id: id(20), name: 'Court Kings', genre: 'Esporte', originalPrice: 69.9, coverUrl: '/covers/court-kings.svg', description: 'Basquete de rua três contra três, com quadras do mundo todo.' },
  { id: id(21), ratings: { sum: 256.0, count: 64 }, name: 'Echoes of the Spire', genre: 'RPG', originalPrice: 99.9, coverUrl: '/covers/echoes-of-the-spire.svg', description: 'Suba uma torre infinita com um grupo de mercenários e decida quem sobrevive.' },
  { id: id(22), ratings: { sum: 18.0, count: 5 }, name: 'Turbo Karts Deluxe Championship Edition', genre: 'Corrida', originalPrice: 79.9, coverUrl: '/covers/turbo-karts-deluxe-championship-edition.svg', description: 'Corrida de kart com itens, 48 pistas e modo batalha. Nome comprido de propósito.' },
  { id: id(23), name: 'Silent Ward', genre: 'Terror', originalPrice: 49.9, coverUrl: '/covers/silent-ward.svg', description: 'Um hospital abandonado e uma câmera com pouca bateria.' },
  { id: id(24), ratings: { sum: 127.1, count: 31 }, name: 'Orbital Command', genre: 'Estrategia', originalPrice: 89.9, coverUrl: '/covers/orbital-command.svg', description: 'Estratégia em tempo real no espaço, com gravidade, órbitas e frotas inteiras.' },
  { id: id(25), name: 'Mosaic Mind', genre: 'QuebraCabeca', originalPrice: 9.9, coverUrl: '/covers/mosaic-mind.svg', description: 'Monte mosaicos sem tempo nem pontuação.' },
  { id: id(26), ratings: { sum: 5.0, count: 2 }, name: 'Blade Saga', genre: 'Acao', originalPrice: 59.9, coverUrl: '/covers/blade-saga.svg', description: 'Hack and slash com combos aéreos e trilha de rock.' },
]

/** Biblioteca do Player de exemplo: 14 jogos (paginação com 12 por página), Farm Days sem capa, 5 já avaliados, Wildlands Odyssey fora da loja. */
export const owned: { id: string; acquiredAt: string; rating?: number }[] = [
  { id: id(4), acquiredAt: '2026-10-12T09:45:00Z', rating: 3 },
  { id: id(9), acquiredAt: '2026-10-12T09:45:00Z', rating: 4 },
  { id: id(6), acquiredAt: '2026-10-10T21:03:00Z' },
  { id: id(15), acquiredAt: '2026-10-08T18:20:00Z', rating: 5 },
  { id: id(2), acquiredAt: '2026-10-05T12:00:00Z', rating: 4 },
  { id: id(18), acquiredAt: '2026-10-03T08:30:00Z' },
  { id: id(21), acquiredAt: '2026-09-28T22:10:00Z' },
  { id: id(13), acquiredAt: '2026-09-21T14:45:00Z' },
  { id: id(24), acquiredAt: '2026-09-15T10:00:00Z' },
  { id: id(7), acquiredAt: '2026-09-02T19:30:00Z', rating: 5 },
  { id: id(17), acquiredAt: '2026-08-27T16:15:00Z' },
  { id: id(25), acquiredAt: '2026-08-20T11:05:00Z' },
  { id: id(11), acquiredAt: '2026-08-14T09:00:00Z' },
]

/** Jogo comprado que não existe mais no catálogo (como depois de zerar o banco do Catalog): só a biblioteca o conhece. */
export const orphan = {
  gameId: '99999999-0000-4000-8000-000000000001',
  gameName: 'Jogo Removido do Catalogo',
  description: 'Comprado antes de o catálogo ser recriado. O Catalog não conhece mais este id.',
  // Gênero em inglês de propósito: a UserLibrary guardou o nome de antes da troca para português.
  genre: 'Adventure',
  acquiredAt: '2026-07-30T13:00:00Z',
}
