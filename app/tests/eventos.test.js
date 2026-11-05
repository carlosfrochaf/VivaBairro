import {
  calcularEstadoEvento,
  confirmarPresenca,
  cancelarPresenca,
  contarConfirmacoes,
  vagasRestantes,
} from '../src/dominio/eventos.js';

const agora = new Date('2026-11-05T12:00:00Z');
const evento = { id: 'ev1', inicio: '2026-11-08T12:00:00Z', fim: '2026-11-08T15:00:00Z', capacidade: 2 };

describe('calcularEstadoEvento', () => {
  test.each([
    ['cancelado', { ...evento, cancelado: true }, 0, agora],
    ['rascunho', { ...evento, rascunho: true }, 0, agora],
    ['inscricoes-abertas', evento, 0, agora],
    ['lotado', evento, 2, agora],
    ['em-andamento', evento, 0, new Date('2026-11-08T13:00:00Z')],
    ['concluido', evento, 0, new Date('2026-11-08T15:00:00Z')],
    ['inscricoes-abertas', { ...evento, capacidade: null }, 500, agora],
  ])('resulta em %s', (esperado, ev, confirmados, quando) => {
    expect(calcularEstadoEvento(ev, confirmados, quando)).toBe(esperado);
  });
});

describe('confirmarPresenca', () => {
  test('registra a confirmação sem alterar a lista original', () => {
    const lista = [];
    const r = confirmarPresenca(evento, lista, 'ana', agora);
    expect(r.ok).toBe(true);
    expect(contarConfirmacoes(r.inscricoes, 'ev1')).toBe(1);
    expect(lista).toHaveLength(0);
  });

  test('impede inscrição duplicada da mesma conta', () => {
    const { inscricoes } = confirmarPresenca(evento, [], 'ana', agora);
    expect(confirmarPresenca(evento, inscricoes, 'ana', agora)).toMatchObject({ ok: false, codigo: 'ja-inscrito' });
  });

  test('não ultrapassa a capacidade', () => {
    let lista = confirmarPresenca(evento, [], 'ana', agora).inscricoes;
    lista = confirmarPresenca(evento, lista, 'bia', agora).inscricoes;
    const r = confirmarPresenca(evento, lista, 'caio', agora);
    expect(r).toMatchObject({ ok: false, codigo: 'lotado', mensagem: 'Não há mais vagas neste evento.' });
    expect(vagasRestantes(evento, contarConfirmacoes(lista, 'ev1'))).toBe(0);
  });

  test('recusa evento cancelado ou concluído', () => {
    expect(confirmarPresenca({ ...evento, cancelado: true }, [], 'ana', agora).codigo).toBe('indisponivel');
    expect(confirmarPresenca(evento, [], 'ana', new Date('2026-11-09T00:00:00Z')).codigo).toBe('indisponivel');
  });
});

describe('cancelarPresenca', () => {
  test('libera a vaga e mantém o registro no histórico', () => {
    let lista = confirmarPresenca(evento, [], 'ana', agora).inscricoes;
    lista = confirmarPresenca(evento, lista, 'bia', agora).inscricoes;
    const r = cancelarPresenca(evento, lista, 'ana', agora);
    expect(r.ok).toBe(true);
    expect(r.inscricoes).toHaveLength(2);
    expect(r.inscricoes[0]).toMatchObject({ ativa: false, canceladaEm: agora.toISOString() });
    expect(confirmarPresenca(evento, r.inscricoes, 'caio', agora).ok).toBe(true);
  });

  test('avisa quando não há presença para cancelar', () => {
    expect(cancelarPresenca(evento, [], 'ana', agora).codigo).toBe('sem-inscricao');
  });
});
