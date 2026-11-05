// Cadastro, login e sessão pela API real.
import { iniciarServidor } from '../src/servidor/servidor.js';
import { criarRepositorio } from '../src/servidor/repositorio.js';

let servidor;
let base;

function cliente() {
  let cookie = '';
  return async function chamar(caminho, metodo = 'GET', corpo, cabecalhos = {}) {
    const r = await fetch(base + caminho, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...cabecalhos },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    const definido = r.headers.get('set-cookie');
    if (definido) cookie = definido.split(';')[0];
    return { status: r.status, corpo: await r.json(), setCookie: definido };
  };
}

const novaConta = {
  nome: 'Ana',
  email: 'ana@exemplo.com',
  senha: 'horta2026',
  confirmacao: 'horta2026',
  bairroId: 'centro',
};

beforeEach(async () => {
  servidor = await iniciarServidor(0, { repositorio: criarRepositorio(new Date()) });
  base = `http://localhost:${servidor.address().port}`;
});

afterEach(() => new Promise((resolver) => servidor.close(resolver)));

test('sem login, rotas protegidas respondem 401', async () => {
  const chamar = cliente();
  const r = await chamar('/api/feed?bairro=centro');
  expect(r.status).toBe(401);
  expect(r.corpo.mensagem).toBe('Entre na sua conta para continuar.');
  expect((await chamar('/api/perfil')).status).toBe(401);
});

test('criar conta abre sessão em cookie HttpOnly e não devolve a senha', async () => {
  const chamar = cliente();
  const r = await chamar('/api/contas', 'POST', novaConta);
  expect(r.status).toBe(201);
  expect(r.setCookie).toMatch(/vb_sessao=[0-9a-f]{64}; HttpOnly; SameSite=Lax/);
  expect(JSON.stringify(r.corpo)).not.toMatch(/horta2026|senha/i);
  const perfil = await chamar('/api/perfil');
  expect(perfil.corpo.conta).toMatchObject({ nome: 'Ana', email: 'ana@exemplo.com', bairro: 'Centro' });
});

test('cookie recebe Secure quando o acesso é por HTTPS', async () => {
  const r = await cliente()('/api/sessao/demonstracao', 'POST', undefined, { 'X-Forwarded-Proto': 'https' });
  expect(r.setCookie).toMatch(/; Secure$/);
});

test('cadastro inválido responde 422 com erros por campo', async () => {
  const r = await cliente()('/api/contas', 'POST', { ...novaConta, senha: 'curta', confirmacao: 'outra' });
  expect(r.status).toBe(422);
  expect(Object.keys(r.corpo.erros).sort()).toEqual(['confirmacao', 'senha']);
});

test('e-mail repetido não cria segunda conta', async () => {
  await cliente()('/api/contas', 'POST', novaConta);
  const r = await cliente()('/api/contas', 'POST', { ...novaConta, email: 'ANA@exemplo.com' });
  expect(r.status).toBe(409);
  expect(r.corpo.erros.email).toBeDefined();
});

test('login com a senha certa funciona; e-mail inexistente e senha errada têm a mesma mensagem', async () => {
  await cliente()('/api/contas', 'POST', novaConta);
  const errada = await cliente()('/api/sessao', 'POST', { email: novaConta.email, senha: 'horta2027' });
  const inexistente = await cliente()('/api/sessao', 'POST', { email: 'ninguem@exemplo.com', senha: 'horta2026' });
  expect(errada.status).toBe(401);
  expect(inexistente.status).toBe(401);
  expect(errada.corpo.mensagem).toBe(inexistente.corpo.mensagem);

  const chamar = cliente();
  expect((await chamar('/api/sessao', 'POST', { email: 'Ana@Exemplo.com', senha: 'horta2026' })).status).toBe(200);
  expect((await chamar('/api/sessao')).corpo.conta.nome).toBe('Ana');
});

test('bloqueia após 5 tentativas erradas (429)', async () => {
  await cliente()('/api/contas', 'POST', novaConta);
  for (let i = 0; i < 5; i += 1) {
    expect((await cliente()('/api/sessao', 'POST', { email: novaConta.email, senha: `errada${i}` })).status).toBe(401);
  }
  const r = await cliente()('/api/sessao', 'POST', { email: novaConta.email, senha: 'horta2026' });
  expect(r.status).toBe(429);
});

test('sair encerra a sessão no servidor', async () => {
  const chamar = cliente();
  await chamar('/api/contas', 'POST', novaConta);
  expect((await chamar('/api/perfil')).status).toBe(200);
  const tokenAntigo = await chamar('/api/sessao', 'DELETE');
  expect(tokenAntigo.setCookie).toMatch(/Max-Age=0/);
  expect((await chamar('/api/perfil')).status).toBe(401);
});
