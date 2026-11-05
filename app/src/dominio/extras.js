// Foto opcional de aviso, bairros acompanhados e lembretes de eventos.

// ---------- foto do aviso ----------

export const FOTO = {
  tipos: ['image/jpeg', 'image/png', 'image/webp'],
  bytesMaximos: 900 * 1024,
  ladoMaximo: 1280,
};

const DATA_URL = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/;

// Recebe a foto como data URL (já reduzida no navegador) e confere tipo e tamanho.
export function validarFoto(dataUrl) {
  if (dataUrl === undefined || dataUrl === null || dataUrl === '') return { valido: true, foto: null };
  const achado = typeof dataUrl === 'string' && dataUrl.match(DATA_URL);
  if (!achado) return { valido: false, erro: 'Não foi possível ler a foto. Escolha uma imagem JPG, PNG ou WebP.' };
  const [, tipo, base64] = achado;
  if (!FOTO.tipos.includes(tipo)) return { valido: false, erro: 'Use uma foto JPG, PNG ou WebP.' };
  const bytes = Math.floor((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  if (bytes > FOTO.bytesMaximos) {
    return { valido: false, erro: `A foto é grande demais (${Math.round(bytes / 1024)} KB). O limite é ${FOTO.bytesMaximos / 1024} KB.` };
  }
  return { valido: true, foto: { tipo, base64, bytes } };
}

// ---------- bairros acompanhados ----------

export const MAX_BAIRROS_ACOMPANHADOS = 5;

export function validarBairrosAcompanhados(lista, bairrosValidos, bairroPrincipal) {
  if (!Array.isArray(lista)) return { valido: false, erro: 'Envie a lista de bairros.' };
  const unicos = [...new Set(lista.filter((b) => typeof b === 'string'))].filter((b) => b !== bairroPrincipal);
  const invalido = unicos.find((b) => !bairrosValidos.includes(b));
  if (invalido) return { valido: false, erro: 'Um dos bairros escolhidos não está disponível.' };
  if (unicos.length > MAX_BAIRROS_ACOMPANHADOS) {
    return { valido: false, erro: `Você pode acompanhar até ${MAX_BAIRROS_ACOMPANHADOS} bairros além do principal.` };
  }
  return { valido: true, bairros: unicos };
}

export function bairrosDaConta(conta) {
  return [conta.bairroId, ...(conta.bairrosAcompanhados ?? [])];
}

// ---------- lembretes ----------

export const ANTECEDENCIA_LEMBRETE_MS = 24 * 60 * 60 * 1000;

export function momentoDoLembrete(evento) {
  return new Date(new Date(evento.inicio).getTime() - ANTECEDENCIA_LEMBRETE_MS);
}

// Lembretes já devidos: presença ativa, lembretes ligados, faltando menos de 24 h para o início.
export function lembretesPendentes({ conta, eventos, inscricoes, agora = new Date() }) {
  if (!conta.lembretes) return [];
  const minhas = new Set(inscricoes.filter((i) => i.contaId === conta.id && i.ativa).map((i) => i.eventoId));
  return eventos
    .filter((e) => minhas.has(e.id) && !e.cancelado)
    .filter((e) => agora >= momentoDoLembrete(e) && agora < new Date(e.inicio))
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .map((e) => ({ eventoId: e.id, titulo: e.titulo, inicio: e.inicio, local: e.local, enviadoEm: momentoDoLembrete(e).toISOString() }));
}
