// Testes de integração: sobem o servidor real numa porta livre e usam fetch.
import { iniciarServidor } from '../src/servidor/servidor.js';
import { criarRepositorio } from '../src/servidor/repositorio.js';

let servidor;
let base;

async function chamar(caminho, metodo = 'GET', corpo) {
  const r = await fetch(base + caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  });
  return { status: r.status, corpo: await r.json() };
}

beforeEach(async () => {
  servidor = await iniciarServidor(0, {
    repositorio: criarRepositorio(new Date()),
    provedorIa: () => new Promise(() => {}), // provedor que nunca responde
    tempoLimiteIaMs: 30,
  });
  base = `http://localhost:${servidor.address().port}`;
});

afterEach(() => new Promise((resolver) => servidor.close(resolver)));

test('feed filtra por bairro', async () => {
  const { status, corpo } = await chamar('/api/feed?bairro=centro');
  expect(status).toBe(200);
  expect(corpo.eventos.map((e) => e.id)).toEqual(['ev-feira']);
  expect(corpo.avisos).toEqual([]);
});

test('feed recusa bairro inexistente', async () => {
  expect((await chamar('/api/feed?bairro=nao-existe')).status).toBe(400);
});

test('servidor revalida o aviso e devolve erros por campo (422)', async () => {
  const { status, corpo } = await chamar('/api/avisos', 'POST', { titulo: 'oi', bairroId: 'jardim-aurora' });
  expect(status).toBe(422);
  expect(corpo.mensagem).toBe('Revise os campos destacados.');
  expect(Object.keys(corpo.erros).sort()).toEqual(['categoria', 'descricao', 'local', 'titulo']);
});

test('JSON malformado gera 400 com mensagem compreensível', async () => {
  const { status, corpo } = await chamar('/api/avisos', 'POST', '{titulo:');
  expect(status).toBe(400);
  expect(corpo.mensagem).toBe('Não foi possível ler os dados enviados.');
});

test('publica aviso válido e alerta sobre telefone no texto', async () => {
  const { status, corpo } = await chamar('/api/avisos', 'POST', {
    titulo: 'Cachorro encontrado',
    categoria: 'achados-perdidos',
    bairroId: 'centro',
    local: 'Praça da Matriz',
    descricao: 'Cachorro caramelo encontrado. Falar no (11) 98765-4321.',
  });
  expect(status).toBe(201);
  expect(corpo.aviso.estado).toBe('aberto');
  expect(corpo.alertas.map((a) => a.tipo)).toEqual(['telefone']);
});

test('última vaga: segunda confirmação da mesma conta recebe 409', async () => {
  expect((await chamar('/api/eventos/ev-horta/presenca', 'POST')).status).toBe(200);
  const repetida = await chamar('/api/eventos/ev-horta/presenca', 'POST');
  expect(repetida.status).toBe(409);
  expect(repetida.corpo.codigo).toBe('ja-inscrito');
  const evento = await chamar('/api/eventos/ev-horta');
  expect(evento.corpo).toMatchObject({ estado: 'lotado', vagas: 0, euConfirmei: true });
});

test('não permite mudar estado de aviso de outra pessoa (403)', async () => {
  const { status } = await chamar('/api/avisos/av-escada/estado', 'PATCH', { estado: 'encerrado' });
  expect(status).toBe(403);
});

test('IA sem resposta não quebra o fluxo: retorna 200 com o motivo', async () => {
  const { status, corpo } = await chamar('/api/ia/sugestao', 'POST', {
    consentimento: true,
    titulo: 'Poste',
    descricao: 'Apagado.',
  });
  expect(status).toBe(200);
  expect(corpo).toMatchObject({ ok: false, motivo: 'tempo-esgotado', camposEnviados: ['titulo', 'descricao'] });
});

test('rota desconhecida responde 404 em JSON', async () => {
  expect((await chamar('/api/nada')).status).toBe(404);
});
