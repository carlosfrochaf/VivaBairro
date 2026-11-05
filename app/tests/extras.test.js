import {
  validarFoto,
  validarBairrosAcompanhados,
  bairrosDaConta,
  lembretesPendentes,
  momentoDoLembrete,
  FOTO,
} from '../src/dominio/extras.js';

const PNG_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('validarFoto', () => {
  test('foto é opcional', () => {
    expect(validarFoto(undefined)).toEqual({ valido: true, foto: null });
    expect(validarFoto('')).toEqual({ valido: true, foto: null });
  });

  test('aceita PNG pequeno e calcula o tamanho', () => {
    const r = validarFoto(PNG_1PX);
    expect(r.valido).toBe(true);
    expect(r.foto).toMatchObject({ tipo: 'image/png' });
    expect(r.foto.bytes).toBeGreaterThan(50);
  });

  test('recusa tipo que não é imagem permitida', () => {
    expect(validarFoto('data:image/gif;base64,R0lGODlhAQABAAAAACw=').erro).toBe('Use uma foto JPG, PNG ou WebP.');
  });

  test('recusa conteúdo que não é data URL', () => {
    expect(validarFoto('http://exemplo.com/foto.jpg').valido).toBe(false);
    expect(validarFoto({ arquivo: 'x' }).valido).toBe(false);
  });

  test('recusa foto acima do limite com o tamanho na mensagem', () => {
    const grande = `data:image/jpeg;base64,${'A'.repeat(Math.ceil((FOTO.bytesMaximos + 2048) / 3) * 4)}`;
    expect(validarFoto(grande).erro).toMatch(/grande demais \(\d+ KB\)/);
  });
});

describe('validarBairrosAcompanhados', () => {
  const bairros = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  test('remove repetidos e o bairro principal', () => {
    expect(validarBairrosAcompanhados(['b', 'b', 'a', 'c'], bairros, 'a')).toEqual({ valido: true, bairros: ['b', 'c'] });
  });

  test('recusa bairro inexistente', () => {
    expect(validarBairrosAcompanhados(['x'], bairros, 'a').valido).toBe(false);
  });

  test('limita a 5 bairros além do principal', () => {
    expect(validarBairrosAcompanhados(['b', 'c', 'd', 'e', 'f', 'g'], bairros, 'a').erro).toMatch(/até 5/);
  });

  test('exige uma lista', () => {
    expect(validarBairrosAcompanhados('b', bairros, 'a').valido).toBe(false);
  });

  test('bairrosDaConta junta principal e acompanhados', () => {
    expect(bairrosDaConta({ bairroId: 'a', bairrosAcompanhados: ['c'] })).toEqual(['a', 'c']);
    expect(bairrosDaConta({ bairroId: 'a' })).toEqual(['a']);
  });
});

describe('lembretes', () => {
  const agora = new Date('2026-11-05T12:00:00Z');
  const amanha = { id: 'e1', titulo: 'Amanhã', local: 'Praça', inicio: '2026-11-06T09:00:00Z' };
  const depois = { id: 'e2', titulo: 'Daqui 3 dias', local: 'Praça', inicio: '2026-11-08T09:00:00Z' };
  const passado = { id: 'e3', titulo: 'Ontem', local: 'Praça', inicio: '2026-11-04T09:00:00Z' };
  const cancelado = { id: 'e4', titulo: 'Cancelado', local: 'Praça', inicio: '2026-11-06T10:00:00Z', cancelado: true };
  const eventos = [amanha, depois, passado, cancelado];
  const inscricoes = eventos.map((e) => ({ eventoId: e.id, contaId: 'ana', ativa: true }));
  const conta = { id: 'ana', lembretes: true };

  test('o lembrete é marcado para 24 h antes do início', () => {
    expect(momentoDoLembrete(amanha).toISOString()).toBe('2026-11-05T09:00:00.000Z');
  });

  test('só aparecem eventos confirmados que começam nas próximas 24 h', () => {
    expect(lembretesPendentes({ conta, eventos, inscricoes, agora }).map((l) => l.eventoId)).toEqual(['e1']);
  });

  test('presença cancelada não gera lembrete', () => {
    const canceladas = inscricoes.map((i) => ({ ...i, ativa: false }));
    expect(lembretesPendentes({ conta, eventos, inscricoes: canceladas, agora })).toEqual([]);
  });

  test('lembretes desligados no perfil não aparecem', () => {
    expect(lembretesPendentes({ conta: { ...conta, lembretes: false }, eventos, inscricoes, agora })).toEqual([]);
  });

  test('inscrição de outra conta não gera lembrete', () => {
    expect(lembretesPendentes({ conta: { id: 'bia', lembretes: true }, eventos, inscricoes, agora })).toEqual([]);
  });
});
