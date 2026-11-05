// Estados de avisos (ver 4-avisos-pedidos-ajuda/ciclo-vida-status.md).

export const NOMES_ESTADO_AVISO = {
  aberto: 'Aberto',
  'em-andamento': 'Em andamento',
  resolvido: 'Resolvido pelo autor',
  encerrado: 'Encerrado',
};

const TRANSICOES = {
  aberto: ['em-andamento', 'resolvido', 'encerrado'],
  'em-andamento': ['aberto', 'resolvido', 'encerrado'],
  resolvido: ['aberto'],
  encerrado: ['aberto'],
};

// A interface só oferece as ações válidas para o estado atual e para o autor.
export function acoesDisponiveis(aviso, contaId) {
  if (aviso.autorId !== contaId) return [];
  return TRANSICOES[aviso.estado] ?? [];
}

export function atualizarEstadoAviso(aviso, novoEstado, contaId, agora = new Date()) {
  if (aviso.autorId !== contaId) {
    return { ok: false, codigo: 'sem-permissao', mensagem: 'Só o autor pode mudar o estado deste aviso.' };
  }
  if (!(TRANSICOES[aviso.estado] ?? []).includes(novoEstado)) {
    return {
      ok: false,
      codigo: 'transicao-invalida',
      mensagem: `Não é possível passar de "${NOMES_ESTADO_AVISO[aviso.estado]}" para "${NOMES_ESTADO_AVISO[novoEstado] ?? novoEstado}".`,
    };
  }
  const registro = { de: aviso.estado, para: novoEstado, por: contaId, origem: 'autor', em: agora.toISOString() };
  return {
    ok: true,
    aviso: { ...aviso, estado: novoEstado, historico: [...(aviso.historico ?? []), registro] },
  };
}
