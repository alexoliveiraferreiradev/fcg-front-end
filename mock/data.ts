// Dados de exemplo para `npm run dev:mock`. Jogos, preços e descrições são inventados;
// o formato segue o contrato do Catalog depois da Parte A (coverUrl, originalPrice, gameId, endDate).

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
}

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const games: MockGame[] = [
  { id: id(1), name: 'Hollow Depths', genre: 'Metroidvania', originalPrice: 99.9, promoPrice: 59.94, promoEnd: '2026-10-31T23:59:00Z', coverUrl: '/covers/hollow-depths.svg', description: 'Desça por cavernas que mudam a cada ciclo de maré. Cada habilidade nova abre um caminho que você já tinha visto e não conseguia alcançar.' },
  { id: id(2), name: 'Neon Rally', genre: 'Racing', originalPrice: 49.9, promoPrice: 37.42, promoEnd: '2026-10-24T23:59:00Z', coverUrl: '/covers/neon-rally.svg', description: 'Corridas noturnas em circuitos de rua, com garagem para personalizar e campeonato on-line semanal.' },
  { id: id(3), name: 'Kingdom Tactics', genre: 'Strategy', originalPrice: 79.9, promoPrice: 39.95, promoEnd: '2026-11-05T23:59:00Z', coverUrl: '/covers/kingdom-tactics.svg', description: 'Estratégia por turnos em mapas de hexágonos. Recrute, negocie alianças e defenda o castelo antes do inverno.' },
  { id: id(4), name: 'Starfall Online', genre: 'MOBA', originalPrice: 0, coverUrl: '/covers/starfall-online.svg', description: 'Arenas 5 contra 5 com mais de 40 heróis. Gratuito para jogar.' },
  { id: id(5), name: 'Iron Front', genre: 'FPS', originalPrice: 149.9, coverUrl: '/covers/iron-front.svg', description: 'Tiro tático em equipe com destruição de cenário e partidas de 32 jogadores.' },
  { id: id(6), name: 'Farm Days', genre: 'Simulation', originalPrice: 29.9, description: 'Plante, colha e reforme a fazenda da família. Ritmo tranquilo, estações do ano e cooperativo local.' },
  { id: id(7), name: 'Ashen Oath', genre: 'Soulslike', originalPrice: 199.9, promoPrice: 149.92, promoEnd: '2026-10-28T23:59:00Z', coverUrl: '/covers/ashen-oath.svg', description: 'Um juramento quebrado, um reino em cinzas. Combate exigente, chefes memoráveis e nenhum mapa.' },
  { id: id(8), name: 'Pixel Pals', genre: 'Platformer', originalPrice: 19.9, promoPrice: 9.95, promoEnd: '2026-10-20T23:59:00Z', coverUrl: '/covers/pixel-pals.svg', description: 'Plataforma em dupla. Um pula, o outro segura. Feito para jogar no sofá com alguém.' },
  { id: id(9), name: 'Crimson Arena', genre: 'Fighting', originalPrice: 119.9, coverUrl: '/covers/crimson-arena.svg', description: 'Luta 2D com 24 personagens, modo história e rollback no on-line.' },
  { id: id(10), name: 'Deep Signal', genre: 'Horror', originalPrice: 59.9, coverUrl: '/covers/deep-signal.svg', description: 'Uma estação de pesquisa no fundo do mar parou de responder. Você é a equipe de resgate.' },
  { id: id(11), name: 'Wildlands Odyssey', genre: 'OpenWorld', originalPrice: 249.9, description: 'Um continente inteiro para explorar a cavalo, com clima dinâmico e mais de 200 missões.' },
  { id: id(12), name: 'Rune Tiles', genre: 'Puzzle', originalPrice: 14.9, description: 'Quebra-cabeças de runas que se encaixam em padrões. Mais de 300 fases.' },
  { id: id(13), name: 'Last Circle', genre: 'Battle_Royale', originalPrice: 0, coverUrl: '/covers/last-circle.svg', description: 'Cem jogadores, uma ilha e um círculo que fecha. Gratuito para jogar.' },
  { id: id(14), name: 'Dungeon Loop', genre: 'Roguelike', originalPrice: 39.9, coverUrl: '/covers/dungeon-loop.svg', description: 'Cada morte reinicia a masmorra, mas o que você aprendeu fica.' },
  { id: id(15), name: 'Chronicles of Vael', genre: 'RPG', originalPrice: 179.9, coverUrl: '/covers/chronicles-of-vael.svg', description: 'RPG de grupo com escolhas que mudam o mundo, seis companheiros e combate em tempo real pausável.' },
  { id: id(16), name: 'Goal Rush', genre: 'Sports', originalPrice: 89.9, coverUrl: '/covers/goal-rush.svg', description: 'Futebol arcade de cinco contra cinco, com partidas de quatro minutos.' },
  { id: id(17), name: 'Lantern Path', genre: 'Adventure', originalPrice: 44.9, coverUrl: '/covers/lantern-path.svg', description: 'Uma menina, uma lanterna e uma floresta que só existe de noite.' },
  { id: id(18), name: 'Byte Garden', genre: 'Indie', originalPrice: 24.9, coverUrl: '/covers/byte-garden.svg', description: 'Cultive plantas feitas de código e veja o jardim crescer sozinho enquanto você dorme.' },
  { id: id(19), name: 'Steel Horizon', genre: 'Action', originalPrice: 129.9, coverUrl: '/covers/steel-horizon.svg', description: 'Ação em terceira pessoa com mechas customizáveis e campanha cooperativa para dois.' },
  { id: id(20), name: 'Court Kings', genre: 'Sport', originalPrice: 69.9, coverUrl: '/covers/court-kings.svg', description: 'Basquete de rua três contra três, com quadras do mundo todo.' },
  { id: id(21), name: 'Echoes of the Spire', genre: 'RPG', originalPrice: 99.9, coverUrl: '/covers/echoes-of-the-spire.svg', description: 'Suba uma torre infinita com um grupo de mercenários e decida quem sobrevive.' },
  { id: id(22), name: 'Turbo Karts Deluxe Championship Edition', genre: 'Racing', originalPrice: 79.9, coverUrl: '/covers/turbo-karts-deluxe-championship-edition.svg', description: 'Corrida de kart com itens, 48 pistas e modo batalha. Nome comprido de propósito.' },
  { id: id(23), name: 'Silent Ward', genre: 'Horror', originalPrice: 49.9, coverUrl: '/covers/silent-ward.svg', description: 'Um hospital abandonado e uma câmera com pouca bateria.' },
  { id: id(24), name: 'Orbital Command', genre: 'Strategy', originalPrice: 89.9, coverUrl: '/covers/orbital-command.svg', description: 'Estratégia em tempo real no espaço, com gravidade, órbitas e frotas inteiras.' },
  { id: id(25), name: 'Mosaic Mind', genre: 'Puzzle', originalPrice: 9.9, coverUrl: '/covers/mosaic-mind.svg', description: 'Monte mosaicos sem tempo nem pontuação.' },
  { id: id(26), name: 'Blade Saga', genre: 'Action', originalPrice: 59.9, coverUrl: '/covers/blade-saga.svg', description: 'Hack and slash com combos aéreos e trilha de rock.' },
]

/** Jogos que o Player de exemplo já tem na biblioteca. */
export const ownedIds = [id(4), id(9)]
