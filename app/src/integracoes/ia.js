// Sugestão opcional de categoria e resumo para avisos (RF-09, RF-10).
// O provedor é injetado: na Alfa usamos um provedor simulado, sem serviço externo.

import { CATEGORIAS_AVISO, LIMITES } from '../dominio/validacao.js';

export const CAMPOS_ENVIADOS = ['titulo', 'descricao'];
export const TEMPO_LIMITE_PADRAO_MS = 4000;

function comTempoLimite(promessa, ms) {
  let temporizador;
  const limite = new Promise((_, rejeitar) => {
    temporizador = setTimeout(() => rejeitar(new Error('tempo-esgotado')), ms);
  });
  return Promise.race([promessa, limite]).finally(() => clearTimeout(temporizador));
}

// Envia apenas título e descrição; conta, bairro e local nunca saem daqui.
export function minimizarEntrada(entrada = {}) {
  return {
    titulo: String(entrada.titulo ?? '').trim().slice(0, LIMITES.titulo.max),
    descricao: String(entrada.descricao ?? '').trim().slice(0, LIMITES.descricao.max),
  };
}

function respostaValida(resposta) {
  return (
    resposta &&
    CATEGORIAS_AVISO.some((c) => c.id === resposta.categoria) &&
    typeof resposta.resumo === 'string' &&
    resposta.resumo.trim().length > 0
  );
}

export async function solicitarSugestao(entrada, provedor, opcoes = {}) {
  const tempoLimiteMs = opcoes.tempoLimiteMs ?? TEMPO_LIMITE_PADRAO_MS;
  if (entrada?.consentimento !== true) return { ok: false, motivo: 'sem-consentimento' };

  const payload = minimizarEntrada(entrada);
  if (!payload.titulo && !payload.descricao) return { ok: false, motivo: 'texto-vazio' };

  try {
    const resposta = await comTempoLimite(Promise.resolve().then(() => provedor(payload)), tempoLimiteMs);
    if (!respostaValida(resposta)) return { ok: false, motivo: 'resposta-invalida' };
    return {
      ok: true,
      // Sugestão para revisão humana; a publicação é sempre uma ação separada.
      sugestao: { categoria: resposta.categoria, resumo: resposta.resumo.trim().slice(0, 280) },
    };
  } catch (erro) {
    return { ok: false, motivo: erro.message === 'tempo-esgotado' ? 'tempo-esgotado' : 'falha' };
  }
}

const PALAVRAS = [
  ['infraestrutura', ['buraco', 'poste', 'luz apagada', 'lâmpada', 'calçada', 'vazamento', 'árvore', 'banco quebrado']],
  ['transito', ['trânsito', 'semáforo', 'ônibus', 'rua fechada', 'obra na via', 'desvio']],
  ['achados-perdidos', ['perdi', 'perdido', 'perdida', 'encontrei', 'cachorro', 'gato', 'documento', 'carteira']],
  ['utilidade-publica', ['vacinação', 'coleta', 'falta de água', 'sem água', 'manutenção']],
  ['ajuda', ['ajuda', 'empréstimo', 'emprestar', 'mutirão', 'doação', 'voluntário']],
];

// Provedor simulado da Alfa: regras por palavra-chave, sem rede e sem LLM.
export function provedorSimulado({ titulo, descricao }) {
  const conteudo = `${titulo} ${descricao}`.toLowerCase();
  const achada = PALAVRAS.find(([, palavras]) => palavras.some((p) => conteudo.includes(p)));
  const primeiraFrase = (descricao || titulo).split(/(?<=[.!?])\s/)[0];
  return { categoria: achada ? achada[0] : 'utilidade-publica', resumo: primeiraFrase };
}
