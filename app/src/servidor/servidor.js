// API HTTP da versão Alfa (Node.js, sem frameworks) e servidor dos arquivos da interface.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validarAviso, CATEGORIAS_AVISO } from '../dominio/validacao.js';
import {
  calcularEstadoEvento,
  confirmarPresenca,
  cancelarPresenca,
  contarConfirmacoes,
  vagasRestantes,
  NOMES_ESTADO_EVENTO,
} from '../dominio/eventos.js';
import { atualizarEstadoAviso, acoesDisponiveis, NOMES_ESTADO_AVISO } from '../dominio/avisos.js';
import { detectarDadosSensiveis } from '../dominio/privacidade.js';
import { solicitarSugestao, provedorSimulado, CAMPOS_ENVIADOS } from '../integracoes/ia.js';
import { validarCadastro, validarLogin } from '../dominio/contas.js';
import {
  validarFoto,
  validarBairrosAcompanhados,
  bairrosDaConta,
  lembretesPendentes,
  momentoDoLembrete,
} from '../dominio/extras.js';
import { criarRepositorio, CONTA_DEMO } from './repositorio.js';
import { gerarHash, conferirSenha, gerarToken } from './senhas.js';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const PASTAS_ESTATICAS = {
  '/dominio/': join(RAIZ, '..', 'dominio'),
  '/': join(RAIZ, '..', '..', 'public'),
};
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const TAMANHO_MAXIMO_CORPO = 20_000;
// Avisos podem levar uma foto já reduzida no navegador (até ~900 KB em base64).
const TAMANHO_MAXIMO_COM_FOTO = 1_300_000;
const COOKIE_SESSAO = 'vb_sessao';
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;
const MAX_TENTATIVAS = 5;
const JANELA_TENTATIVAS_MS = 15 * 60 * 1000;
const ERRO_LOGIN = 'E-mail ou senha incorretos. Confira os dados e tente de novo.';
// Hash fixo usado quando o e-mail não existe, para o tempo de resposta não revelar isso.
const HASH_FICTICIO = gerarHash(gerarToken());

function lerCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(';')
      .map((par) => par.trim().split('='))
      .filter(([nome, valor]) => nome && valor)
      .map(([nome, valor]) => [nome, decodeURIComponent(valor)]),
  );
}

function cookieSessao(req, token, maxAgeSegundos) {
  // Secure quando o acesso chega por HTTPS (como no Render, atrás de proxy).
  const seguro = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  return `${COOKIE_SESSAO}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSegundos}${seguro}`;
}

class ErroHttp extends Error {
  constructor(status, mensagem, extra = {}) {
    super(mensagem);
    this.status = status;
    this.extra = extra;
  }
}

function responder(res, status, corpo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(corpo));
}

async function lerCorpo(req, limite = TAMANHO_MAXIMO_CORPO) {
  let texto = '';
  for await (const parte of req) {
    texto += parte;
    if (texto.length > limite) throw new ErroHttp(413, 'O conteúdo enviado é grande demais.');
  }
  if (!texto) return {};
  try {
    return JSON.parse(texto);
  } catch {
    throw new ErroHttp(400, 'Não foi possível ler os dados enviados.');
  }
}

