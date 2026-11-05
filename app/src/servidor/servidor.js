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
import { criarRepositorio, CONTA_DEMO } from './repositorio.js';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const PASTAS_ESTATICAS = {
  '/dominio/': join(RAIZ, '..', 'dominio'),
  '/': join(RAIZ, '..', '..', 'public'),
};
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const TAMANHO_MAXIMO_CORPO = 20_000;

class ErroHttp extends Error {
  constructor(status, mensagem, extra = {}) {
    super(mensagem);
    this.status = status;
    this.extra = extra;
  }
}

function responder(res, status, corpo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(corpo));
}

async function lerCorpo(req) {
  let texto = '';
  for await (const parte of req) {
    texto += parte;
    if (texto.length > TAMANHO_MAXIMO_CORPO) throw new ErroHttp(413, 'O conteúdo enviado é grande demais.');
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

  function apresentarEvento(evento, contaId) {
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
      euConfirmei: estado.inscricoes.some((i) => i.eventoId === evento.id && i.contaId === contaId && i.ativa),
    };
  }

  function apresentarAviso(aviso, contaId) {
    return {
      ...aviso,
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

  const rotas = [
    ['GET', /^\/api\/bairros$/, () => ({ municipio: estado.municipio, bairros: estado.bairros, categorias: CATEGORIAS_AVISO })],

    ['GET', /^\/api\/feed$/, ({ url, contaId }) => {
      const bairro = url.searchParams.get('bairro');
      const busca = (url.searchParams.get('q') ?? '').trim().toLowerCase();
      const tipo = url.searchParams.get('tipo');
      if (bairro && !idsBairros().includes(bairro)) throw new ErroHttp(400, 'Bairro inválido.');
      const confere = (item) =>
        (!bairro || item.bairroId === bairro) &&
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
      const corpo = await lerCorpo(req);
      const v = validarAviso(corpo, idsBairros());
      if (!v.valido) throw new ErroHttp(422, 'Revise os campos destacados.', { erros: v.erros });
      const aviso = {
        id: repositorio.novoId('av'),
        ...v.dados,
        autorId: contaId,
        estado: 'aberto',
        criadoEm: relogio().toISOString(),
        historico: [],
      };
      estado.avisos.unshift(aviso);
      return { aviso: apresentarAviso(aviso, contaId), alertas: detectarDadosSensiveis(aviso.titulo, aviso.descricao, aviso.local) };
    }, 201],

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

    ['GET', /^\/api\/perfil$/, ({ contaId }) => ({
      conta: CONTA_DEMO,
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
    // Alfa sem login real (RF-01 pendente): todas as requisições usam a conta de demonstração.
    const contaId = CONTA_DEMO.id;
    try {
      if (!url.pathname.startsWith('/api/')) return await servirArquivo(url.pathname, res);
      for (const [metodo, padrao, acao, status = 200] of rotas) {
        const achou = url.pathname.match(padrao);
        if (achou && req.method === metodo) {
          return responder(res, status, await acao({ req, url, params: achou.slice(1), contaId }));
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
