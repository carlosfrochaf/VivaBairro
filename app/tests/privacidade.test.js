import { detectarDadosSensiveis } from '../src/dominio/privacidade.js';

const tipos = (...textos) => detectarDadosSensiveis(...textos).map((a) => a.tipo);

test.each([
  ['Ligue (11) 98765-4321', ['telefone']],
  ['Ligue 98765 4321', ['telefone']],
  ['CPF 123.456.789-09 achado', ['cpf']],
  ['Escreva para ana@exemplo.com', ['email']],
])('detecta dado pessoal em "%s"', (texto, esperado) => {
  expect(tipos(texto)).toEqual(esperado);
});

test('não acusa texto comum com número de endereço, horário ou data', () => {
  expect(tipos('Rua das Flores, 200. Encontro às 9h, dia 24/10.')).toEqual([]);
});

test('analisa vários campos e ignora valores vazios', () => {
  expect(tipos('Poste apagado', undefined, 'contato: ze@exemplo.com')).toEqual(['email']);
});
