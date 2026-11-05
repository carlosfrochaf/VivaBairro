// Estados do evento e regras de participação (ver 3-atividades-eventos/).

export const NOMES_ESTADO_EVENTO = {
  rascunho: 'Rascunho',
  'inscricoes-abertas': 'Inscrições abertas',
  lotado: 'Lotado',
  'em-andamento': 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export function contarConfirmacoes(inscricoes, eventoId) {
  return inscricoes.filter((i) => i.eventoId === eventoId && i.ativa).length;
}

export function calcularEstadoEvento(evento, confirmacoesAtivas, agora = new Date()) {
  if (evento.cancelado) return 'cancelado';
  if (evento.rascunho) return 'rascunho';
  if (agora >= new Date(evento.fim)) return 'concluido';
  if (agora >= new Date(evento.inicio)) return 'em-andamento';
  if (evento.capacidade && confirmacoesAtivas >= evento.capacidade) return 'lotado';
  return 'inscricoes-abertas';
}

export function vagasRestantes(evento, confirmacoesAtivas) {
  if (!evento.capacidade) return null;
  return Math.max(evento.capacidade - confirmacoesAtivas, 0);
}

const ERROS_PRESENCA = {
  'ja-inscrito': 'Você já confirmou presença neste evento.',
  lotado: 'Não há mais vagas neste evento.',
  indisponivel: 'Este evento não aceita confirmações agora.',
  'sem-inscricao': 'Você não tem presença confirmada neste evento.',
};

function falha(codigo) {
  return { ok: false, codigo, mensagem: ERROS_PRESENCA[codigo] };
}

// Retorna uma nova lista; não altera a recebida.
export function confirmarPresenca(evento, inscricoes, contaId, agora = new Date()) {
  const ativas = contarConfirmacoes(inscricoes, evento.id);
  const estado = calcularEstadoEvento(evento, ativas, agora);
  const jaInscrito = inscricoes.some(
    (i) => i.eventoId === evento.id && i.contaId === contaId && i.ativa,
  );

  if (jaInscrito) return falha('ja-inscrito');
  if (estado === 'lotado') return falha('lotado');
  if (estado !== 'inscricoes-abertas') return falha('indisponivel');

  const nova = { eventoId: evento.id, contaId, ativa: true, em: agora.toISOString() };
  return { ok: true, inscricoes: [...inscricoes, nova] };
}

export function cancelarPresenca(evento, inscricoes, contaId, agora = new Date()) {
  const indice = inscricoes.findIndex(
    (i) => i.eventoId === evento.id && i.contaId === contaId && i.ativa,
  );
  if (indice === -1) return falha('sem-inscricao');

  // Mantém o registro, marcado como inativo, para preservar o histórico.
  const atualizadas = inscricoes.map((i, n) =>
    n === indice ? { ...i, ativa: false, canceladaEm: agora.toISOString() } : i,
  );
  return { ok: true, inscricoes: atualizadas };
}