export function criarApp({ repositorio = criarRepositorio(), provedorIa = provedorSimulado, tempoLimiteIaMs, relogio = () => new Date() } = {}) {
  const { estado } = repositorio;
  const idsBairros = () => estado.bairros.map((b) => b.id);
  const nomeBairro = (id) => estado.bairros.find((b) => b.id === id)?.nome ?? id;
  const tentativas = new Map();

  const contaPublica = (conta) => ({
    id: conta.id,
    nome: conta.nome,
    email: conta.email,
    bairroId: conta.bairroId,
    bairro: nomeBairro(conta.bairroId),
    bairrosAcompanhados: conta.bairrosAcompanhados ?? [],
    lembretes: conta.lembretes !== false,
  });

  function contaDaSessao(req) {
    const token = lerCookies(req)[COOKIE_SESSAO];
    const sessao = token && estado.sessoes.get(token);
    if (!sessao) return null;
    if (sessao.expiraEm <= relogio().getTime()) {
      estado.sessoes.delete(token);
      return null;
    }
    return estado.contas.find((c) => c.id === sessao.contaId) ?? null;
  }

  function abrirSessao(req, res, conta) {
    const token = gerarToken();
    estado.sessoes.set(token, { contaId: conta.id, expiraEm: relogio().getTime() + DURACAO_SESSAO_MS });
    res.setHeader('Set-Cookie', cookieSessao(req, token, DURACAO_SESSAO_MS / 1000));
    return { conta: contaPublica(conta) };
  }

  // Limita tentativas erradas por e-mail para dificultar adivinhação de senha.
  function bloqueado(email) {
    const registro = tentativas.get(email);
    if (!registro) return false;
    if (relogio().getTime() - registro.inicio > JANELA_TENTATIVAS_MS) {
      tentativas.delete(email);
      return false;
    }
    return registro.falhas >= MAX_TENTATIVAS;
  }

  function registrarFalha(email) {
    const agora = relogio().getTime();
    const registro = tentativas.get(email);
    if (!registro || agora - registro.inicio > JANELA_TENTATIVAS_MS) tentativas.set(email, { inicio: agora, falhas: 1 });
    else registro.falhas += 1;
  }

  function apresentarEvento(evento, contaId) {
    const conta = estado.contas.find((c) => c.id === contaId);
    const euConfirmei = estado.inscricoes.some((i) => i.eventoId === evento.id && i.contaId === contaId && i.ativa);
    const confirmados = contarConfirmacoes(estado.inscricoes, evento.id);
    const situacao = calcularEstadoEvento(evento, confirmados, relogio());
    return {
      ...evento,
      tipo: 'evento',
      bairro: nomeBairro(evento.bairroId),
      confirmados,
      vagas: vagasRestantes(evento, confirmados),
      estado: situacao,
      estadoNome: NOMES_ESTADO_EVENTO[situacao],
      euConfirmei,
      // Momento em que o lembrete aparece no site, se a pessoa confirmou e deixou lembretes ligados.
      lembreteEm: euConfirmei && conta?.lembretes !== false ? momentoDoLembrete(evento).toISOString() : null,
    };
  }

  function apresentarAviso(aviso, contaId) {
    // A foto não vai no JSON; o navegador a busca pelo endereço próprio.
    const { foto, ...resto } = aviso;
    return {
      ...resto,
      fotoUrl: foto ? `/api/avisos/${aviso.id}/foto` : null,
      tipo: 'aviso',
      bairro: nomeBairro(aviso.bairroId),
      categoriaNome: CATEGORIAS_AVISO.find((c) => c.id === aviso.categoria)?.nome,
      estadoNome: NOMES_ESTADO_AVISO[aviso.estado],
      origem: aviso.autorId === contaId ? 'Publicado por você' : 'Publicado por morador',
      acoes: acoesDisponiveis(aviso, contaId).map((id) => ({ id, nome: NOMES_ESTADO_AVISO[id] })),
    };
  }

  function buscarEvento(id) {
    const evento = estado.eventos.find((e) => e.id === id);
    if (!evento) throw new ErroHttp(404, 'Evento não encontrado.');
    return evento;
  }

  // Rotas marcadas como 'publica' não exigem login; as demais respondem 401 sem sessão.
  const rotas = [
    ['GET', /^\/api\/sessao$/, ({ conta }) => ({ conta: conta ? contaPublica(conta) : null }), 200, 'publica'],

    ['POST', /^\/api\/contas$/, async ({ req, res }) => {
      const v = validarCadastro(await lerCorpo(req), idsBairros());
      if (!v.valido) throw new ErroHttp(422, 'Revise os campos destacados.', { erros: v.erros });
      if (estado.contas.some((c) => c.email === v.dados.email)) {
        // Mensagem genérica: não confirma para terceiros quais e-mails estão cadastrados.
        throw new ErroHttp(409, 'Não foi possível criar a conta com esse e-mail.', {
          erros: { email: 'Use outro e-mail ou entre na conta que você já tem.' },
        });
      }
      const conta = {
        id: repositorio.novoId('conta'),
        nome: v.dados.nome,
        email: v.dados.email,
        bairroId: v.dados.bairroId,
        bairrosAcompanhados: [],
        lembretes: true,
        senhaHash: gerarHash(v.dados.senha),
      };
      estado.contas.push(conta);
      return abrirSessao(req, res, conta);
    }, 201, 'publica'],

    ['POST', /^\/api\/sessao$/, async ({ req, res }) => {
      const v = validarLogin(await lerCorpo(req));
      if (!v.valido) throw new ErroHttp(422, 'Revise os campos destacados.', { erros: v.erros });
      if (bloqueado(v.dados.email)) {
        throw new ErroHttp(429, 'Muitas tentativas sem sucesso. Aguarde 15 minutos e tente de novo.');
      }
      const conta = estado.contas.find((c) => c.email === v.dados.email);
      const confere = conferirSenha(v.dados.senha, conta?.senhaHash ?? HASH_FICTICIO);
      if (!conta || !confere) {
        registrarFalha(v.dados.email);
        throw new ErroHttp(401, ERRO_LOGIN);
      }
      tentativas.delete(v.dados.email);
      return abrirSessao(req, res, conta);
    }, 200, 'publica'],

    ['POST', /^\/api\/sessao\/demonstracao$/, ({ req, res }) =>
      abrirSessao(req, res, estado.contas.find((c) => c.id === CONTA_DEMO.id)), 200, 'publica'],

    ['DELETE', /^\/api\/sessao$/, ({ req, res }) => {
      const token = lerCookies(req)[COOKIE_SESSAO];
      if (token) estado.sessoes.delete(token);
      res.setHeader('Set-Cookie', cookieSessao(req, '', 0));
      return { ok: true };
    }, 200, 'publica'],

    ['GET', /^\/api\/bairros$/, () => ({ municipio: estado.municipio, bairros: estado.bairros, categorias: CATEGORIAS_AVISO }), 200, 'publica'],

    ['GET', /^\/api\/feed$/, ({ url, conta, contaId }) => {
      const bairro = url.searchParams.get('bairro');
      const busca = (url.searchParams.get('q') ?? '').trim().toLowerCase();
      const tipo = url.searchParams.get('tipo');
      if (bairro && bairro !== 'meus' && !idsBairros().includes(bairro)) throw new ErroHttp(400, 'Bairro inválido.');
      // "meus" junta o bairro principal e os bairros acompanhados da conta.
      const permitidos = bairro === 'meus' ? bairrosDaConta(conta) : bairro ? [bairro] : null;
      const confere = (item) =>
        (!permitidos || permitidos.includes(item.bairroId)) &&
        (!busca || `${item.titulo} ${item.descricao} ${item.local}`.toLowerCase().includes(busca));
      const eventos = tipo === 'aviso' ? [] : estado.eventos.filter(confere).map((e) => apresentarEvento(e, contaId));
      const avisos = tipo === 'evento' ? [] : estado.avisos.filter(confere).map((a) => apresentarAviso(a, contaId));
      return { eventos: eventos.sort((a, b) => a.inicio.localeCompare(b.inicio)), avisos };
    }],

    ['GET', /^\/api\/eventos\/([\w-]+)$/, ({ params, contaId }) => apresentarEvento(buscarEvento(params[0]), contaId)],

    ['POST', /^\/api\/eventos\/([\w-]+)\/presenca$/, ({ params, contaId }) => {
      const evento = buscarEvento(params[0]);
      // Verificação e gravação acontecem sem pausa (sem await), então duas requisições
      // não ocupam a mesma última vaga. Com banco de dados isso exige uma transação.
      const r = confirmarPresenca(evento, estado.inscricoes, contaId, relogio());
      if (!r.ok) throw new ErroHttp(409, r.mensagem, { codigo: r.codigo });
      estado.inscricoes = r.inscricoes;
      return apresentarEvento(evento, contaId);
    }],

    ['DELETE', /^\/api\/eventos\/([\w-]+)\/presenca$/, ({ params, contaId }) => {
      const evento = buscarEvento(params[0]);
      const r = cancelarPresenca(evento, estado.inscricoes, contaId, relogio());
      if (!r.ok) throw new ErroHttp(409, r.mensagem, { codigo: r.codigo });
      estado.inscricoes = r.inscricoes;
      return apresentarEvento(evento, contaId);
    }],

    ['POST', /^\/api\/avisos$/, async ({ req, contaId }) => {
      const corpo = await lerCorpo(req, TAMANHO_MAXIMO_COM_FOTO);
      const v = validarAviso(corpo, idsBairros());
      const f = validarFoto(corpo.foto);
      const erros = { ...v.erros, ...(f.valido ? {} : { foto: f.erro }) };
      if (Object.keys(erros).length) throw new ErroHttp(422, 'Revise os campos destacados.', { erros });
      const aviso = {
        id: repositorio.novoId('av'),
        ...v.dados,
        foto: f.foto ? { tipo: f.foto.tipo, dados: Buffer.from(f.foto.base64, 'base64') } : null,
        autorId: contaId,
        estado: 'aberto',
        criadoEm: relogio().toISOString(),
        historico: [],
      };
      estado.avisos.unshift(aviso);
      return { aviso: apresentarAviso(aviso, contaId), alertas: detectarDadosSensiveis(aviso.titulo, aviso.descricao, aviso.local) };
    }, 201],

    ['GET', /^\/api\/avisos\/([\w-]+)\/foto$/, ({ params }) => {
      const aviso = estado.avisos.find((a) => a.id === params[0]);
      if (!aviso?.foto) throw new ErroHttp(404, 'Foto não encontrada.');
      return { binario: aviso.foto };
    }],

    ['PATCH', /^\/api\/avisos\/([\w-]+)\/estado$/, async ({ req, params, contaId }) => {
      const indice = estado.avisos.findIndex((a) => a.id === params[0]);
      if (indice === -1) throw new ErroHttp(404, 'Aviso não encontrado.');
      const { estado: novo } = await lerCorpo(req);
      const r = atualizarEstadoAviso(estado.avisos[indice], novo, contaId, relogio());
      if (!r.ok) throw new ErroHttp(r.codigo === 'sem-permissao' ? 403 : 409, r.mensagem, { codigo: r.codigo });
      estado.avisos[indice] = r.aviso;
      return apresentarAviso(r.aviso, contaId);
    }],

    ['POST', /^\/api\/ia\/sugestao$/, async ({ req }) => {
      const corpo = await lerCorpo(req);
      const r = await solicitarSugestao(corpo, provedorIa, { tempoLimiteMs: tempoLimiteIaMs });
      // Falha da IA não é erro da aplicação: a resposta informa o motivo e o fluxo manual continua.
      return { ...r, camposEnviados: CAMPOS_ENVIADOS, provedor: 'Simulado (sem serviço externo)' };
    }],

    ['PATCH', /^\/api\/perfil$/, async ({ req, conta }) => {
      const corpo = await lerCorpo(req);
      if (corpo.bairrosAcompanhados !== undefined) {
        const r = validarBairrosAcompanhados(corpo.bairrosAcompanhados, idsBairros(), conta.bairroId);
        if (!r.valido) throw new ErroHttp(422, r.erro, { erros: { bairrosAcompanhados: r.erro } });
        conta.bairrosAcompanhados = r.bairros;
      }
      if (corpo.lembretes !== undefined) {
        if (typeof corpo.lembretes !== 'boolean') throw new ErroHttp(422, 'Escolha se quer receber lembretes.');
        conta.lembretes = corpo.lembretes;
      }
      return { conta: contaPublica(conta) };
    }],

    ['GET', /^\/api\/notificacoes$/, ({ conta }) => ({
      lembretes: lembretesPendentes({ conta: { ...conta, lembretes: conta.lembretes !== false }, eventos: estado.eventos, inscricoes: estado.inscricoes, agora: relogio() })
        .map((l) => ({ ...l, bairro: nomeBairro(estado.eventos.find((e) => e.id === l.eventoId).bairroId) })),
    })],

    ['GET', /^\/api\/perfil$/, ({ conta, contaId }) => ({
      conta: contaPublica(conta),
      eventos: estado.eventos
        .filter((e) => estado.inscricoes.some((i) => i.eventoId === e.id && i.contaId === contaId && i.ativa))
        .map((e) => apresentarEvento(e, contaId)),
      avisos: estado.avisos.filter((a) => a.autorId === contaId).map((a) => apresentarAviso(a, contaId)),
    })],
  ];

  async function servirArquivo(caminho, res) {
    for (const [prefixo, pasta] of Object.entries(PASTAS_ESTATICAS)) {
      if (!caminho.startsWith(prefixo)) continue;
      const relativo = caminho.slice(prefixo.length) || 'index.html';
      const arquivo = normalize(join(pasta, relativo));
      if (!arquivo.startsWith(pasta)) break;
      try {
        const conteudo = await readFile(arquivo);
        res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] ?? 'application/octet-stream' });
        res.end(conteudo);
        return;
      } catch {
        break;
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Não encontrado');
  }

  return async function tratar(req, res) {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (!url.pathname.startsWith('/api/')) return await servirArquivo(url.pathname, res);
      for (const [metodo, padrao, acao, status = 200, acesso] of rotas) {
        const achou = url.pathname.match(padrao);
        if (achou && req.method === metodo) {
          const conta = contaDaSessao(req);
          if (!conta && acesso !== 'publica') throw new ErroHttp(401, 'Entre na sua conta para continuar.');
          const corpo = await acao({ req, res, url, params: achou.slice(1), conta, contaId: conta?.id });
          if (corpo?.binario) {
            res.writeHead(200, { 'Content-Type': corpo.binario.tipo, 'Cache-Control': 'private, max-age=3600' });
            return res.end(corpo.binario.dados);
          }
          return responder(res, status, corpo);
        }
      }
      throw new ErroHttp(404, 'Rota não encontrada.');
    } catch (erro) {
      if (erro instanceof ErroHttp) return responder(res, erro.status, { mensagem: erro.message, ...erro.extra });
      // Não expõe detalhes internos para quem usa o site.
      process.stderr.write(`${erro.stack}\n`);
      return responder(res, 500, { mensagem: 'Algo deu errado do nosso lado. Seu texto não foi perdido; tente de novo.' });
    }
  };
}

export function iniciarServidor(porta = 3000, opcoes) {
  const servidor = createServer(criarApp(opcoes));
  return new Promise((resolver) => servidor.listen(porta, () => resolver(servidor)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const porta = Number(process.env.PORT) || 3000;
  iniciarServidor(porta).then(() => process.stdout.write(`VivaBairro Alfa em http://localhost:${porta}\n`));
}
