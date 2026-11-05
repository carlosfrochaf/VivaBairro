import { validarAviso, validarEvento, LIMITES } from '../src/dominio/validacao.js';

const BAIRROS = ['jardim-aurora', 'centro'];
const avisoValido = {
  titulo: 'Banco quebrado na praça',
  categoria: 'infraestrutura',
  bairroId: 'jardim-aurora',
  local: 'Praça do Sol, perto do coreto',
  descricao: 'O banco de madeira perto do coreto está com a tábua solta.',
};

describe('validarAviso', () => {
  test('aceita um aviso completo e remove espaços das pontas', () => {
    const r = validarAviso({ ...avisoValido, titulo: '  Banco quebrado na praça  ' }, BAIRROS);
    expect(r.valido).toBe(true);
    expect(r.erros).toEqual({});
    expect(r.dados.titulo).toBe('Banco quebrado na praça');
  });

  test('aponta todos os campos obrigatórios vazios de uma vez', () => {
    const r = validarAviso({}, BAIRROS);
    expect(r.valido).toBe(false);
    expect(Object.keys(r.erros).sort()).toEqual(['bairroId', 'categoria', 'descricao', 'local', 'titulo']);
  });

  test('trata texto só com espaços como vazio', () => {
    const r = validarAviso({ ...avisoValido, titulo: '     ' }, BAIRROS);
    expect(r.erros.titulo).toBe('Informe um título.');
  });

  test('explica o tamanho mínimo e o tamanho atual', () => {
    const r = validarAviso({ ...avisoValido, titulo: 'Luz' }, BAIRROS);
    expect(r.erros.titulo).toBe('Use pelo menos 5 caracteres (agora são 3).');
  });

  test('recusa título acima do limite', () => {
    const r = validarAviso({ ...avisoValido, titulo: 'a'.repeat(LIMITES.titulo.max + 1) }, BAIRROS);
    expect(r.erros.titulo).toMatch(/no máximo 80/);
  });

  test('recusa categoria fora da lista', () => {
    expect(validarAviso({ ...avisoValido, categoria: 'politica' }, BAIRROS).erros.categoria).toBeDefined();
  });

  test('recusa bairro que não pertence ao município', () => {
    const r = validarAviso({ ...avisoValido, bairroId: 'bairro-inventado' }, BAIRROS);
    expect(r.erros.bairroId).toMatch(/não está disponível/);
  });

  test('ignora tipos inesperados sem quebrar', () => {
    const r = validarAviso({ titulo: 123, descricao: null, local: ['x'] }, BAIRROS);
    expect(r.valido).toBe(false);
    expect(r.erros.titulo).toBe('Informe um título.');
  });
});

describe('validarEvento', () => {
  const agora = new Date('2026-11-05T12:00:00Z');
  const eventoValido = {
    titulo: 'Mutirão da praça',
    descricao: 'Plantio de mudas e pintura dos bancos.',
    local: 'Coreto da Praça do Sol',
    bairroId: 'centro',
    inicio: '2026-11-08T12:00:00Z',
    fim: '2026-11-08T15:00:00Z',
  };

  test('aceita evento futuro sem limite de vagas', () => {
    const r = validarEvento(eventoValido, BAIRROS, agora);
    expect(r.valido).toBe(true);
    expect(r.dados.capacidade).toBeNull();
  });

  test('exige término depois do início', () => {
    const r = validarEvento({ ...eventoValido, fim: eventoValido.inicio }, BAIRROS, agora);
    expect(r.erros.fim).toBe('O término precisa ser depois do início.');
  });

  test('recusa início no passado', () => {
    const r = validarEvento({ ...eventoValido, inicio: '2026-11-01T12:00:00Z' }, BAIRROS, agora);
    expect(r.erros.inicio).toBe('O início precisa ser no futuro.');
  });

  test('recusa data em formato inválido', () => {
    const r = validarEvento({ ...eventoValido, inicio: '31/02/2026' }, BAIRROS, agora);
    expect(r.erros.inicio).toBe('Informe data e hora de início.');
  });

  test.each([['0'], ['-3'], ['2.5'], ['muitas'], [10001]])('recusa capacidade %p', (capacidade) => {
    expect(validarEvento({ ...eventoValido, capacidade }, BAIRROS, agora).erros.capacidade).toBeDefined();
  });

  test('converte capacidade em número inteiro', () => {
    expect(validarEvento({ ...eventoValido, capacidade: '25' }, BAIRROS, agora).dados.capacidade).toBe(25);
  });
});
