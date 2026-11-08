import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import sharp from 'sharp';
export const demoId = (key: string) => {
  const h = createHash('sha256')
    .update('vivabairro-demo:' + key)
    .digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
export async function populateDemo(db: PoolClient, passwordHash: string) {
  const people = [
    ['ana', 'Ana (demonstração)', 'aurora'],
    ['bruno', 'Bruno (demonstração)', 'aurora'],
    ['carla', 'Carla (demonstração)', 'centro'],
    ['diego', 'Diego (demonstração)', 'esperanca'],
    ['elisa', 'Elisa (demonstração)', 'aurora'],
    ['felipe', 'Felipe (demonstração)', 'centro'],
    ['gabriela', 'Gabriela (demonstração)', 'esperanca'],
    ['hugo', 'Hugo (demonstração)', 'aurora'],
  ];
  for (const [key, name, area] of people) {
    await db.query(
      'INSERT INTO accounts(id,name,email,password_hash,neighborhood_id,email_verified_at) VALUES($1,$2,$3,$4,$5,now()) ON CONFLICT(email) DO NOTHING',
      [demoId(key), name, key + '@vivabairro.test', passwordHash, area],
    );
  }
  // Registra os IDs existentes: rodar novamente não troca senhas nem sobrescreve publicações.
  const accounts = (
    await db.query(
      "SELECT id,email FROM accounts WHERE email LIKE '%@vivabairro.test' AND deleted_at IS NULL",
    )
  ).rows;
  const ids = Object.fromEntries(accounts.map((a) => [a.email.split('@')[0], a.id]));
  for (const account of accounts)
    await db.query("INSERT INTO demo_records VALUES('account',$1) ON CONFLICT DO NOTHING", [
      account.id,
    ]);
  const events: [string, string, string, string, string, number, number | null, string][] = [
    [
      'feira',
      'ana',
      'aurora',
      'Feira de trocas na praça',
      'Traga livros, brinquedos e objetos em bom estado para trocar com a vizinhança.',
      2,
      30,
      'aberto',
    ],
    [
      'caminhada',
      'bruno',
      'aurora',
      'Caminhada pelo bairro',
      'Percurso leve em grupo. Leve água e escolha um ritmo confortável.',
      1,
      20,
      'aberto',
    ],
    [
      'leitura',
      'elisa',
      'aurora',
      'Roda de leitura',
      'Uma tarde para conversar sobre livros e compartilhar indicações.',
      4,
      12,
      'aberto',
    ],
    [
      'musica',
      'hugo',
      'aurora',
      'Música na praça',
      'Encontro comunitário com apresentações de artistas locais.',
      6,
      null,
      'aberto',
    ],
    [
      'oficina',
      'ana',
      'aurora',
      'Oficina de compostagem',
      'Atividade demonstrativa sobre separação de resíduos orgânicos.',
      3,
      3,
      'aberto',
    ],
    [
      'cancelado',
      'bruno',
      'aurora',
      'Piquenique comunitário',
      'Exemplo de evento cancelado pelo organizador. Uma nova data será divulgada.',
      5,
      25,
      'cancelado',
    ],
    [
      'passado',
      'elisa',
      'aurora',
      'Mutirão de pintura — realizado',
      'Exemplo de atividade encerrada, mantida no histórico da comunidade.',
      -3,
      15,
      'aberto',
    ],
    [
      'esporte',
      'carla',
      'centro',
      'Manhã de jogos na quadra',
      'Jogos recreativos para conhecer outros moradores.',
      3,
      24,
      'aberto',
    ],
    [
      'artesanato',
      'felipe',
      'centro',
      'Encontro de artesanato',
      'Compartilhe técnicas e conheça projetos de artesanato do bairro.',
      7,
      16,
      'aberto',
    ],
    [
      'horta',
      'diego',
      'esperanca',
      'Plantio na horta comunitária',
      'Preparação de canteiros e troca de conhecimentos sobre cultivo.',
      2,
      18,
      'aberto',
    ],
    [
      'cinema',
      'gabriela',
      'esperanca',
      'Sessão comunitária de cinema',
      'Encontro para conversar sobre cinema e convivência no bairro.',
      8,
      40,
      'aberto',
    ],
    [
      'amanha',
      'ana',
      'aurora',
      'Encontro de boas-vindas',
      'Evento de demonstração nas próximas 24 horas para testar lembretes.',
      0.5,
      20,
      'aberto',
    ],
  ];
  for (const [key, author, area, title, description, days, capacity, state] of events) {
    if (!ids[author]) continue;
    const id = demoId('event:' + key),
      photo = demoId('photo:' + key);
    const hue = key.length % 2 === 0 ? '#286A72' : '#D67A45';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="480"><rect width="900" height="480" fill="#E4F3F1"/><circle cx="720" cy="120" r="70" fill="#FFD166"/><path d="M0 360Q200 200 450 340T900 260V480H0Z" fill="${hue}"/><path d="M100 320V210L180 140L260 210V320Z" fill="#14253D"/><rect x="165" y="240" width="30" height="80" fill="#FFD166"/><text x="320" y="205" fill="#14253D" font-family="Arial" font-size="36" font-weight="bold">VivaBairro</text><text x="320" y="250" fill="#286A72" font-family="Arial" font-size="20">Encontros da comunidade</text><text x="30" y="450" fill="white" font-family="Arial" font-size="17">ILUSTRAÇÃO · DADOS FICTÍCIOS</text></svg>`;
    const image = await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();
    await db.query(
      'INSERT INTO media(id,owner_id,mime,data) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',
      [photo, ids[author], 'image/jpeg', image],
    );
    await db.query(
      "INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,starts_at,ends_at,capacity,state,photo_id) VALUES($1,$2,$3,'event',$4,$5,$6,now()+($7 * interval '1 day'),now()+($7 * interval '1 day')+interval '2 hours',$8,$9,$10) ON CONFLICT DO NOTHING",
      [
        id,
        ids[author],
        area,
        title,
        description + ' Atividade fictícia, criada para demonstração.',
        'Espaço comunitário de demonstração',
        days,
        capacity,
        state,
        photo,
      ],
    );
    await db.query("INSERT INTO demo_records VALUES('post',$1) ON CONFLICT DO NOTHING", [id]);
    const attendees =
      key === 'oficina'
        ? ['carla', 'diego', 'elisa']
        : key === 'amanha'
          ? ['morador', 'bruno']
          : ['ana', 'carla'];
    for (const name of attendees)
      if (ids[name])
        await db.query(
          'INSERT INTO participations(post_id,account_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
          [id, ids[name]],
        );
  }
  const notices = [
    [
      'arvore',
      'bruno',
      'aurora',
      'Galho bloqueando parte da calçada',
      'Exemplo fictício de aviso sobre um galho na passagem. A área precisa de avaliação.',
      'infraestrutura',
      'aberto',
    ],
    [
      'eletricista',
      'ana',
      'aurora',
      'Alguém indica profissional de elétrica?',
      'Procuro indicação de profissional para um serviço residencial. Compartilhe a indicação sem divulgar dados pessoais de terceiros.',
      'ajuda',
      'aberto',
    ],
    [
      'chaves',
      'elisa',
      'aurora',
      'Chaveiro encontrado perto da praça',
      'Exemplo de achado. Quem perdeu pode descrever o objeto na conversa.',
      'achados-perdidos',
      'aberto',
    ],
    [
      'poste',
      'hugo',
      'aurora',
      'Iluminação da praça em acompanhamento',
      'Aviso demonstrativo que já está sendo acompanhado pela comunidade.',
      'infraestrutura',
      'em-andamento',
    ],
    [
      'livros',
      'ana',
      'aurora',
      'Doação de livros concluída',
      'Os livros do exemplo já encontraram novos leitores. Obrigado pela participação.',
      'ajuda',
      'resolvido',
    ],
    [
      'transito',
      'carla',
      'centro',
      'Mudança temporária de circulação',
      'Simulação de aviso de trânsito. Consulte sempre as orientações oficiais antes de sair.',
      'transito',
      'aberto',
    ],
    [
      'costura',
      'felipe',
      'centro',
      'Ofereço ajuda com pequenos reparos de costura',
      'Exemplo de colaboração entre moradores. Podemos combinar os detalhes pela conversa do aviso.',
      'ajuda',
      'aberto',
    ],
    [
      'coleta',
      'diego',
      'esperanca',
      'Dúvida sobre coleta seletiva',
      'Onde a comunidade costuma consultar os dias de coleta? Este é um aviso fictício para demonstração.',
      'utilidade-publica',
      'aberto',
    ],
    [
      'praca',
      'gabriela',
      'esperanca',
      'Banco da praça reparado',
      'Exemplo de aviso resolvido após acompanhamento dos moradores.',
      'infraestrutura',
      'resolvido',
    ],
    [
      'bola',
      'bruno',
      'aurora',
      'Bola encontrada na quadra',
      'O objeto deste exemplo já foi devolvido. Aviso encerrado.',
      'achados-perdidos',
      'encerrado',
    ],
  ];
  for (const [key, author, area, title, description, category, state] of notices) {
    if (!ids[author]) continue;
    const id = demoId('notice:' + key);
    await db.query(
      "INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,category,state) VALUES($1,$2,$3,'notice',$4,$5,'Local fictício de demonstração',$6,$7) ON CONFLICT DO NOTHING",
      [id, ids[author], area, title, description, category, state],
    );
    await db.query("INSERT INTO demo_records VALUES('post',$1) ON CONFLICT DO NOTHING", [id]);
    if (ids.elisa)
      await db.query(
        'INSERT INTO replies(id,post_id,author_id,body) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',
        [
          demoId('reply:' + key),
          id,
          ids.elisa,
          'Resposta de demonstração: obrigada por compartilhar. Vamos acompanhar por aqui.',
        ],
      );
  }
  if (ids.admin)
    await db.query(
      "INSERT INTO posts(id,author_id,neighborhood_id,kind,title,description,location,issuer) VALUES($1,$2,'aurora','official','Comunicado municipal de demonstração','Exemplo fictício de publicação identificada da administração municipal. Não representa uma prefeitura real.','Município de demonstração','Administração fictícia') ON CONFLICT DO NOTHING",
      [demoId('official'), ids.admin],
    );
}
