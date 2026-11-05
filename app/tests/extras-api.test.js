// Foto do aviso, bairros acompanhados e lembretes pela API real.
import { iniciarServidor } from '../src/servidor/servidor.js';
import { criarRepositorio } from '../src/servidor/repositorio.js';

const PNG_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

let servidor;
let base;
let cookie = '';

async function chamar(caminho, metodo = 'GET', corpo) {
  const r = await fetch(base + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const definido = r.headers.get('set-cookie');
  if (definido) cookie = definido.split(';')[0];
  const tipo = r.headers.get('content-type') ?? '';
  return { status: r.status, tipo, corpo: tipo.startsWith('application/json') ? await r.json() : Buffer.from(await r.arrayBuffer()) };
}

const aviso = {
  titulo: 'Banco quebrado na praça',
  categoria: 'infraestrutura',
  bairroId: 'centro',
  local: 'Praça da Matriz',
  descricao: 'A tábua do banco perto da fonte soltou.',
};

beforeEach(async () => {
  servidor = await iniciarServidor(0, { repositorio: criarRepositorio(new Date()) });
  base = `http://localhost:${servidor.address().port}`;
  cookie = '';
  await chamar('/api/sessao/demonstracao', 'POST');
});

afterEach(() => new Promise((resolver) => servidor.close(resolver)));

test('aviso com foto: o JSON traz só o endereço e a foto é servida à parte', async () => {
  const criado = await chamar('/api/avisos', 'POST', { ...aviso, foto: PNG_1PX });
  expect(criado.status).toBe(201);
  expect(criado.corpo.aviso.fotoUrl).toMatch(/^\/api\/avisos\/.+\/foto$/);
  expect(JSON.stringify(criado.corpo)).not.toContain('base64');
  const foto = await chamar(criado.corpo.aviso.fotoUrl);
  expect(foto.status).toBe(200);
  expect(foto.tipo).toBe('image/png');
  expect(foto.corpo.subarray(1, 4).toString()).toBe('PNG');
});

test('foto inválida responde 422 no campo foto e não cria o aviso', async () => {
  const r = await chamar('/api/avisos', 'POST', { ...aviso, foto: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' });
  expect(r.status).toBe(422);
  expect(r.corpo.erros.foto).toBe('Use uma foto JPG, PNG ou WebP.');
  const feed = await chamar('/api/feed?bairro=centro');
  expect(feed.corpo.avisos).toEqual([]);
});

test('aviso sem foto continua funcionando', async () => {
  const r = await chamar('/api/avisos', 'POST', aviso);
  expect(r.status).toBe(201);
  expect(r.corpo.aviso.fotoUrl).toBeNull();
});

test('bairros acompanhados entram no feed "meus"', async () => {
  // A conta de demonstração tem Jardim Aurora como principal e acompanha o Centro.
  const antes = await chamar('/api/feed?bairro=meus');
  expect(new Set(antes.corpo.eventos.map((e) => e.bairroId))).toEqual(new Set(['jardim-aurora', 'centro']));

  const salvo = await chamar('/api/perfil', 'PATCH', { bairrosAcompanhados: ['vila-esperanca'] });
  expect(salvo.corpo.conta.bairrosAcompanhados).toEqual(['vila-esperanca']);
  const depois = await chamar('/api/feed?bairro=meus');
  expect(depois.corpo.eventos.some((e) => e.bairroId === 'centro')).toBe(false);
});

test('preferências inválidas respondem 422', async () => {
  expect((await chamar('/api/perfil', 'PATCH', { bairrosAcompanhados: ['nao-existe'] })).status).toBe(422);
  expect((await chamar('/api/perfil', 'PATCH', { lembretes: 'sim' })).status).toBe(422);
});

test('lembrete do evento de amanhã aparece e some quando a pessoa desliga', async () => {
  const ligado = await chamar('/api/notificacoes');
  expect(ligado.corpo.lembretes.map((l) => l.eventoId)).toEqual(['ev-roda']);
  expect((await chamar('/api/eventos/ev-roda')).corpo.lembreteEm).not.toBeNull();

  await chamar('/api/perfil', 'PATCH', { lembretes: false });
  expect((await chamar('/api/notificacoes')).corpo.lembretes).toEqual([]);
  expect((await chamar('/api/eventos/ev-roda')).corpo.lembreteEm).toBeNull();
});

test('cancelar a presença remove o lembrete', async () => {
  await chamar('/api/eventos/ev-roda/presenca', 'DELETE');
  expect((await chamar('/api/notificacoes')).corpo.lembretes).toEqual([]);
});
