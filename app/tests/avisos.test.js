import { atualizarEstadoAviso, acoesDisponiveis } from '../src/dominio/avisos.js';

const aviso = { id: 'av1', autorId: 'ana', estado: 'aberto', historico: [] };
const agora = new Date('2026-11-05T12:00:00Z');

test('o autor muda o estado e o histórico registra origem, ator e data', () => {
  const r = atualizarEstadoAviso(aviso, 'resolvido', 'ana', agora);
  expect(r.ok).toBe(true);
  expect(r.aviso.estado).toBe('resolvido');
  expect(r.aviso.historico).toEqual([
    { de: 'aberto', para: 'resolvido', por: 'ana', origem: 'autor', em: agora.toISOString() },
  ]);
  expect(aviso.estado).toBe('aberto');
});

test('outra conta não pode mudar o estado', () => {
  expect(atualizarEstadoAviso(aviso, 'encerrado', 'bia', agora)).toMatchObject({ ok: false, codigo: 'sem-permissao' });
});

test('recusa transição que não existe', () => {
  const r = atualizarEstadoAviso({ ...aviso, estado: 'resolvido' }, 'em-andamento', 'ana', agora);
  expect(r).toMatchObject({ ok: false, codigo: 'transicao-invalida' });
  expect(r.mensagem).toMatch(/Resolvido pelo autor/);
});

test('o autor pode reabrir um aviso resolvido', () => {
  expect(atualizarEstadoAviso({ ...aviso, estado: 'resolvido' }, 'aberto', 'ana', agora).ok).toBe(true);
});

test('a interface só recebe ações compatíveis com estado e autoria', () => {
  expect(acoesDisponiveis(aviso, 'ana')).toEqual(['em-andamento', 'resolvido', 'encerrado']);
  expect(acoesDisponiveis({ ...aviso, estado: 'encerrado' }, 'ana')).toEqual(['aberto']);
  expect(acoesDisponiveis(aviso, 'bia')).toEqual([]);
});
