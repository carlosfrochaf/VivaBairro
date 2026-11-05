import { jest } from '@jest/globals';
import { solicitarSugestao, minimizarEntrada, provedorSimulado } from '../src/integracoes/ia.js';

const entrada = {
  consentimento: true,
  titulo: 'Luz apagada na rua',
  descricao: 'O poste em frente à padaria está apagado. Já faz três noites.',
  local: 'Rua das Acácias',
  bairroId: 'jardim-aurora',
  contaId: 'ana',
};

test('sem consentimento explícito o provedor nunca é chamado', async () => {
  const provedor = jest.fn();
  expect(await solicitarSugestao({ ...entrada, consentimento: false }, provedor)).toEqual({ ok: false, motivo: 'sem-consentimento' });
  expect(await solicitarSugestao({ ...entrada, consentimento: 'sim' }, provedor)).toEqual({ ok: false, motivo: 'sem-consentimento' });
  expect(provedor).not.toHaveBeenCalled();
});

test('envia apenas título e descrição ao provedor', async () => {
  const provedor = jest.fn().mockResolvedValue({ categoria: 'infraestrutura', resumo: 'Poste apagado.' });
  await solicitarSugestao(entrada, provedor);
  expect(provedor).toHaveBeenCalledWith({ titulo: entrada.titulo, descricao: entrada.descricao });
});

test('minimizarEntrada corta textos longos', () => {
  expect(minimizarEntrada({ titulo: 'x'.repeat(500), descricao: 'y' }).titulo).toHaveLength(80);
});

test('devolve sugestão para revisão quando a resposta é válida', async () => {
  const r = await solicitarSugestao(entrada, async () => ({ categoria: 'infraestrutura', resumo: '  Poste apagado.  ' }));
  expect(r).toEqual({ ok: true, sugestao: { categoria: 'infraestrutura', resumo: 'Poste apagado.' } });
});

test.each([
  [{ categoria: 'inventada', resumo: 'ok' }],
  [{ categoria: 'infraestrutura', resumo: '' }],
  [{ categoria: 'infraestrutura' }],
  [null],
  ['texto solto'],
])('descarta resposta fora do formato esperado: %p', async (resposta) => {
  expect(await solicitarSugestao(entrada, async () => resposta)).toEqual({ ok: false, motivo: 'resposta-invalida' });
});

test('falha do provedor vira motivo, sem lançar erro', async () => {
  const r = await solicitarSugestao(entrada, async () => {
    throw new Error('HTTP 500');
  });
  expect(r).toEqual({ ok: false, motivo: 'falha' });
});

test('aplica tempo limite', async () => {
  const lento = () => new Promise((resolver) => setTimeout(() => resolver({ categoria: 'ajuda', resumo: 'x' }), 200));
  expect(await solicitarSugestao(entrada, lento, { tempoLimiteMs: 20 })).toEqual({ ok: false, motivo: 'tempo-esgotado' });
});

test('recusa pedido sem texto', async () => {
  expect(await solicitarSugestao({ consentimento: true, titulo: ' ', descricao: '' }, jest.fn())).toEqual({ ok: false, motivo: 'texto-vazio' });
});

test.each([
  ['Luz apagada', 'O poste não acende.', 'infraestrutura'],
  ['Perdi meu cachorro', 'Caramelo, coleira azul.', 'achados-perdidos'],
  ['Preciso de ajuda', 'Empréstimo de escada para o mutirão.', 'ajuda'],
])('provedor simulado classifica "%s"', (titulo, descricao, categoria) => {
  expect(provedorSimulado({ titulo, descricao }).categoria).toBe(categoria);
});
